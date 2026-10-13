import { describe, expect, it } from 'vitest';
import { createLimiter } from './concurrency';

describe('createLimiter', () => {
  it('never runs more than `max` tasks at once and resolves all of them', async () => {
    const run = createLimiter(3);
    let active = 0;
    let peak = 0;
    const task = (value: number) => async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return value;
    };
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => run(task(i))));
    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(peak).toBe(3);
  });

  it('keeps going after a rejected task', async () => {
    const run = createLimiter(1);
    await expect(run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    await expect(run(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });
});
