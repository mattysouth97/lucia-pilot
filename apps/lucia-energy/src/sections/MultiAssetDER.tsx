// apps/lucia-energy/src/sections/MultiAssetDER.tsx
import { PersonaTagChips } from '../components/PersonaTagChips';
import { MULTI_ASSET } from '../copy';

interface MultiAssetDERProps {
  onPersonaClick: (persona: string) => void;
}

export function MultiAssetDER({ onPersonaClick }: MultiAssetDERProps) {
  return (
    <section
      aria-labelledby="multi-asset-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="multi-asset-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {MULTI_ASSET.heading}
      </h2>
      <PersonaTagChips personas={MULTI_ASSET.relevantPersonas} onClick={onPersonaClick} />
      <p style={{ maxWidth: 720, fontSize: 16, color: 'var(--ink-2)' }}>{MULTI_ASSET.sub}</p>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {MULTI_ASSET.assets.map(a => (
          <div key={a.label} className="card card-pad" style={{ minHeight: 140 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{a.label}</div>
            <div className="num" style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-2)' }}>
              단위: {a.unit}
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)' }}>{a.standards}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
