// apps/lucia-energy/src/sections/NumbersBand.tsx
// Two-column band: editorial statement (left) + dark stat card (right) with
// 4 KPIs in mint numerals. Mirrors the reference's signature dark numbers move.
// Aspirational KPIs are sourced from ROADMAP Phase 1 and footnoted accordingly.
import type { CSSProperties } from 'react';

import { NUMBERS } from '../copy';

export function NumbersBand() {
  return (
    <section
      aria-labelledby="numbers-heading"
      className="section-pad"
      style={{ background: 'var(--bg)' }}
    >
      <div className="page-shell">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <div style={twoColRow}>
            <div>
              <div
                id="numbers-heading"
                className="overline"
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(10,10,10,0.06)',
                  borderRadius: 4,
                  marginBottom: 18,
                  letterSpacing: '0.16em',
                }}
              >
                {NUMBERS.overline}
              </div>
              <h2 className="statement" style={{ maxWidth: 520 }}>
                <em>{NUMBERS.statementHighlight}</em>
                {NUMBERS.statementAfter}
              </h2>
            </div>

            <div
              style={{
                background: 'var(--accent-deep)',
                borderRadius: 'var(--r-card)',
                padding: 'clamp(28px, 4vw, 48px)',
                color: '#FFFFFF',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  rowGap: 32,
                  columnGap: 32,
                }}
              >
                {NUMBERS.stats.map(stat => (
                  <div key={stat.label}>
                    <div
                      className="num"
                      style={{
                        fontSize: 'clamp(32px, 4.2vw, 56px)',
                        fontWeight: 700,
                        color: '#86EFAC',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {stat.value}
                      {stat.aspirational ? (
                        <sup
                          style={{
                            fontSize: 14,
                            verticalAlign: 'super',
                            color: 'rgba(134,239,172,0.7)',
                            marginLeft: 4,
                          }}
                          aria-label="목표치"
                        >
                          *
                        </sup>
                      ) : null}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.7)',
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <p
                style={{
                  marginTop: 24,
                  marginBottom: 0,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {NUMBERS.asteriskNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const twoColRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
  gap: 'clamp(24px, 4vw, 48px)',
  alignItems: 'stretch',
};
