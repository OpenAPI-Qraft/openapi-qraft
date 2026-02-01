import { vi } from 'vitest';

const createMemFs = vi.hoisted(
  () => async (_fsOriginal: typeof import('node:fs')) => {
    const { Volume, createFsFromVolume } = await import('memfs');

    return createFsFromVolume(Volume.fromJSON({}));
  }
);

vi.mock('node:fs', async (importOriginal) => {
  return {
    default: await createMemFs(
      await importOriginal<typeof import('node:fs')>()
    ),
  };
});

vi.mock('fs', async (importOriginal) => {
  return {
    default: await createMemFs(await importOriginal<typeof import('fs')>()),
  };
});
