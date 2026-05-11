import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createFixture, transformQraftTreeShaking } from './harness.js';

describe('transformQraftTreeShaking explicit options clients', () => {
  it('splits explicit options clients across sibling callback scopes', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

function PetUpdateItem({ petId }: { petId: number }) {
  return api.pets.updatePet.useIsMutating(api.pets.updatePet.getMutationKey());
}

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api.pets.updatePet.useMutation(undefined, {
    mutationKey: api.pets.updatePet.getMutationKey(),
    async onMutate(variables) {
      const getQueryData = () => api.pets.updatePet.getMutationKey();
      const apiClient_pets_getPetById = () => null;
      const apiClient = createAPIClient(apiContext!);

      await apiClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient.pets.getPetById.getQueryData(petParams);

      apiClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      return { prevPet, getQueryData, apiClient_pets_getPetById };
    },
  });
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useIsMutating } from "@openapi-qraft/react/callbacks/useIsMutating";
      import { updatePet } from "./api/services/PetsService";
      import { getMutationKey } from "@openapi-qraft/react/callbacks/getMutationKey";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getPetById } from "./api/services/PetsService";
      import { getQueryData as _getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      const api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useIsMutating,
        getMutationKey
      }, APIClientContext);
      const _api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useMutation,
        getMutationKey
      }, APIClientContext);
      function PetUpdateItem({
        petId
      }: {
        petId: number;
      }) {
        return api_pets_updatePet.useIsMutating(api_pets_updatePet.getMutationKey());
      }
      function PetUpdateForm({
        petId
      }: {
        petId: number;
      }) {
        const apiContext = useContext(APIClientContext);
        const petParams = {
          path: {
            petId
          }
        };
        _api_pets_updatePet.useMutation(undefined, {
          mutationKey: _api_pets_updatePet.getMutationKey(),
          async onMutate(variables) {
            const getQueryData = () => _api_pets_updatePet.getMutationKey();
            const apiClient_pets_getPetById = () => null;
            const _apiClient_pets_getPetById = qraftAPIClient(getPetById, {
              cancelQueries,
              getQueryData: _getQueryData,
              setQueryData
            }, apiContext!);
            await _apiClient_pets_getPetById.cancelQueries({
              parameters: petParams
            });
            const prevPet = _apiClient_pets_getPetById.getQueryData(petParams);
            _apiClient_pets_getPetById.setQueryData(petParams, old => ({
              ...old,
              ...variables.body
            }));
            return {
              prevPet,
              getQueryData,
              apiClient_pets_getPetById
            };
          }
        });
      }"
    `);
  });

  it('optimizes inline explicit options clients', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

function PetUpdateForm() {
  const apiContext = useContext(APIClientContext);

  createAPIClient(apiContext!).pets.getPetById.setQueryData(
    { path: { petId: 1 } },
    { id: 1 }
  );

  createAPIClient(apiContext!).pets.findPetsByStatus.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { getPetById } from "./api/services/PetsService";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      function PetUpdateForm() {
        const apiContext = useContext(APIClientContext);
        qraftAPIClient(getPetById, {
          setQueryData
        }, apiContext!).setQueryData({
          path: {
            petId: 1
          }
        }, {
          id: 1
        });
        qraftAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiContext!).invalidateQueries();
      }"
      `);
  });

  it('optimizes mutation callbacks across onMutate, onError, and onSuccess', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  const onUpdate = () => {};

  api.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      const miniQraft = createAPIClient(apiContext!);
      miniQraft.pets.getPetById.getQueryKey();
      await miniQraft.pets.getPetById.cancelQueries({
        parameters: petParams,
      });

      const prevPet = miniQraft.pets.getPetById.getQueryData(petParams);

      miniQraft.pets.getPetById.setQueryData(petParams, (oldData) => ({
        ...oldData,
        ...variables.body,
      }));

      return { prevPet };
    },
    async onError(_error, _variables, context) {
      if (context?.prevPet) {
        createAPIClient(apiContext!).pets.getPetById.setQueryData(
          petParams,
          context.prevPet
        );
      }
    },
    async onSuccess(updatedPet) {
      const miniQraft = createAPIClient(apiContext!);
      miniQraft.pets.getPetById.setQueryData(petParams, updatedPet);
      miniQraft.pets.findPetsByStatus.getQueryKey();
      await miniQraft.pets.findPetsByStatus.invalidateQueries();
      onUpdate();
    },
  });
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { updatePet } from "./api/services/PetsService";
      import { getQueryKey } from "@openapi-qraft/react/callbacks/getQueryKey";
      import { getPetById } from "./api/services/PetsService";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getQueryData } from "@openapi-qraft/react/callbacks/getQueryData";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { findPetsByStatus } from "./api/services/PetsService";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      const api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useMutation
      }, APIClientContext);
      function PetUpdateForm({
        petId
      }: {
        petId: number;
      }) {
        const apiContext = useContext(APIClientContext);
        const petParams = {
          path: {
            petId
          }
        };
        const onUpdate = () => {};
        api_pets_updatePet.useMutation(undefined, {
          async onMutate(variables) {
            const miniQraft_pets_getPetById = qraftAPIClient(getPetById, {
              getQueryKey,
              cancelQueries,
              getQueryData,
              setQueryData
            }, apiContext!);
            miniQraft_pets_getPetById.getQueryKey();
            await miniQraft_pets_getPetById.cancelQueries({
              parameters: petParams
            });
            const prevPet = miniQraft_pets_getPetById.getQueryData(petParams);
            miniQraft_pets_getPetById.setQueryData(petParams, oldData => ({
              ...oldData,
              ...variables.body
            }));
            return {
              prevPet
            };
          },
          async onError(_error, _variables, context) {
            if (context?.prevPet) {
              qraftAPIClient(getPetById, {
                setQueryData
              }, apiContext!).setQueryData(petParams, context.prevPet);
            }
          },
          async onSuccess(updatedPet) {
            const miniQraft_pets_getPetById = qraftAPIClient(getPetById, {
              setQueryData
            }, apiContext!);
            const miniQraft_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
              getQueryKey,
              invalidateQueries
            }, apiContext!);
            miniQraft_pets_getPetById.setQueryData(petParams, updatedPet);
            miniQraft_pets_findPetsByStatus.getQueryKey();
            await miniQraft_pets_findPetsByStatus.invalidateQueries();
            onUpdate();
          }
        });
      }"
    `);
  });

  it('aliases generated names for explicit options clients inside nested function scopes', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';
import { useContext } from 'react';

const api = createAPIClient();

function PetUpdateForm({ petId }: { petId: number }) {
  const apiContext = useContext(APIClientContext);
  const petParams = { path: { petId } };

  api.pets.updatePet.useMutation(undefined, {
    async onMutate(variables) {
      // These bindings intentionally collide with generated names in this callback scope.
      const getQueryData = () => null;
      const _getQueryData = () => null;
      const apiClient_pets_getPetById = () => null;
      const _apiClient_pets_getPetById = () => null;
      const apiClient = createAPIClient(apiContext!);

      function syncPetPreview() {
        // This binding intentionally collides with the optimized client name from the outer scope.
        const _apiClient_pets_getPetById2 = () => null;
        const apiClient = createAPIClient(apiContext!);

        apiClient.pets.getPetById.setQueryData(petParams, variables.body);
      }

      await apiClient.pets.getPetById.cancelQueries({ parameters: petParams });
      const prevPet = apiClient.pets.getPetById.getQueryData(petParams);

      apiClient.pets.getPetById.setQueryData(petParams, (old) => ({
        ...old,
        ...variables.body,
      }));

      syncPetPreview();

      return { prevPet };
    },
  });
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { useContext } from 'react';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useMutation } from "@openapi-qraft/react/callbacks/useMutation";
      import { updatePet } from "./api/services/PetsService";
      import { setQueryData } from "@openapi-qraft/react/callbacks/setQueryData";
      import { getPetById } from "./api/services/PetsService";
      import { cancelQueries } from "@openapi-qraft/react/callbacks/cancelQueries";
      import { getQueryData as _getQueryData2 } from "@openapi-qraft/react/callbacks/getQueryData";
      const api_pets_updatePet = qraftReactAPIClient(updatePet, {
        useMutation
      }, APIClientContext);
      function PetUpdateForm({
        petId
      }: {
        petId: number;
      }) {
        const apiContext = useContext(APIClientContext);
        const petParams = {
          path: {
            petId
          }
        };
        api_pets_updatePet.useMutation(undefined, {
          async onMutate(variables) {
            // These bindings intentionally collide with generated names in this callback scope.
            const getQueryData = () => null;
            const _getQueryData = () => null;
            const apiClient_pets_getPetById = () => null;
            const _apiClient_pets_getPetById = () => null;
            const _apiClient_pets_getPetById4 = qraftAPIClient(getPetById, {
              cancelQueries,
              getQueryData: _getQueryData2,
              setQueryData
            }, apiContext!);
            function syncPetPreview() {
              // This binding intentionally collides with the optimized client name from the outer scope.
              const _apiClient_pets_getPetById2 = () => null;
              const _apiClient_pets_getPetById3 = qraftAPIClient(getPetById, {
                setQueryData
              }, apiContext!);
              _apiClient_pets_getPetById3.setQueryData(petParams, variables.body);
            }
            await _apiClient_pets_getPetById4.cancelQueries({
              parameters: petParams
            });
            const prevPet = _apiClient_pets_getPetById4.getQueryData(petParams);
            _apiClient_pets_getPetById4.setQueryData(petParams, old => ({
              ...old,
              ...variables.body
            }));
            syncPetPreview();
            return {
              prevPet
            };
          }
        });
      }"
    `);
  });

  it('preserves void and await prefixes for named and inline client calls', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient, APIClientContext } from './api';

async function run() {
  const api = createAPIClient();
  const apiOptions = APIClientContext;
  void api.pets.findPetsByStatus.invalidateQueries();
  await api.pets.findPetsByStatus.invalidateQueries();
  void createAPIClient(apiOptions!).pets.findPetsByStatus.invalidateQueries();
  await createAPIClient(apiOptions!).pets.findPetsByStatus.invalidateQueries();
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { APIClientContext } from './api';
      import { qraftAPIClient } from "@openapi-qraft/react";
      import { invalidateQueries } from "@openapi-qraft/react/callbacks/invalidateQueries";
      import { findPetsByStatus } from "./api/services/PetsService";
      async function run() {
        const api_pets_findPetsByStatus = qraftAPIClient(findPetsByStatus, {
          invalidateQueries
        }, APIClientContext);
        const apiOptions = APIClientContext;
        void api_pets_findPetsByStatus.invalidateQueries();
        await api_pets_findPetsByStatus.invalidateQueries();
        void qraftAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiOptions!).invalidateQueries();
        await qraftAPIClient(findPetsByStatus, {
          invalidateQueries
        }, apiOptions!).invalidateQueries();
      }"
    `);
  });
});
