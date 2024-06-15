import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

import {
  OperationSchema,
  QraftClientOptions,
  requestFn,
  RequestFnPayload,
} from '@openapi-qraft/react';
import { QraftSecureRequestFn } from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

import constate from 'constate';

import { createAPIClient, Services } from './api';
import { components } from './api/schema';

function AppComponent() {
  const { petIdToEdit } = usePetToEdit();
  const { petStatusToCreate } = usePetStatusToCreate();

  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 20 }}>
      {!petIdToEdit && !petStatusToCreate && <PetListFilter />}

      {petIdToEdit && <PetUpdateForm petId={petIdToEdit} />}
      {!petIdToEdit && petStatusToCreate && (
        <PetCreateForm status={petStatusToCreate} />
      )}
      {!petIdToEdit && !petStatusToCreate && <PetList />}
    </div>
  );
}

function PetListFilter() {
  const { petStatusToCreate, setPetStatusToCreate } = usePetStatusToCreate();

  const { petsFilter, setPetsFilter } = usePetsFilter();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setPetStatusToCreate(
          formData.get('status') as typeof petStatusToCreate
        );
      }}
    >
      <label htmlFor="status">Select Status:</label>{' '}
      <StatusesSelect
        name="status"
        value={petsFilter.status}
        onChange={(event) => {
          setPetsFilter((prev) => ({
            ...prev,
            status: event.target.value as typeof prev.status,
          }));
        }}
      />
      <button type="submit" style={{ marginLeft: 10 }}>
        Add new Pet
      </button>
    </form>
  );
}

function PetList() {
  const qraft = useCreateAPIClient();
  const { petsFilter } = usePetsFilter();
  const { data, error, isPending } = qraft.pet.findPetsByStatus.useQuery({
    query: { status: petsFilter.status },
  });

  if (error)
    return <div style={{ color: 'red' }}>{getErrorMessage(error)}</div>;
  if (isPending) return <div>Loading...</div>;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridAutoRows: 'auto',
        gap: 20,
      }}
    >
      {data?.map((pet) => <PetCard key={pet.id} pet={pet} />)}
    </div>
  );
}

function PetCard({ pet }: { pet: components['schemas']['Pet'] }) {
  const { setPetIdToEditToEdit } = usePetToEdit();

  return (
    <div
      key={pet.id}
      style={{
        border: '1px solid',
        padding: 10,
        position: 'relative',
        wordBreak: 'break-word',
      }}
    >
      <dl>
        <dt>Name:</dt>
        <dd>{pet.name}</dd>
        <dt>ID:</dt>
        <dd>{pet.id}</dd>
        <dt>Category:</dt>
        <dd>{pet.category?.name || <code>not specified</code>}</dd>
        <dt>Status:</dt>
        <dd>{pet.status}</dd>
      </dl>

      <button
        style={{ right: 10, top: 10, position: 'absolute' }}
        onClick={(event) => {
          event.preventDefault();
          if (!pet.id) throw new Error('pet.id not found');
          setPetIdToEditToEdit(pet.id);
        }}
      >
        Edit
      </button>
    </div>
  );
}

function PetUpdateForm({ petId }: { petId: number }) {
  const { setPetIdToEditToEdit } = usePetToEdit();
  const qraft = useCreateAPIClient();

  const petParameters: typeof qraft.pet.getPetById.types.parameters = {
    path: { petId },
  };

  const {
    data: pet,
    isPending: isPetQueryPending,
    error: petQueryError,
  } = qraft.pet.getPetById.useQuery(petParameters, { enabled: !!petId });

  const queryClient = useQueryClient();

  const { isPending, mutate } = qraft.pet.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      await qraft.pet.getPetById.cancelQueries(
        { parameters: petParameters },
        queryClient
      );

      const prevPet = qraft.pet.getPetById.getQueryData(petParameters);

      qraft.pet.getPetById.setQueryData(petParameters, (oldData) => ({
        ...oldData,
        ...variables.body,
      }));

      return { prevPet };
    },
    async onError(_error, _variables, context) {
      if (context?.prevPet) {
        qraft.pet.getPetById.setQueryData(petParameters, context.prevPet);
      }
    },
    async onSuccess(updatedPet) {
      qraft.pet.getPetById.setQueryData(petParameters, updatedPet);
      await qraft.pet.findPetsByStatus.invalidateQueries(queryClient);
      setPetIdToEditToEdit(undefined);
    },
  });

  return (
    <>
      {isPetQueryPending && <div>Loading...</div>}

      {!!petQueryError && (
        <div>
          <span style={{ color: 'error' }}>
            {getErrorMessage(petQueryError)}
          </span>
          <button type="reset" style={{ marginLeft: 10 }}>
            Reset
          </button>
        </div>
      )}

      {!isPetQueryPending && !pet && (
        <div>
          Pet <strong>{petId}</strong> not found{' '}
          <button type="reset">Close</button>
        </div>
      )}

      {pet && (
        <PetForm
          pet={pet}
          disabled={isPending}
          formMode="update"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            if (!pet) throw new Error('pet not found');
            mutate({
              body: {
                id: pet.id,
                photoUrls: pet.photoUrls, // required by schema
                status: formData.get('status') as typeof pet.status,
                name: formData.get('name') as typeof pet.name,
              },
            });
          }}
          onReset={(event) => {
            event.preventDefault();
            setPetIdToEditToEdit(undefined);
          }}
          id="updatePetForm"
          style={{
            display: 'flex',
            flexFlow: 'column',
            gap: 10,
            maxWidth: 300,
          }}
        />
      )}
    </>
  );
}

function PetCreateForm({
  status,
}: {
  status: Services['pet']['addPet']['types']['body']['status'];
}) {
  const { setPetIdToEditToEdit } = usePetToEdit();
  const { setPetStatusToCreate } = usePetStatusToCreate();

  const queryClient = useQueryClient();
  const qraft = useCreateAPIClient();

  const { isPending, mutate, error } = qraft.pet.addPet.useMutation(undefined, {
    async onSuccess(createdPet) {
      await qraft.pet.findPetsByStatus.invalidateQueries(queryClient);
      if (!createdPet)
        throw new Error('createdPet not found in addPet.onSuccess');
      setPetIdToEditToEdit(createdPet.id);
    },
  });

  return (
    <PetForm
      pet={{ status }}
      disabled={isPending}
      formMode="create"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutate({
          body: {
            status: formData.get(
              'status'
            ) as typeof qraft.pet.addPet.types.body.status,
            name: formData.get(
              'name'
            ) as typeof qraft.pet.addPet.types.body.name,
            photoUrls: [],
          },
        });
      }}
      onReset={(event) => {
        event.preventDefault();
        setPetStatusToCreate(undefined);
      }}
      id="updatePetForm"
      style={{
        display: 'flex',
        flexFlow: 'column',
        gap: 10,
        maxWidth: 300,
      }}
    >
      {!!error && <div style={{ color: 'red' }}>{getErrorMessage(error)}</div>}
    </PetForm>
  );
}

function PetForm({
  formMode,
  pet,
  disabled,
  children,
  ...restProps
}: {
  formMode: 'create' | 'update';
  pet: Partial<components['schemas']['Pet']> | undefined;
  disabled: boolean;
} & ComponentProps<'form'>) {
  return (
    <form {...restProps}>
      {children}

      {formMode === 'update' ? (
        <label>
          Pet ID: <strong>{pet?.id}</strong>
        </label>
      ) : (
        <label>Creating new pet</label>
      )}

      <label htmlFor="name">Name:</label>
      <input
        readOnly={disabled}
        aria-busy={disabled}
        type="text"
        id="name"
        name="name"
        defaultValue={pet?.name}
        required
      />

      <label htmlFor="status">Status:</label>
      <StatusesSelect
        id="status"
        name="status"
        defaultValue={pet?.status}
        aria-busy={disabled}
        disabled={disabled}
        required
      />

      <button type="submit" disabled={disabled}>
        {formMode === 'update' ? 'Update Pet' : 'Create Pet'}
      </button>

      <button type="reset" disabled={disabled}>
        Cancel
      </button>
    </form>
  );
}

const StatusesSelect = (props: Omit<ComponentProps<'select'>, 'children'>) => {
  return (
    <select {...props}>
      <option value="available">Available</option>
      <option value="pending">Pending</option>
      <option value="sold">Sold</option>
    </select>
  );
};

const [UsePetsFilterProvider, usePetsFilter] = constate(() => {
  const [petsFilter, setPetsFilter] = useState<{
    status: 'available' | 'pending' | 'sold';
    limit: number;
    page: 1;
  }>({ status: 'available', limit: 4, page: 1 });

  return { petsFilter, setPetsFilter };
});

const [UsePetToEditProvider, usePetToEdit] = constate(() => {
  const [petIdToEdit, setPetIdToEditToEdit] = useState<number>();

  return { petIdToEdit, setPetIdToEditToEdit };
});

const [UsePetStatusToCreateProvider, usePetStatusToCreate] = constate(() => {
  const [petStatusToCreate, setPetStatusToCreate] = useState<
    'available' | 'pending' | 'sold'
  >();

  return { petStatusToCreate, setPetStatusToCreate };
});

function getErrorMessage(error: unknown) {
  return `Error: ${
    error instanceof Error ? error.message : JSON.stringify(error)
  }`;
}

export const QraftProviders = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QraftSecureRequestFn
      requestFn={requestFn}
      securitySchemes={{
        // Can be sync or async
        api_key() {
          return {
            in: 'header',
            name: 'api_key',
            value: 'special-key',
          };
        },
      }}
    >
      {(secureRequestFn) => (
        <QueryClientProvider client={queryClient}>
          <APIContext.Provider
            value={{
              baseUrl: 'https://petstore3.swagger.io/api/v3',
              requestFn: secureRequestFn,
            }}
          >
            {children}
          </APIContext.Provider>
        </QueryClientProvider>
      )}
    </QraftSecureRequestFn>
  );
};

export function useCreateAPIClient(options?: Partial<QraftClientOptions>) {
  const apiContextValue = useContext(APIContext);

  const requestFn = options?.requestFn ?? apiContextValue?.requestFn;
  const baseUrl = options?.baseUrl ?? apiContextValue?.baseUrl;
  const queryClient = useQueryClient(options?.queryClient);

  if (!requestFn)
    throw new Error('requestFn not found in APIContext or options');
  if (!baseUrl) throw new Error('baseUrl not found in APIContext or options');

  return createAPIClient({
    requestFn,
    baseUrl,
    queryClient,
  });
}

export interface APIContextValue {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;

  /**
   * The `requestFn` will be invoked with every request.
   */
  requestFn<T>(
    requestSchema: OperationSchema,
    requestInfo: RequestFnPayload
  ): Promise<T>;

  /** The QueryClient to use in Hooks */
  queryClient?: QueryClient;
}

export const APIContext = createContext<APIContextValue | undefined>(undefined);

export default function App() {
  return (
    <QraftProviders>
      <UsePetsFilterProvider>
        <UsePetToEditProvider>
          <UsePetStatusToCreateProvider>
            <AppComponent />
          </UsePetStatusToCreateProvider>
        </UsePetToEditProvider>
      </UsePetsFilterProvider>
    </QraftProviders>
  );
}
