import { describe, expect, it, vi } from 'vitest';

import { searchCountries, upperFirst } from '../src/index.js';

describe('inquirer-autocomplete-demo', () => {
  it('formats the selected country', () => {
    expect(upperFirst('norway')).toBe('Norway');
  });

  it('returns matching country choices', async () => {
    vi.useFakeTimers();
    const resultsPromise = searchCountries('norway');

    await vi.advanceTimersByTimeAsync(330);

    await expect(resultsPromise).resolves.toEqual([
      {
        value: 'Norway',
        name: 'Norway',
        description: 'Norway is a great place to visit',
        disabled: false,
      },
    ]);
    vi.useRealTimers();
  });
});
