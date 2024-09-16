import {
  OperationSchema,
  QraftClientOptions,
  requestFn,
  RequestFnPayload,
  RequestFnResponse,
} from '@openapi-qraft/react';
import { QraftSecureRequestFn } from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';
import { components, createAPIClient, Services } from './api';

function AppComponent() {
  const [petIdToEdit, setPetIdToEditToEdit] = useState<number | null>(null);
  const [petStatusToCreate, setPetStatusToCreate] = useState<PetStatus | null>(
    null
  );
  const [petsFilter, setPetsFilter] = useState<PetsFilter>({
    status: 'available',
  });

  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 20 }}>
      {!petIdToEdit && !petStatusToCreate && (
        <PetListFilter
          onCreate={setPetStatusToCreate}
          petsFilter={petsFilter}
          setPetsFilter={setPetsFilter}
        />
      )}

      {petIdToEdit && (
        <PetUpdateForm
          petId={petIdToEdit}
          onUpdate={() => setPetIdToEditToEdit(null)}
          onReset={() => setPetIdToEditToEdit(null)}
        />
      )}
      {!petIdToEdit && petStatusToCreate && (
        <PetCreateForm
          status={petStatusToCreate}
          onCreate={() => setPetStatusToCreate(null)}
          onReset={() => setPetStatusToCreate(null)}
        />
      )}
      {!petIdToEdit && !petStatusToCreate && (
        <PetList petsFilter={petsFilter} onEdit={setPetIdToEditToEdit} />
      )}
    </div>
  );
}

function PetListFilter({
  petsFilter,
  onCreate,
  setPetsFilter,
}: {
  petsFilter: PetsFilter;
  onCreate: (petStatusToCreate: PetStatus) => void;
  setPetsFilter: (petsFilter: PetsFilter) => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const status = new FormData(event.currentTarget).get('status');
        assertPetStatus(status);
        onCreate(status);
      }}
    >
      <label htmlFor="status">Select Status:</label>{' '}
      <StatusesSelect
        name="status"
        value={petsFilter.status}
        onChange={(event) => {
          const status = event.target.value;
          assertPetStatus(status);
          setPetsFilter({
            ...petsFilter,
            status,
          });
        }}
      />
      <button type="submit" style={{ marginLeft: 10 }}>
        Add new Pet
      </button>
    </form>
  );
}

function PetList({
  petsFilter,
  onEdit,
}: {
  petsFilter: PetsFilter;
  onEdit: (petId: number) => void;
}) {
  const qraft = useCreateAPIClient();
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
      {data?.map((pet) => (
        <PetCard
          key={pet.id}
          pet={pet}
          onEdit={() => {
            if (!pet.id) throw new Error('pet.id not found');
            onEdit(pet.id);
          }}
        />
      ))}
    </div>
  );
}

function PetCard({
  pet,
  onEdit,
}: {
  pet: components['schemas']['Pet'];
  onEdit: () => void;
}) {
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
          onEdit();
        }}
      >
        Edit
      </button>
    </div>
  );
}

function PetUpdateForm({
  petId,
  onUpdate,
  onReset,
}: {
  petId: number;
  onUpdate: () => void;
  onReset: () => void;
}) {
  const qraft = useCreateAPIClient();

  const petParameters: typeof qraft.pet.getPetById.types.parameters = {
    path: { petId },
  };

  const {
    data: pet,
    isPending: isPetQueryPending,
    error: petQueryError,
  } = qraft.pet.getPetById.useQuery(petParameters, { enabled: !!petId });

  const { isPending, mutate } = qraft.pet.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      await qraft.pet.getPetById.cancelQueries({ parameters: petParameters });

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
      await qraft.pet.findPetsByStatus.invalidateQueries();
      onUpdate();
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
            const status = formData.get('status');
            assertPetStatus(status);
            mutate({
              body: {
                id: pet.id,
                status,
                name: String(formData.get('name')),
                photoUrls: pet.photoUrls, // required by schema
              },
            });
          }}
          onReset={(event) => {
            event.preventDefault();
            onReset();
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
  onCreate,
  onReset,
}: {
  status: Services['pet']['addPet']['types']['body']['status'];
  onCreate: (pet: components['schemas']['Pet']) => void;
  onReset: () => void;
}) {
  const qraft = useCreateAPIClient();

  const { isPending, mutate, error } = qraft.pet.addPet.useMutation(undefined, {
    async onSuccess(createdPet) {
      await qraft.pet.findPetsByStatus.invalidateQueries();
      if (!createdPet)
        throw new Error('createdPet not found in addPet.onSuccess');
      onCreate(createdPet);
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
        onReset();
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

function useCreateAPIClient(options?: Partial<QraftClientOptions>) {
  const apiContextValue = useContext(APIContext);

  const requestFn = options?.requestFn ?? apiContextValue?.requestFn;
  const baseUrl = options?.baseUrl ?? apiContextValue?.baseUrl;
  const queryClient = useQueryClient(
    options && 'queryClient' in options ? options?.queryClient : undefined
  );

  if (!requestFn)
    throw new Error('requestFn not found in APIContext or options');
  if (!baseUrl) throw new Error('baseUrl not found in APIContext or options');

  return createAPIClient({
    requestFn,
    baseUrl,
    queryClient,
  });
}

type PetStatus = NonNullable<components['schemas']['Pet']['status']>;

export interface APIContextValue {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;

  /**
   * The `requestFn` will be invoked with every request.
   */
  requestFn<TData, TError>(
    requestSchema: OperationSchema,
    requestInfo: RequestFnPayload
  ): Promise<RequestFnResponse<TData, TError>>;

  /** The QueryClient to use in Hooks */
  queryClient?: QueryClient;
}

export const APIContext = createContext<APIContextValue | undefined>(undefined);

function assertPetStatus(
  petStatusToCreate: unknown
): asserts petStatusToCreate is PetStatus {
  if (
    !Object.values({
      available: 'available',
      pending: 'pending',
      sold: 'sold',
    } satisfies {
      // A type-safe check ensuring all possible PetStatusToCreate values are included
      [key in PetStatus]: key;
    }).includes(petStatusToCreate as never)
  )
    throw new Error('petStatusToCreate not found in PetStatusToCreate');
}

type PetsFilter = {
  status: 'available' | 'pending' | 'sold';
};

export default function App() {
  return (
    <QraftProviders>
      <AppComponent />
    </QraftProviders>
  );
}
