import { CSSProperties } from 'react';
import { ambientTiming } from '../../lib/ambient';
import { Crosshair } from './Crosshair';

export const GRID_COLUMNS = ['12.6%', '37.5%', '61.9%', '86.2%'] as const;
const GRID_ROWS = ['32.7%', '71.4%'] as const;

/** A few sparse telemetry streaks running along grid lines (index into GRID_COLUMNS / GRID_ROWS). */
const STREAKS = [
  { axis: 'v', line: 1, duration: 9000, delay: 3200 },
  { axis: 'v', line: 3, duration: 13000, delay: 7600 },
  { axis: 'h', line: 0, duration: 11000, delay: 5400 },
] as const;

function GridLines({ tone }: { tone: 'base' | 'lens' }) {
  const lineClass = tone === 'base' ? 'bg-white/[0.04]' : 'bg-ice/40';
  return (
    <>
      {GRID_COLUMNS.map((left, i) => (
        <div
          key={`v-${left}`}
          className={`absolute top-0 h-full w-px ${lineClass} anim-grid-v`}
          style={{ left, animationDelay: `${600 + i * 100}ms` }}
        />
      ))}
      {GRID_ROWS.map((top, i) => (
        <div
          key={`h-${top}`}
          className={`absolute left-0 w-full h-px ${lineClass} anim-grid-h`}
          style={{ top, animationDelay: `${800 + i * 150}ms` }}
        />
      ))}
    </>
  );
}

/** Hero grid: hairlines, pulsing intersection crosshairs, sparse streaks and a pointer lens. */
export function GridField() {
  return (
    <div className="absolute inset-0 pointer-events-none parallax-far" aria-hidden="true">
      <GridLines tone="base" />

      <div className="absolute inset-0 grid-lens">
        <GridLines tone="lens" />
      </div>

      {STREAKS.map((streak) => {
        const style = { '--dur': `${streak.duration}ms`, '--delay': `${streak.delay}ms` } as CSSProperties;
        return streak.axis === 'v' ? (
          <span key={`s-v-${streak.line}`} className="grid-streak-v" style={{ ...style, left: GRID_COLUMNS[streak.line] }} />
        ) : (
          <span key={`s-h-${streak.line}`} className="grid-streak-h" style={{ ...style, top: GRID_ROWS[streak.line] }} />
        );
      })}

      {GRID_ROWS.flatMap((top, hi) =>
        GRID_COLUMNS.map((left, vi) => {
          const index = hi * GRID_COLUMNS.length + vi;
          return (
            <Crosshair
              key={`plus-${top}-${left}`}
              top={top}
              left={left}
              enterDelay={1000 + index * 80}
              rippleIndex={vi + hi}
              pulse={ambientTiming(index, { minDuration: 6500, maxDuration: 12500, baseDelay: 2200, maxDelay: 7000 })}
            />
          );
        }),
      )}
    </div>
  );
}
