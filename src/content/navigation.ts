import { toFragmentId } from '../lib/fragment';

export interface NavItem {
  number: string;
  label: string;
  id: string;
}

const LABELS = ['ECOSYSTEM', 'LIQUIDITY_POOLS', 'LUMEN_INDEX', 'GOVERNANCE'] as const;

export const NAV_ITEMS: readonly NavItem[] = LABELS.map((label, i) => ({
  number: String(i + 1).padStart(2, '0'),
  label,
  id: toFragmentId(label),
}));

export const SECTION_IDS = NAV_ITEMS.map((item) => item.id);
