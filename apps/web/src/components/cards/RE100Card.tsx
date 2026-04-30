// RE100Card — RE100 PPA 매수자 4개사 이행 현황
// FR-X-004 · demo numbers hardcoded from LUCIA_DATA prototype

import { Pill, fmt } from '@/components/atoms';

interface Company {
  name: string;
  logo: string;
  kwh: number;
  target: number;
  premium: number;
  color: string;
}

interface RE100CardProps {
  companies?: Company[];
}

const DEFAULT_COMPANIES: Company[] = [
  { name: 'SK하이닉스', logo: 'SK',  kwh: 142800, target: 180000, premium: 20, color: '#E5340B' },
  { name: '삼성전자',   logo: 'SS',  kwh: 98200,  target: 150000, premium: 18, color: '#1428A0' },
  { name: '네이버',     logo: 'N',   kwh: 64500,  target: 80000,  premium: 15, color: '#03C75A' },
  { name: '기아',       logo: 'Kia', kwh: 41200,  target: 60000,  premium: 16, color: '#05141F' },
];

export function RE100Card({ companies = DEFAULT_COMPANIES }: RE100CardProps) {
  return (
    <div className="card" style={{ padding: 22 }}>
      {/* header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Pill tone="indigo">FR-X-004</Pill>
          <span style={{ fontSize: 11, color: '#9AA0AB', fontWeight: 500 }}>Mock 모드</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>RE100 PPA 매수자</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          4개사 · 누적 346,700 kWh · 프리미엄 +20원/kWh
        </div>
      </div>

      {/* company rows */}
      <div style={{ display: 'grid', gap: 10 }}>
        {companies.map((c) => {
          const pct = (c.kwh / c.target) * 100;
          const isHigh = pct >= 80;
          return (
            <div
              key={c.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 110px',
                gap: 12,
                alignItems: 'center',
              }}
            >
              {/* logo box */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: c.color,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  flexShrink: 0,
                }}
              >
                {c.logo}
              </div>

              {/* name + progress */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <span className="num" style={{ fontSize: 11, color: '#9AA0AB' }}>
                    {fmt.n(c.kwh)} / {fmt.n(c.target)} kWh
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: '#F4F5F7',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(pct, 100)}%`,
                      background: isHigh
                        ? 'linear-gradient(90deg, #34D399, #10B981)'
                        : 'linear-gradient(90deg, #93C5FD, #4F46E5)',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>

              {/* pct + premium */}
              <div style={{ textAlign: 'right' }}>
                <div
                  className="num"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: isHigh ? '#047857' : '#374151',
                  }}
                >
                  {pct.toFixed(1)}%
                </div>
                <div style={{ fontSize: 10.5, color: '#9AA0AB', marginTop: 1 }}>
                  +{c.premium}원/kWh
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
