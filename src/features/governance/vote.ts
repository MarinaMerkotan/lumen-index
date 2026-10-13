/** In-memory, single-visitor vote. Nothing here represents other people or leaves the browser tab. */
export const VOTE_OPTIONS = ['FOR', 'AGAINST', 'ABSTAIN'] as const;
export type VoteOption = (typeof VOTE_OPTIONS)[number];

export interface VoteState {
  /** Option currently highlighted in the form. */
  selected: VoteOption | null;
  /** Option the visitor cast locally; locks the form until they choose to change it. */
  cast: VoteOption | null;
}

export type VoteAction = { type: 'select'; option: VoteOption } | { type: 'cast' } | { type: 'change' } | { type: 'reset' };

export const INITIAL_VOTE: VoteState = { selected: null, cast: null };

export function voteReducer(state: VoteState, action: VoteAction): VoteState {
  switch (action.type) {
    case 'select':
      return state.cast ? state : { ...state, selected: action.option };
    case 'cast':
      return state.selected && !state.cast ? { ...state, cast: state.selected } : state;
    case 'change':
      return state.cast ? { selected: state.cast, cast: null } : state;
    case 'reset':
      return INITIAL_VOTE;
  }
}

export interface LocalResult {
  option: VoteOption;
  /** 0 or 1: this visitor's own vote only. */
  votes: 0 | 1;
  share: 0 | 100;
}

/** Results of the local poll: exactly the visitor's one cast vote, or nothing before casting. */
export function localResults(state: VoteState): LocalResult[] {
  return VOTE_OPTIONS.map((option) => {
    const mine = state.cast === option;
    return { option, votes: mine ? 1 : 0, share: mine ? 100 : 0 };
  });
}
