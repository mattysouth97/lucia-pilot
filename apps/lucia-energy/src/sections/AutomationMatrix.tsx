// apps/lucia-energy/src/sections/AutomationMatrix.tsx
// 8-cell grid of AI-automated functions. Outcomes only, NO MERIDIAN/LangGraph/agent names.
import { AUTOMATION_MATRIX } from '../copy';

export function AutomationMatrix() {
  return (
    <section
      aria-labelledby="automation-heading"
      style={{ padding: '64px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="automation-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {AUTOMATION_MATRIX.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 1,
          background: 'var(--line-soft)',
          border: '1px solid var(--line-soft)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}
      >
        {AUTOMATION_MATRIX.cells.map(cell => (
          <div
            key={cell.label}
            style={{
              padding: 24,
              background: 'var(--bg-elevated)',
              minHeight: 160,
            }}
          >
            <div
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ◆
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {cell.label}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--ink-2)',
              }}
            >
              {cell.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
