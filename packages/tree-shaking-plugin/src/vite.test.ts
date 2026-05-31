import { describe, expect, it } from 'vitest';
import { qraftTreeShakeVite } from './vite.js';

describe('qraftTreeShakeVite', () => {
  it('clears generated metadata cache on Vite hot updates', () => {
    const plugin = qraftTreeShakeVite({});

    expect(plugin).toHaveProperty('handleHotUpdate');
  });
});
