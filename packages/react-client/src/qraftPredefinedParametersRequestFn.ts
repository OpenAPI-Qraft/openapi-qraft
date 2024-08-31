import type {
  OperationSchema,
  RequestFn,
  RequestFnInfo,
  RequestFnOptions,
  RequestFnResponse,
} from './lib/requestFn.js';
import { shelfMerge } from './lib/shelfMerge.js';

export type QraftPredefinedParameterValue<T> = T extends () => Promise<infer R>
  ? R | undefined
  : T | undefined;

export type InputPredefinedParametersItem<TValue> = {
  requestPattern: string;
  parameters: Array<{
    in: 'header' | 'query' | 'cookie';
    name: string;
    value: QraftPredefinedParameterValue<TValue>;
  }>;
};

type TargetPredefinedParametersMethods =
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete'
  | 'options'
  | 'head'
  | 'trace';

export type TargetPredefinedParametersItem = {
  requestPattern: string;
  methods:
    | Array<TargetPredefinedParametersMethods>
    | ReadonlyArray<Readonly<TargetPredefinedParametersMethods>>;
  paths: Array<string> | ReadonlyArray<Readonly<string>>;
};

export function qraftPredefinedParametersRequestFn<
  TInputPredefinedParametersItem extends InputPredefinedParametersItem<any>,
  TData,
  TError,
>(
  inputPredefinedParameters:
    | Array<TInputPredefinedParametersItem>
    | ReadonlyArray<Readonly<TInputPredefinedParametersItem>>,
  targetPredefinedParameters:
    | Array<TargetPredefinedParametersItem>
    | ReadonlyArray<Readonly<TargetPredefinedParametersItem>>,
  requestFn: RequestFn<TData, TError>
): RequestFn<TData, TError> {
  return function predefinedParametersRequestFn(
    schema: OperationSchema,
    requestInfo: RequestFnInfo,
    options?: RequestFnOptions
  ): Promise<RequestFnResponse<TData, TError>> {
    const matchingInputPredefinedParameters =
      targetPredefinedParameters.flatMap((targetParameter) =>
        targetParameter.paths.includes(schema.url) &&
        (!targetParameter.methods.length ||
          targetParameter.methods.includes(schema.method))
          ? inputPredefinedParameters.filter(
              (predefinedParameter) =>
                predefinedParameter.requestPattern ===
                targetParameter.requestPattern
            )
          : []
      );

    if (!matchingInputPredefinedParameters?.length)
      return requestFn(schema, requestInfo, options);

    return Promise.all(
      matchingInputPredefinedParameters.map((item) =>
        resolveQraftPredefinedParameters(item.parameters)
      )
    ).then((resolvedPredefinedParameters) => {
      const mergedParameters = resolvedPredefinedParameters.reduce(
        (acc, item) => {
          acc = shelfMerge(2, acc, item);
          return acc;
        },
        {}
      );

      return requestFn(
        schema,
        {
          ...requestInfo,
          parameters: shelfMerge(2, mergedParameters, requestInfo.parameters),
        },
        options
      );
    });
  };
}

async function resolveQraftPredefinedParameters<T>(
  predefinedParameters: InputPredefinedParametersItem<T>['parameters']
) {
  return Promise.all(
    predefinedParameters.map(async (predefinedParameter) => {
      return {
        ...predefinedParameter,
        value: await resolveQraftPredefinedParameterValue(
          predefinedParameter.value
        ),
      };
    })
  ).then((resolvedPredefinedParameters) =>
    resolvedPredefinedParameters
      .filter(
        (resolvedPredefinedParameter) =>
          resolvedPredefinedParameter.value !== undefined
      )
      .reduce(
        (acc, resolvedPredefinedParameter) => {
          acc[resolvedPredefinedParameter.in] =
            acc[resolvedPredefinedParameter.in] ?? {};

          acc[resolvedPredefinedParameter.in][
            resolvedPredefinedParameter.name
          ] = resolvedPredefinedParameter.value;

          return acc;
        },
        {} as Record<string, Record<string, unknown>>
      )
  );
}

async function resolveQraftPredefinedParameterValue<T>(
  value: QraftPredefinedParameterValue<T>
): Promise<T | undefined> {
  if (value && typeof value === 'function')
    return (await value()) as T | undefined;
  return value as T | undefined;
}
