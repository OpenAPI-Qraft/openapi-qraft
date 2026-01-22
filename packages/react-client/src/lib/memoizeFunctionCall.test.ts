import { describe, expect, it, vi } from 'vitest';
import { memoizeFunctionCall } from './memoizeFunctionCall.js';

describe('memoizeFunctionCall', () => {
  it('should create and return new value on first call', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => ({ result: arg.id * 2 }));
    const arg = { id: 5 };

    const result = memoizeFunctionCall(memoCache, factory, arg);

    expect(result).toEqual({ result: 10 });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith(arg);
  });

  it('should return cached value on second call with same arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => ({ result: arg.id * 2 }));
    const arg = { id: 5 };

    const first = memoizeFunctionCall(memoCache, factory, arg);
    const second = memoizeFunctionCall(memoCache, factory, arg);

    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should create new value for different arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => ({ result: arg.id * 2 }));
    const arg1 = { id: 5 };
    const arg2 = { id: 10 };

    const result1 = memoizeFunctionCall(memoCache, factory, arg1);
    const result2 = memoizeFunctionCall(memoCache, factory, arg2);

    expect(result1).toEqual({ result: 10 });
    expect(result2).toEqual({ result: 20 });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should use referential identity, not value equality', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => ({ result: arg.id * 2 }));
    const arg1 = { id: 5 };
    const arg2 = { id: 5 };

    const result1 = memoizeFunctionCall(memoCache, factory, arg1);
    const result2 = memoizeFunctionCall(memoCache, factory, arg2);

    expect(result1).not.toBe(result2);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg1: { a: number }, arg2: { b: number }) => ({
      sum: arg1.a + arg2.b,
    }));
    const arg1 = { a: 1 };
    const arg2 = { b: 2 };

    const first = memoizeFunctionCall(memoCache, factory, arg1, arg2);
    const second = memoizeFunctionCall(memoCache, factory, arg1, arg2);

    expect(first).toBe(second);
    expect(first).toEqual({ sum: 3 });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should create different values for different argument combinations', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg1: { a: number }, arg2: { b: number }) => ({
      sum: arg1.a + arg2.b,
    }));
    const arg1a = { a: 1 };
    const arg1b = { a: 1 };
    const arg2a = { b: 2 };
    const arg2b = { b: 3 };

    const result1 = memoizeFunctionCall(memoCache, factory, arg1a, arg2a);
    const result2 = memoizeFunctionCall(memoCache, factory, arg1a, arg2b);
    const result3 = memoizeFunctionCall(memoCache, factory, arg1b, arg2a);

    expect(result1).toEqual({ sum: 3 });
    expect(result2).toEqual({ sum: 4 });
    expect(result3).toEqual({ sum: 3 });
    expect(result1).not.toBe(result3);
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('should handle three or more arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn(
      (arg1: { a: number }, arg2: { b: number }, arg3: { c: number }) => ({
        sum: arg1.a + arg2.b + arg3.c,
      })
    );
    const arg1 = { a: 1 };
    const arg2 = { b: 2 };
    const arg3 = { c: 3 };

    const first = memoizeFunctionCall(memoCache, factory, arg1, arg2, arg3);
    const second = memoizeFunctionCall(memoCache, factory, arg1, arg2, arg3);

    expect(first).toBe(second);
    expect(first).toEqual({ sum: 6 });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should maintain separate caches for different factories', () => {
    const memoCache = new WeakMap();
    const factory1 = vi.fn((arg: { id: number }) => ({
      type: 'a',
      id: arg.id,
    }));
    const factory2 = vi.fn((arg: { id: number }) => ({
      type: 'b',
      id: arg.id,
    }));
    const arg = { id: 5 };

    const result1 = memoizeFunctionCall(memoCache, factory1, arg);
    const result2 = memoizeFunctionCall(memoCache, factory2, arg);

    expect(result1).toEqual({ type: 'a', id: 5 });
    expect(result2).toEqual({ type: 'b', id: 5 });
    expect(result1).not.toBe(result2);
    expect(factory1).toHaveBeenCalledTimes(1);
    expect(factory2).toHaveBeenCalledTimes(1);
  });

  it('should cache undefined values correctly', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((_arg: { id: number }) => undefined);
    const arg = { id: 5 };

    const first = memoizeFunctionCall(memoCache, factory, arg);
    const second = memoizeFunctionCall(memoCache, factory, arg);

    expect(first).toBeUndefined();
    expect(second).toBeUndefined();
    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should cache null values correctly', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((_arg: { id: number }) => null);
    const arg = { id: 5 };

    const first = memoizeFunctionCall(memoCache, factory, arg);
    const second = memoizeFunctionCall(memoCache, factory, arg);

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should cache primitive return values', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => arg.id * 2);
    const arg = { id: 5 };

    const first = memoizeFunctionCall(memoCache, factory, arg);
    const second = memoizeFunctionCall(memoCache, factory, arg);

    expect(first).toBe(10);
    expect(second).toBe(10);
    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should cache function return values', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => () => arg.id);
    const arg = { id: 5 };

    const first = memoizeFunctionCall(memoCache, factory, arg) as () => number;
    const second = memoizeFunctionCall(memoCache, factory, arg) as () => number;

    expect(first).toBe(second);
    expect(first()).toBe(5);
    expect(second()).toBe(5);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should handle complex nested argument structures', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn(
      (
        config: { name: string },
        options: { enabled: boolean },
        metadata: { tags: string[] }
      ) => ({
        config: config.name,
        enabled: options.enabled,
        tags: metadata.tags,
      })
    );
    const config = { name: 'test' };
    const options = { enabled: true };
    const metadata = { tags: ['a', 'b'] };

    const first = memoizeFunctionCall(
      memoCache,
      factory,
      config,
      options,
      metadata
    );
    const second = memoizeFunctionCall(
      memoCache,
      factory,
      config,
      options,
      metadata
    );

    expect(first).toBe(second);
    expect(first).toEqual({
      config: 'test',
      enabled: true,
      tags: ['a', 'b'],
    });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should create new cache entry when one argument changes', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg1: { a: number }, arg2: { b: number }) => ({
      sum: arg1.a + arg2.b,
    }));
    const arg1 = { a: 1 };
    const arg2a = { b: 2 };
    const arg2b = { b: 2 };

    const result1 = memoizeFunctionCall(memoCache, factory, arg1, arg2a);
    const result2 = memoizeFunctionCall(memoCache, factory, arg1, arg2b);

    expect(result1).not.toBe(result2);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should throw error when undefined is passed as argument', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => ({ result: arg.id }));

    expect(() => {
      memoizeFunctionCall(memoCache, factory, undefined as any);
    }).toThrow();
  });

  it('should throw error when null is passed as argument', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg: { id: number }) => ({ result: arg.id }));

    expect(() => {
      memoizeFunctionCall(memoCache, factory, null as any);
    }).toThrow();
  });

  it('should throw error when undefined is passed as one of multiple arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg1: { a: number }, arg2: { b: number }) => ({
      sum: arg1.a + arg2.b,
    }));
    const arg1 = { a: 1 };

    expect(() => {
      memoizeFunctionCall(memoCache, factory, arg1, undefined as any);
    }).toThrow();
  });

  it('should throw error when null is passed as one of multiple arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg1: { a: number }, arg2: { b: number }) => ({
      sum: arg1.a + arg2.b,
    }));
    const arg1 = { a: 1 };

    expect(() => {
      memoizeFunctionCall(memoCache, factory, arg1, null as any);
    }).toThrow();
  });

  it('should throw error when undefined is passed as first argument in multiple arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg1: { a: number }, arg2: { b: number }) => ({
      sum: arg1.a + arg2.b,
    }));
    const arg2 = { b: 2 };

    expect(() => {
      memoizeFunctionCall(memoCache, factory, undefined as any, arg2);
    }).toThrow();
  });

  it('should throw error when null is passed as first argument in multiple arguments', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn((arg1: { a: number }, arg2: { b: number }) => ({
      sum: arg1.a + arg2.b,
    }));
    const arg2 = { b: 2 };

    expect(() => {
      memoizeFunctionCall(memoCache, factory, null as any, arg2);
    }).toThrow();
  });

  it('should cache correctly when calling same factory with 2 args then 3 args with same first two', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn(
      (arg1: { a: number }, arg2: { b: number }, arg3?: { c: number }) => ({
        sum: arg1.a + arg2.b + (arg3?.c ?? 0),
      })
    ) as (
      arg1: { a: number },
      arg2: { b: number },
      arg3?: { c: number }
    ) => { sum: number };
    const arg1 = { a: 1 };
    const arg2 = { b: 2 };
    const arg3 = { c: 3 };

    const first2Args = memoizeFunctionCall(memoCache, factory, arg1, arg2);
    const second2Args = memoizeFunctionCall(memoCache, factory, arg1, arg2);
    const first3Args = memoizeFunctionCall(
      memoCache,
      factory,
      arg1,
      arg2,
      arg3
    );
    const second3Args = memoizeFunctionCall(
      memoCache,
      factory,
      arg1,
      arg2,
      arg3
    );

    expect(first2Args).toBe(second2Args);
    expect(first3Args).toBe(second3Args);
    expect(first2Args).not.toBe(first3Args);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('should cache correctly when calling same factory with 3 args then 2 args with same first two', () => {
    const memoCache = new WeakMap();
    const factory = vi.fn(
      (arg1: { a: number }, arg2: { b: number }, arg3?: { c: number }) => ({
        sum: arg1.a + arg2.b + (arg3?.c ?? 0),
      })
    ) as (
      arg1: { a: number },
      arg2: { b: number },
      arg3?: { c: number }
    ) => { sum: number };
    const arg1 = { a: 1 };
    const arg2 = { b: 2 };
    const arg3 = { c: 3 };

    const first3Args = memoizeFunctionCall(
      memoCache,
      factory,
      arg1,
      arg2,
      arg3
    );
    const second3Args = memoizeFunctionCall(
      memoCache,
      factory,
      arg1,
      arg2,
      arg3
    );
    const first2Args = memoizeFunctionCall(memoCache, factory, arg1, arg2);
    const second2Args = memoizeFunctionCall(memoCache, factory, arg1, arg2);

    expect(first3Args).toBe(second3Args);
    expect(first2Args).toBe(second2Args);
    expect(first3Args).not.toBe(first2Args);
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
