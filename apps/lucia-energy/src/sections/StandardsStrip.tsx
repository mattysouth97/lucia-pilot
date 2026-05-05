// apps/lucia-energy/src/sections/StandardsStrip.tsx
import { PersonaTagChips } from '../components/PersonaTagChips';
import { STANDARDS } from '../copy';

interface StandardsStripProps {
  onPersonaClick: (persona: string) => void;
}

export function StandardsStrip({ onPersonaClick }: StandardsStripProps) {
  return (
    <section
      aria-labelledby="standards-heading"
      style={{
        padding: '48px 24px',
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--line-soft)',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <h2
        id="standards-heading"
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {STANDARDS.heading}
      </h2>
      <PersonaTagChips personas={STANDARDS.relevantPersonas} onClick={onPersonaClick} />
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {STANDARDS.items.map(item => (
          <span
            key={item}
            className="num"
            style={{
              padding: '6px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-sm)',
              fontSize: 12.5,
              color: 'var(--ink)',
              background: 'var(--bg)',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
