// apps/web/src/routes/Invest/sections/HowItWorks.tsx
import { HOW_IT_WORKS_OVERLINE, HOW_IT_WORKS_STEPS } from '../copy';

export function HowItWorks() {
  return (
    <section aria-labelledby="hiw-heading" className="landing-section">
      <div className="landing-container">
        <p id="hiw-heading" className="overline" style={{ marginBottom: 24 }}>
          {HOW_IT_WORKS_OVERLINE}
        </p>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          {HOW_IT_WORKS_STEPS.map(step => (
            <div
              key={step.index}
              className="card card-pad"
              style={{ padding: 24 }}
            >
              <div className="num" style={{ fontSize: 12, color: 'var(--muted-2)', marginBottom: 12 }}>
                {String(step.index).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
