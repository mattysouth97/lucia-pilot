// apps/lucia-energy/src/sections/WhoWeAre.tsx
// Editorial pause section. Overline + body left, oversized statement right with a
// single mint-accented keyword. Below: a rounded photo card with a mint dot
// decorator that nods to the reference's mark-of-place pattern.
import { WHO_WE_ARE } from '../copy';

export function WhoWeAre() {
  return (
    <section
      aria-labelledby="whoweare-heading"
      className="section-pad"
      style={{ background: 'var(--bg)' }}
    >
      <div className="page-shell">
        {/* Statement row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 240px) minmax(0, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          <div>
            <div
              id="whoweare-heading"
              className="overline"
              style={{ marginBottom: 12 }}
            >
              {WHO_WE_ARE.overline}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.55,
                color: 'var(--ink-2)',
                maxWidth: 220,
              }}
            >
              {WHO_WE_ARE.body}
            </p>
          </div>

          <h2 className="statement">
            {WHO_WE_ARE.statementBefore}
            <em>{WHO_WE_ARE.statementHighlight}</em>
            {WHO_WE_ARE.statementAfter}
          </h2>
        </div>

        {/* Photo card with mint-dot decorator */}
        <div
          aria-hidden="false"
          role="img"
          aria-label="aerial industrial solar field"
          className="photo-card"
          style={{
            marginTop: 56,
            height: 'clamp(320px, 48vh, 520px)',
            background:
              "linear-gradient(180deg, rgba(180,150,100,0) 0%, rgba(60,40,20,0.35) 100%), linear-gradient(180deg, #C9A16B 0%, #6F5634 70%, #2F2417 100%)",
          }}
        >
          {/* Decorative mint dot — bottom-left, matches the reference's location stamp */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 24,
              bottom: 24,
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--accent)',
              boxShadow: '0 0 0 4px rgba(15,118,110,0.18)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 24,
              bottom: 24,
              padding: '6px 10px',
              borderRadius: 'var(--r-pill)',
              background: 'rgba(255,255,255,0.84)',
              color: 'var(--ink)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '-0.005em',
            }}
          >
            {WHO_WE_ARE.photoCaption}
          </span>
        </div>
      </div>
    </section>
  );
}
