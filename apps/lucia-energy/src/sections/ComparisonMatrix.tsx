// apps/lucia-energy/src/sections/ComparisonMatrix.tsx
// Generalized "기존 단일자산 솔루션 vs LuciaEnergy" — must NOT name 발전왕.
import type { CSSProperties } from 'react';

import { COMPARISON } from '../copy';

export function ComparisonMatrix() {
  return (
    <section
      aria-labelledby="comparison-heading"
      style={{ padding: '64px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="comparison-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {COMPARISON.heading}
      </h2>
      <div style={{ marginTop: 32, overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            minWidth: 720,
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid var(--line)' }}>
              <th style={cellStyle('var(--ink-3)', 600)}>비교 항목</th>
              <th style={cellStyle('var(--ink-3)', 600)}>{COMPARISON.legacyHeader}</th>
              <th
                style={{
                  ...cellStyle('var(--accent)', 700),
                  borderTop: '3px solid var(--accent)',
                }}
              >
                {COMPARISON.nextHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.rows.map(row => (
              <tr key={row.dim} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={cellStyle('var(--ink)', 600)}>{row.dim}</td>
                <td style={cellStyle('var(--ink-2)', 400)}>{row.legacy}</td>
                <td style={cellStyle('var(--ink)', 500)}>{row.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function cellStyle(color: string, weight: number): CSSProperties {
  return {
    padding: '12px 16px',
    textAlign: 'left',
    color,
    fontWeight: weight,
    verticalAlign: 'top',
  };
}
