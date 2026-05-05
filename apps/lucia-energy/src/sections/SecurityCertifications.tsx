// apps/lucia-energy/src/sections/SecurityCertifications.tsx
import { SECURITY } from '../copy';

export function SecurityCertifications() {
  return (
    <section
      aria-labelledby="security-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="security-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {SECURITY.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {SECURITY.items.map(item => (
          <div key={item.name} className="card card-pad">
            <span
              className="num"
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderRadius: 'var(--r-sm)',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {item.name}
            </span>
            <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
