import { GRID_COLUMNS } from './GridField';

/** Continues the hero's vertical hairlines through the content sections. */
export function PageGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
      {GRID_COLUMNS.map((left) => (
        <div key={left} className="absolute top-0 h-full w-px bg-white/[0.035]" style={{ left }} />
      ))}
    </div>
  );
}
