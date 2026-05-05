// apps/lucia-energy/src/sections/PublicCitizen.tsx
import { PersonaTagChips } from '../components/PersonaTagChips';
import { PUBLIC_CITIZEN } from '../copy';

interface PublicCitizenProps {
  onPersonaClick: (persona: string) => void;
}

export function PublicCitizen({ onPersonaClick }: PublicCitizenProps) {
  return (
    <section
      aria-labelledby="public-citizen-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="public-citizen-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {PUBLIC_CITIZEN.heading}
      </h2>
      <PersonaTagChips personas={PUBLIC_CITIZEN.relevantPersonas} onClick={onPersonaClick} />
      <p style={{ maxWidth: 720, fontSize: 16, color: 'var(--ink-2)' }}>{PUBLIC_CITIZEN.sub}</p>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {PUBLIC_CITIZEN.pillars.map(p => (
          <div key={p.title} className="card card-pad">
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{p.title}</div>
            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {p.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
