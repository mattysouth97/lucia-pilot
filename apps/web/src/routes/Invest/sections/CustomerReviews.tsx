// Stack of 3 short customer review cards for the hero right-column slot.
// Variant `hero` runs over the rooftop image with a dark glass backdrop;
// `standalone` keeps the panel-on-light treatment for use elsewhere.

interface Review {
  readonly id: string;
  readonly rating: number;
  readonly quote: string;
  readonly name: string;
  readonly meta: string;
}

const REVIEWS: ReadonlyArray<Review> = [
  {
    id: 'r-kim',
    rating: 5,
    quote: '매달 정시에 분배되는 게 가장 마음에 듭니다. 어느 발전소에서 왔는지 원장에서 직접 확인돼요.',
    name: '김** 님',
    meta: '40대 직장인 · 18개월차',
  },
  {
    id: 'r-lee',
    rating: 5,
    quote: '정기예금보다 1.5%p 높은 수익을 12개월째 한 번도 지연 없이 받고 있습니다.',
    name: '이** 님',
    meta: '30대 자영업 · 12개월차',
  },
  {
    id: 'r-park',
    rating: 5,
    quote: '공익 분배 41%가 의미 있어서 가족에게도 권했습니다. 단순 수익보다 더 큰 가치예요.',
    name: '박** 님',
    meta: '30대 공무원 · 9개월차',
  },
];

const TOTAL_INVESTORS = 24127;

const FORMAT = new Intl.NumberFormat('ko-KR');

export interface CustomerReviewsProps {
  variant?: 'standalone' | 'hero';
}

export function CustomerReviews({ variant = 'standalone' }: CustomerReviewsProps = {}) {
  const isHero = variant === 'hero';

  const themeContainer: React.CSSProperties = isHero
    ? {
        background: 'rgba(10,12,15,0.74)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }
    : {
        background: 'var(--panel)',
        border: '1px solid var(--line)',
      };

  const fgPrimary = isHero ? '#FFFFFF' : 'var(--ink)';
  const fgSecondary = isHero ? 'rgba(255,255,255,0.82)' : 'var(--ink-2)';
  const fgMuted = isHero ? 'rgba(255,255,255,0.6)' : 'var(--muted)';
  const fgMuted2 = isHero ? 'rgba(255,255,255,0.42)' : 'var(--muted-2)';
  const cardBg = isHero ? 'rgba(255,255,255,0.04)' : 'var(--bg)';
  const cardBorder = isHero ? '1px solid rgba(255,255,255,0.10)' : '1px solid var(--line)';
  const dividerColor = isHero ? 'rgba(255,255,255,0.10)' : 'var(--line)';

  const styleTag = `
    @keyframes lucia-review-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .lucia-review {
      animation: lucia-review-in .42s ease-out both;
      transition: transform 160ms ease-out, border-left-color 160ms ease-out, background 160ms ease-out;
      border-left: 2px solid transparent;
    }
    .lucia-review:hover {
      transform: translateY(-1px);
      border-left-color: var(--accent);
      background: ${isHero ? 'rgba(255,255,255,0.07)' : 'var(--panel)'};
    }
    @media (prefers-reduced-motion: reduce) {
      .lucia-review {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      .lucia-review:hover {
        transform: none;
      }
    }
  `;

  return (
    <div
      style={{
        ...themeContainer,
        padding: 14,
        borderRadius: 'var(--r-sm, 6px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <style>{styleTag}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: fgPrimary,
            letterSpacing: '-0.005em',
          }}
        >
          <Stars rating={5} small />
          <span>투자자 후기</span>
        </span>
        <span style={{ fontSize: 11, color: fgMuted2 }} className="num">
          평점 4.92 / 5.0
        </span>
      </div>

      {/* Review cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {REVIEWS.slice(0, 3).map((r, i) => (
          <article
            key={r.id}
            className="lucia-review"
            style={{
              animationDelay: `${i * 80}ms`,
              padding: '10px 12px 10px 14px',
              background: cardBg,
              border: cardBorder,
              borderRadius: 'var(--r-sm, 6px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <Stars rating={r.rating} />
            <p
              style={{
                fontSize: 12.5,
                lineHeight: 1.5,
                color: fgSecondary,
                margin: 0,
                letterSpacing: '-0.005em',
              }}
            >
              {r.quote}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: fgMuted,
              }}
            >
              <span style={{ color: fgPrimary, fontWeight: 700 }}>{r.name}</span>
              <span style={{ color: fgMuted2 }}>·</span>
              <span>{r.meta}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Footer stat */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: `1px solid ${dividerColor}`,
          fontSize: 11.5,
          color: fgMuted,
        }}
      >
        <span>
          외{' '}
          <span className="num" style={{ color: fgPrimary, fontWeight: 700 }}>
            {FORMAT.format(TOTAL_INVESTORS)}
          </span>
          명이 Lucia에 함께합니다
        </span>
        <a
          href="#yield-history"
          style={{
            fontSize: 11,
            color: 'var(--accent)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          전체 후기 →
        </a>
      </div>
    </div>
  );
}

function Stars({ rating, small }: { rating: number; small?: boolean }) {
  const size = small ? 11 : 13;
  return (
    <span
      role="img"
      aria-label={`${rating}점 만점에 ${rating}점`}
      style={{ display: 'inline-flex', gap: 1.5 }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill={i < rating ? 'var(--accent)' : 'rgba(255,255,255,0.18)'}
          aria-hidden
        >
          <path d="M8 1.5 L9.9 5.7 L14.5 6.2 L11 9.3 L12 13.8 L8 11.4 L4 13.8 L5 9.3 L1.5 6.2 L6.1 5.7 Z" />
        </svg>
      ))}
    </span>
  );
}
