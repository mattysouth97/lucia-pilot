// apps/lucia-energy/src/sections/BlockchainSettlement.tsx
// Lucia (TON) on-chain settlement section. Lucia naming OK per FRD §1.3.
import { PersonaTagChips } from '../components/PersonaTagChips';
import { BLOCKCHAIN } from '../copy';

interface BlockchainSettlementProps {
  onPersonaClick: (persona: string) => void;
}

export function BlockchainSettlement({ onPersonaClick }: BlockchainSettlementProps) {
  return (
    <section
      aria-labelledby="blockchain-heading"
      style={{ padding: '64px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="blockchain-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {BLOCKCHAIN.heading}
      </h2>
      <PersonaTagChips personas={BLOCKCHAIN.relevantPersonas} onClick={onPersonaClick} />
      <p style={{ maxWidth: 720, fontSize: 16, color: 'var(--ink-2)' }}>{BLOCKCHAIN.sub}</p>
      <ul
        style={{
          marginTop: 32,
          paddingLeft: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 12,
          maxWidth: 760,
        }}
      >
        {BLOCKCHAIN.bullets.map(b => (
          <li
            key={b}
            style={{
              padding: '12px 16px',
              borderLeft: '3px solid var(--accent)',
              background: 'var(--accent-soft)',
              fontSize: 14,
              color: 'var(--ink)',
            }}
          >
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
