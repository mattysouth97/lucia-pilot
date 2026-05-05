// Animated value-chain diagram: ☀ → 🏢 → ⚡ → 👨‍👩‍👧 → ₩.
// Single dark-surfaced section — provides the page's visual rhythm break and
// makes the system's flow legible without a video. Strokes animate via
// CSS @keyframes (stroke-dashoffset), gated by prefers-reduced-motion.

const NODES = [
  {
    id: 'sun',
    label: '햇빛',
    sub: 'SMP × 1,380 kWh/kWp/년',
    icon: (
      <g>
        <circle cx="0" cy="0" r="8" fill="currentColor" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r1 = 11;
          const r2 = 16;
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={Math.cos(rad) * r1}
              y1={Math.sin(rad) * r1}
              x2={Math.cos(rad) * r2}
              y2={Math.sin(rad) * r2}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    ),
  },
  {
    id: 'plants',
    label: '116동 발전소',
    sub: 'LH 매입임대 옥상',
    icon: (
      <g>
        {[
          [-12, -6],
          [0, -6],
          [12, -6],
          [-12, 4],
          [0, 4],
          [12, 4],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={(x as number) - 4}
            y={(y as number) - 3}
            width="8"
            height="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            rx="1"
          />
        ))}
      </g>
    ),
  },
  {
    id: 'grid',
    label: '한전 계통',
    sub: 'REC + SMP 매도',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M-10 12 L0 -14 L10 12 Z" />
        <path d="M-7 4 L7 4" />
        <path d="M-9 8 L9 8" />
      </g>
    ),
  },
  {
    id: 'households',
    label: '2,839 세대',
    sub: '입주민 분배 41%',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="-7" cy="-3" r="3.5" />
        <path d="M-13 9 Q-7 2 -1 9" />
        <circle cx="7" cy="-3" r="3.5" />
        <path d="M1 9 Q7 2 13 9" />
      </g>
    ),
  },
  {
    id: 'investor',
    label: '투자자 분배',
    sub: '월 정산 자동 입금',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="0" cy="0" r="13" />
        <path d="M-5 -5 L0 5 L5 -5" />
        <path d="M-6 0 L6 0" />
      </g>
    ),
  },
] as const;

export function EnergyFlow() {
  // Keyframes scoped to this component via a unique class so they don't leak.
  // The animation respects prefers-reduced-motion via the media query.
  const styleTag = `
    @keyframes lucia-flow-dash {
      to { stroke-dashoffset: -20; }
    }
    .lucia-flow-stroke {
      stroke-dasharray: 4 8;
      animation: lucia-flow-dash 1.6s linear infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .lucia-flow-stroke { animation: none; }
    }
    .lucia-flow-node-circle {
      transition: transform 200ms ease-out;
    }
  `;

  return (
    <section
      aria-labelledby="energy-flow-heading"
      className="landing-section"
      style={{ background: 'var(--ink)', color: '#FFFFFF' }}
    >
      <style>{styleTag}</style>

      <div className="landing-container">
        <p
          className="overline"
          style={{ color: 'var(--accent)', marginBottom: 14, letterSpacing: '0.12em' }}
        >
          햇빛이 수익이 되기까지
        </p>
        <h2
          id="energy-flow-heading"
          style={{
            fontSize: 'clamp(28px, 4.4vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 1.18,
            margin: '0 0 14px',
            color: '#FFFFFF',
            maxWidth: '22ch',
          }}
        >
          매일 아침 발전이 시작되면, <br />
          5단계 자동 정산이 흐릅니다.
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 40px',
            maxWidth: '60ch',
          }}
        >
          모든 단계는 Hyperledger Fabric 원장에 기록되며, 각 거래의 해시는 사후에 검증 가능합니다.
        </p>

        {/* Desktop: horizontal flow */}
        <div
          className="energy-flow-desktop"
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            alignItems: 'center',
          }}
        >
          {/* Connecting strokes drawn behind nodes — one wide SVG overlay */}
          <svg
            aria-hidden
            viewBox="0 0 100 6"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              top: 38,
              left: 0,
              right: 0,
              width: '100%',
              height: 6,
              pointerEvents: 'none',
            }}
          >
            <line
              x1="10"
              y1="3"
              x2="90"
              y2="3"
              stroke="var(--accent)"
              strokeWidth="0.6"
              strokeLinecap="round"
              className="lucia-flow-stroke"
            />
          </svg>

          {NODES.map((n, i) => (
            <FlowNode key={n.id} node={n} index={i} />
          ))}
        </div>

        {/* Mobile: stacked vertical flow with a left rail line */}
        <div className="energy-flow-mobile" style={{ display: 'none' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <svg
              aria-hidden
              viewBox="0 0 6 100"
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                left: 36,
                top: 36,
                bottom: 36,
                width: 6,
                height: 'calc(100% - 72px)',
                pointerEvents: 'none',
              }}
            >
              <line
                x1="3"
                y1="0"
                x2="3"
                y2="100"
                stroke="var(--accent)"
                strokeWidth="0.6"
                strokeLinecap="round"
                className="lucia-flow-stroke"
              />
            </svg>
            {NODES.map((n) => (
              <FlowNodeMobile key={n.id} node={n} />
            ))}
          </div>
        </div>

        {/* Bottom credibility strip */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 24px',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <span>모든 거래는 블록체인 원장 기록 후 분배됩니다.</span>
          <span className="num">avg block-time 2.1s · 검증 노드 4 / 4 active</span>
        </div>
      </div>

      {/* Inline CSS for the responsive flip — uses container queries via min-width */}
      <style>{`
        @media (max-width: 768px) {
          .energy-flow-desktop { display: none !important; }
          .energy-flow-mobile { display: block !important; }
        }
      `}</style>
    </section>
  );
}

function FlowNode({ node, index }: { node: (typeof NODES)[number]; index: number }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        className="lucia-flow-node-circle"
        aria-hidden
        style={{
          width: 76,
          height: 76,
          borderRadius: 999,
          background: index === 4 ? 'var(--accent)' : '#FFFFFF',
          color: index === 4 ? '#FFFFFF' : 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 6px var(--ink), 0 0 0 7px rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <svg viewBox="-20 -20 40 40" width="36" height="36" aria-hidden>
          {node.icon}
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.01em',
          }}
        >
          {node.label}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.55)',
            marginTop: 4,
            letterSpacing: '-0.005em',
          }}
        >
          {node.sub}
        </div>
      </div>
      <span
        className="num"
        style={{
          position: 'absolute',
          top: -4,
          right: 'calc(50% - 50px)',
          fontSize: 10,
          color: 'var(--accent)',
          opacity: 0.7,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
}

function FlowNodeMobile({ node }: { node: (typeof NODES)[number] }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        className="lucia-flow-node-circle"
        aria-hidden
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          background: '#FFFFFF',
          color: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 6px var(--ink)',
          flexShrink: 0,
        }}
      >
        <svg viewBox="-20 -20 40 40" width="34" height="34" aria-hidden>
          {node.icon}
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
          {node.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 4,
          }}
        >
          {node.sub}
        </div>
      </div>
    </div>
  );
}
