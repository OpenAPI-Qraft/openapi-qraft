import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import constate from 'constate';

import { components } from '../schema';
import { createAPIClient } from './api';

const qraft = createAPIClient();

function App() {
  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 20 }}>
      <PetListFilter />
      <PetList />
    </div>
  );
}

function PetListFilter() {
  const { status, setStatus } = useFilterStatus();
  return (
    <div>
      <label htmlFor="status">Select Status:</label>
      <select
        name="status"
        value={status}
        onChange={(event) => {
          setStatus(event.target.value as typeof status);
        }}
      >
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
      </select>
    </div>
  );
}

function PetList() {
  const { status } = useFilterStatus();
  const { petId } = usePetForm();
  const { data, isPending } = qraft.pet.findPetsByStatus.useQuery({
    query: { status },
  });
  const {
    data: petById,
    isPending: isPetByIdPending,
    error: petByIdError,
  } = qraft.pet.getPetById.useQuery(
    { path: { petId: petId ?? 0 } },
    { enabled: !!petId }
  );

  if (isPending) return <div>Loading...</div>;

  if (petId) {
    if (isPetByIdPending)
      return (
        <div>
          Loading <strong>{petId}</strong>...
        </div>
      );

    if (petById) return <PetForm pet={petById} />;

    if (petByIdError)
      return (
        <div>
          Error:{' '}
          {petByIdError instanceof Error
            ? petByIdError.message
            : JSON.stringify(petByIdError)}
        </div>
      );
  }

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

function PetForm({ pet }: { pet: components['schemas']['Pet'] }) {
  const { setPetId } = usePetForm();

  const queryClient = useQueryClient();
  const { isPending, mutate } = qraft.pet.updatePet.useMutation(undefined, {
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: qraft.pet.findPetsByStatus.getQueryKey({}),
      });
      setPetId(null);
    },
  });

  return (
    <form
      id="updatePetForm"
      style={{ display: 'flex', flexFlow: 'column', gap: 10, maxWidth: 300 }}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        mutate({
          body: {
            id: pet.id,
            photoUrls: pet.photoUrls, // required by schema
            status: formData.get('status') as typeof pet.status,
            name: formData.get('name') as typeof pet.name,
          },
        });
      }}
    >
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
      <select
        id="status"
        name="status"
        defaultValue={pet.status}
        aria-busy={isPending}
        disabled={isPending}
        required
      >
        <option value="available">Available</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
      </select>

      <button type="submit" disabled={isPending}>
        Update Pet
      </button>
    </form>
  );
}

const [UseFilterStatusProvider, useFilterStatus] = constate(() => {
  const [status, setStatus] = useState<'available' | 'pending' | 'sold'>(
    'available'
  );

  return { status, setStatus };
});

const [UsePetFormProvider, usePetForm] = constate(() => {
  const [petId, setPetId] = useState<number | null>(null);

  return { petId, setPetId };
});

export default function () {
  return (
    <UseFilterStatusProvider>
      <UsePetFormProvider>
        <App />
      </UsePetFormProvider>
    </UseFilterStatusProvider>
  );
}
