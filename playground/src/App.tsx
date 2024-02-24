import { ComponentProps, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import constate from 'constate';

import { components } from '../schema';
import { createAPIClient } from './api';

const qraft = createAPIClient();

function App() {
  const { petId } = usePetForm();
  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 20 }}>
      <PetListFilter />
      {petId ? <PetForm petId={petId} /> : <PetList />}
    </div>
  );
}

function PetListFilter() {
  const { status, setStatus } = useFilterStatus();
  return (
    <div>
      <label htmlFor="status">Select Status:</label>{' '}
      <StatusesSelect
        name="status"
        value={status}
        onChange={(event) => {
          setStatus((event.target.value as typeof status) || undefined);
        }}
      />
    </div>
  );
}

function PetList() {
  const { status } = useFilterStatus();
  const { data, error, isPending } = qraft.pet.findPetsByStatus.useQuery({
    query: { status },
  });

  if (error) return <div>{getErrorMessage(error)}</div>;
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
  const { setPetId } = usePetForm();

  return (
    <div
      key={pet.id}
      style={{
        border: '1px solid',
        padding: 10,
        position: 'relative',
      }}
    >
      <dl>
        <dt>Name:</dt>
        <dd>{pet.name}</dd>
        <dt>ID:</dt>
        <dd>{pet.id}</dd>
        <dt>Category:</dt>
        <dd>{pet.category?.name}</dd>
        <dt>Status:</dt>
        <dd>{pet.status}</dd>
      </dl>

      <button
        style={{ right: 10, top: 10, position: 'absolute' }}
        onClick={(event) => {
          event.preventDefault();
          if (!pet.id) throw new Error('pet.id not found');
          setPetId(pet.id);
        }}
      >
        Edit
      </button>
    </div>
  );
}

function PetForm({ petId }: { petId: number }) {
  const { setPetId } = usePetForm();

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
      await queryClient.invalidateQueries({
        // todo::add helper to invalidate by service operation
        queryKey: qraft.pet.findPetsByStatus.getQueryKey(),
      });
      setPetId(undefined);
    },
  });

  return (
    <form
      id="updatePetForm"
      style={{ display: 'flex', flexFlow: 'column', gap: 10, maxWidth: 300 }}
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
        setPetId(undefined);
      }}
    >
      {isPetQueryPending && <div>Loading...</div>}

      {!!petQueryError && (
        <div>
          {getErrorMessage(petQueryError)} <button type="reset">Reset</button>
        </div>
      )}

      {!isPetQueryPending && !pet && (
        <div>
          Pet <strong>{petId}</strong> not found{' '}
          <button type="reset">Close</button>
        </div>
      )}

      {pet && (
        <>
          <label>
            Pet ID: <strong>{pet.id}</strong>
          </label>

          <label htmlFor="name">Name:</label>
          <input
            readOnly={isPending}
            aria-busy={isPending}
            type="text"
            id="name"
            name="name"
            defaultValue={pet.name}
            required
          />

          <label htmlFor="status">Status:</label>
          <StatusesSelect
            id="status"
            name="status"
            defaultValue={pet.status}
            aria-busy={isPending}
            disabled={isPending}
            required
          />

          <button type="submit" disabled={isPending}>
            Update Pet
          </button>

          <button type="reset" disabled={isPending}>
            Cancel
          </button>
        </>
      )}
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

const [UsePetFormProvider, usePetForm] = constate(() => {
  const [petId, setPetId] = useState<number>();

  return { petId, setPetId };
});

function getErrorMessage(error: unknown) {
  return `Error: ${
    error instanceof Error ? error.message : JSON.stringify(error)
  }`;
}

export default function () {
  return (
    <UseFilterStatusProvider>
      <UsePetFormProvider>
        <App />
      </UsePetFormProvider>
    </UseFilterStatusProvider>
  );
}
