import { vi } from 'vitest';

type VirtualFs = typeof import('node:fs') & {
  promises: typeof import('node:fs/promises');
};

async function createVirtualFs(fsOriginal: typeof import('node:fs')) {
  const { Volume, createFsFromVolume } = await import('memfs');
  const { ufs } = await import('unionfs');

  const memFs = createFsFromVolume(Volume.fromJSON({}));
  const union = ufs.use(memFs as never).use(fsOriginal as never);

  if (union.promises && typeof fsOriginal.promises?.rm === 'function') {
    const memFsPromises = (
      memFs as {
        promises?: { rm?: (path: string, options?: object) => Promise<void> };
      }
    ).promises;
    (
      union.promises as {
        rm: (path: string, options?: object) => Promise<void>;
      }
    ).rm = async (path, options) => {
      if (typeof memFsPromises?.rm === 'function') {
        try {
          return await memFsPromises.rm(path, options);
        } catch {
          return await fsOriginal.promises.rm(path, options);
        }
      }
      return await fsOriginal.promises.rm(path, options);
    };
  }

  return union as unknown as VirtualFs;
}

const getVirtualFs = vi.hoisted(() => {
  let pending: Promise<VirtualFs> | null = null;

  return async (fsOriginal: typeof import('node:fs')) => {
    pending ??= createVirtualFs(fsOriginal);
    return pending;
  };
});

vi.mock('node:fs', async (importOriginal) => {
  return {
    default: await getVirtualFs(
      await importOriginal<typeof import('node:fs')>()
    ),
  };
});

vi.mock('fs', async (importOriginal) => {
  return {
    default: await getVirtualFs(await importOriginal<typeof import('fs')>()),
  };
});

vi.mock('node:fs/promises', async () => {
  const fsModule = await import('node:fs');
  const promises = (fsModule.default ?? fsModule)
    .promises as typeof import('node:fs/promises');

  return {
    default: promises,
    ...promises,
  };
});

vi.mock('fs/promises', async () => {
  const fsModule = await import('fs');
  const promises = (fsModule.default ?? fsModule)
    .promises as typeof import('node:fs/promises');

  return {
    default: promises,
    ...promises,
  };
});
