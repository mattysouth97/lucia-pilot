// apps/lucia-energy/src/components/Footer.tsx
import { FOOTER } from '../copy';

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bar)',
        color: 'var(--bar-ink-2)',
        padding: '32px 24px',
        marginTop: 96,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', fontSize: 13 }}>{FOOTER.copyright}</div>
    </footer>
  );
}
