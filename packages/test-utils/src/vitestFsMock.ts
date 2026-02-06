import { vi } from 'vitest';

const createUnionFs = vi.hoisted(
  () => async (fsOriginal: typeof import('node:fs')) => {
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

    return union;
  }
);

vi.mock('node:fs', async (importOriginal) => {
  return {
    default: await createUnionFs(
      await importOriginal<typeof import('node:fs')>()
    ),
  };
});

vi.mock('fs', async (importOriginal) => {
  return {
    default: await createUnionFs(await importOriginal<typeof import('fs')>()),
  };
});
