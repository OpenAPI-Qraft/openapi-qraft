import { describe, expect, it } from 'vitest';
import { shelfMerge } from '../lib/shelfMerge.js';

describe('shelfMerge', () => {
  it('merges simple objects', async () => {
    expect(shelfMerge(1, { path: 1 }, { query: 2 }, { header: 3 })).toEqual({
      path: 1,
      query: 2,
      header: 3,
    });
  });

  it('merges simple objects with overlapping', async () => {
    expect(
      shelfMerge(2, { path: 1 }, { path: { id: 22 } }, { header: 3 })
    ).toEqual({
      path: { id: 22 },
      header: 3,
    });
  });

  it('merges objects with overlapping in child objects', async () => {
    expect(
      shelfMerge(
        2,
        { query: { id: 11, page: 22 } },
        { query: { id: 44, limit: 33 } },
        { header: 3 }
      )
    ).toEqual({
      query: { id: 44, page: 22, limit: 33 },
      header: 3,
    });
  });

  it('merges objects with overlapping in child objects on specific depth (1)', async () => {
    expect(
      shelfMerge(
        1,
        { query: { id: 11, page: 22 } },
        { query: { id: 44, limit: 33 } },
        { header: 3 }
      )
    ).toEqual({
      query: { id: 44, limit: 33 },
      header: 3,
    });
  });

  it('merges objects with overlapping in child objects on specific depth (2)', async () => {
    expect(
      shelfMerge(
        2,
        { query: { id: 11, page: 22 } },
        { query: { id: 44, limit: 33 } },
        { header: 3 }
      )
    ).toEqual({
      query: { id: 44, limit: 33, page: 22 },
      header: 3,
    });
  });

  it('merges arrays without nesting', async () => {
    expect(
      shelfMerge(
        2,
        { query: [{ id: 11, page: 22 }] },
        { query: [{ id: 44, limit: 33 }] },
        { header: 3 }
      )
    ).toEqual({
      query: [{ id: 44, limit: 33 }],
      header: 3,
    });
  });

  it('merges objects with overlapping in child objects and depth', async () => {
    expect(
      shelfMerge(
        3,
        { query: { one: { id: 11, page: 22 }, two: { ids: [55] } } },
        { query: { one: { id: 44, limit: 33 }, three: { filter: 66 } } },
        { header: 3 }
      )
    ).toEqual({
      query: {
        one: { id: 44, page: 22, limit: 33 },
        two: { ids: [55] },
        three: { filter: 66 },
      },
      header: 3,
    });
  });
});
