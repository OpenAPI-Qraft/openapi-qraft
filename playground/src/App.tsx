import { ComponentProps, ReactNode, useState } from 'react';

import {
  bodySerializer,
  QraftContext,
  request,
  urlSerializer,
} from '@openapi-qraft/react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';

import constate from 'constate';

import { components } from '../schema';
import { createAPIClient } from './api';

const qraft = createAPIClient();

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

  const { status, setStatus } = useFilterStatus();
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
        value={status}
        onChange={(event) => {
          setStatus((event.target.value as typeof status) || undefined);
        }}
      />
      <button type="submit" style={{ marginLeft: 10 }}>
        Add new Pet
      </button>
    </form>
  );
}

function PetList() {
  const { status } = useFilterStatus();
  const { data, error, isPending } = qraft.pet.findPetsByStatus.useQuery({
    query: { status },
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

  const petQueryKey = qraft.pet.getPetById.getQueryKey({
    path: { petId },
  });

  const {
    data: pet,
    isPending: isPetQueryPending,
    error: petQueryError,
  } = qraft.pet.getPetById.useQuery(petQueryKey, { enabled: !!petId });

  const queryClient = useQueryClient();

  const { isPending, mutate } = qraft.pet.updatePet.useMutation(undefined, {
    onMutate(variables) {
      qraft.pet.getPetById.setQueryData(
        petQueryKey,
        (oldData) => ({
          ...oldData,
          ...variables.body,
        }),
        queryClient
      );
    },
    async onSuccess(updatedPet) {
      qraft.pet.getPetById.setQueryData(petQueryKey, updatedPet, queryClient);
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
  status: typeof qraft.pet.addPet.types.body.status;
}) {
  const { setPetIdToEditToEdit } = usePetToEdit();
  const { setPetStatusToCreate } = usePetStatusToCreate();

  const queryClient = useQueryClient();

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

const [UseFilterStatusProvider, useFilterStatus] = constate(() => {
  const [status, setStatus] = useState<'available' | 'pending' | 'sold'>(
    'available'
  );

  return { status, setStatus };
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
    <QueryClientProvider client={queryClient}>
      <QraftContext.Provider
        value={{
          async requestClient(schema, options) {
            return request(
              {
                baseUrl: 'https://petstore3.swagger.io/api/v3',
              },
              {
                ...schema,
                ...options,
              },
              { urlSerializer, bodySerializer }
            );
          },
        }}
      >
        {children}
      </QraftContext.Provider>
    </QueryClientProvider>
  );
};

export default function App() {
  return (
    <QraftProviders>
      <UseFilterStatusProvider>
        <UsePetToEditProvider>
          <UsePetStatusToCreateProvider>
            <AppComponent />
          </UsePetStatusToCreateProvider>
        </UsePetToEditProvider>
      </UseFilterStatusProvider>
    </QraftProviders>
  );
}
