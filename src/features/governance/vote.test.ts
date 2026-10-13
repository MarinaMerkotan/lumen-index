import { describe, expect, it } from 'vitest';
import { INITIAL_VOTE, VoteState, localResults, voteReducer } from './vote';

const run = (...actions: Parameters<typeof voteReducer>[1][]) => actions.reduce<VoteState>(voteReducer, INITIAL_VOTE);

describe('voteReducer', () => {
  it('selects, casts, changes and resets', () => {
    expect(run({ type: 'select', option: 'FOR' })).toEqual({ selected: 'FOR', cast: null });
    expect(run({ type: 'select', option: 'FOR' }, { type: 'cast' })).toEqual({ selected: 'FOR', cast: 'FOR' });
    expect(run({ type: 'select', option: 'FOR' }, { type: 'cast' }, { type: 'change' }, { type: 'select', option: 'AGAINST' }, { type: 'cast' })).toEqual({
      selected: 'AGAINST',
      cast: 'AGAINST',
    });
    expect(run({ type: 'select', option: 'ABSTAIN' }, { type: 'cast' }, { type: 'reset' })).toEqual(INITIAL_VOTE);
  });

  it('ignores casting without a selection and selecting while a vote is cast', () => {
    expect(run({ type: 'cast' })).toEqual(INITIAL_VOTE);
    expect(run({ type: 'select', option: 'FOR' }, { type: 'cast' }, { type: 'select', option: 'AGAINST' })).toEqual({ selected: 'FOR', cast: 'FOR' });
    expect(run({ type: 'change' })).toEqual(INITIAL_VOTE);
  });
});

describe('localResults', () => {
  it('shows nothing before a vote is cast', () => {
    expect(localResults(run({ type: 'select', option: 'FOR' })).every((r) => r.votes === 0 && r.share === 0)).toBe(true);
  });

  it('reflects only the single local vote, never other participants', () => {
    const results = localResults(run({ type: 'select', option: 'AGAINST' }, { type: 'cast' }));
    expect(results).toEqual([
      { option: 'FOR', votes: 0, share: 0 },
      { option: 'AGAINST', votes: 1, share: 100 },
      { option: 'ABSTAIN', votes: 0, share: 0 },
    ]);
    expect(results.reduce((sum, r) => sum + r.votes, 0)).toBe(1);
  });
});
