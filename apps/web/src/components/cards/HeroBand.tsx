// HeroBand — dark hero strip atop the dashboard.
// Left panel: 매입대 햇빛 정산 (3 KPIs + spark bar)
// Right panel: Step Count — 가동 동수 (sun motif)

interface HeroBandProps {
  todayKwh?: string;
  todayRevenue?: string;
  utilization?: string;
  totalSites?: number;
  liveSites?: number;
  alertSites?: number;
  spark?: number[];
}

const DEFAULT_SPARK = [
  62, 71, 58, 88, 74, 92, 81, 96, 110, 102, 88, 124, 138, 119, 96, 132,
  148, 158, 142, 168, 172, 154, 138, 122, 142, 128, 116, 102, 124, 138,
  152, 168, 142, 158, 172, 188, 196, 182, 174, 160, 168, 152, 138, 124,
  142, 158, 132, 118, 104, 88, 76, 92, 108, 124, 138, 152, 142, 132, 118,
];

export function HeroBand({
  todayKwh = '9,842',
  todayRevenue = '4.18M',
  utilization = '83.1',
  totalSites = 116,
  liveSites = 114,
  alertSites = 2,
  spark = DEFAULT_SPARK,
}: HeroBandProps) {
  const max = Math.max(...spark);
  return (
    <div className="hero-band">
      <div className="hero-band-main">
        <div className="hero-band-main-row">
          <div>
            <div className="hero-band-title">매입대 햇빛 정산</div>
            <div className="hero-band-sub">
              Uljin · {totalSites}동 · Year-1 운영
            </div>
          </div>
          <div className="hero-band-kpis">
            <HeroKpi label="오늘 발전량" value={todayKwh} unit="/ kWh" tone="default" />
            <HeroKpi label="오늘 수익" value={todayRevenue} unit="/ 원" tone="amber" />
            <HeroKpi label="가동률" value={utilization} unit="%" tone="default" />
          </div>
        </div>

        <div className="hero-band-spark" aria-hidden="true">
          {spark.map((v, i) => (
            <span
              key={i}
              className="hero-band-spark-bar"
              style={{ height: `${(v / max) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="hero-band-side">
        <div>
          <div className="hero-band-side-eyebrow">Step Count · 가동 동수</div>
          <div className="hero-band-side-num">
            <span className="num">{liveSites}</span>
            <span className="hero-band-side-denom">/ {totalSites}동</span>
          </div>
          <div className="hero-band-side-meta">
            정상 가동 · 이상 {alertSites}동
          </div>
        </div>
        <div className="hero-band-sun" aria-hidden="true">
          <SunMark percent={liveSites / totalSites} />
        </div>
      </div>
    </div>
  );
}

function HeroKpi({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: 'default' | 'amber';
}) {
  return (
    <div className="hero-band-kpi">
      <div className="hero-band-kpi-label">{label}</div>
      <div className="hero-band-kpi-row">
        <span
          className={`num hero-band-kpi-value ${tone === 'amber' ? 'is-amber' : ''}`}
        >
          {value}
        </span>
        <span className="hero-band-kpi-unit">{unit}</span>
      </div>
    </div>
  );
}

function SunMark({ percent }: { percent: number }) {
  const size = 86;
  const cx = size / 2;
  const cy = size / 2;
  const r = 26;
  // Build a circle of short rays
  const rays = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const inner = r + 4;
    const outer = r + (i / 18 < percent ? 14 : 8);
    return [
      cx + Math.cos(angle) * inner,
      cy + Math.sin(angle) * inner,
      cx + Math.cos(angle) * outer,
      cy + Math.sin(angle) * outer,
    ];
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="hero-band-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
      </defs>
      {rays.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#F97316"
          strokeWidth={1.6}
          strokeLinecap="round"
          opacity={0.85}
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="url(#hero-band-sun)" />
    </svg>
  );
}
