// Atomic UI primitives
const cn = (...xs) => xs.filter(Boolean).join(" ");

const Pill = ({ tone = "neutral", children, dot, style }) => {
  const tones = {
    neutral: { bg: "#F1F3F5", fg: "#374151", dot: "#9AA0AB" },
    green:   { bg: "#ECFDF5", fg: "#047857", dot: "#10B981" },
    amber:   { bg: "#FFF7E6", fg: "#B45309", dot: "#F59E0B" },
    rose:    { bg: "#FFF1F3", fg: "#BE123C", dot: "#F43F5E" },
    indigo:  { bg: "#EEF0FF", fg: "#3730A3", dot: "#4F46E5" },
    sky:     { bg: "#E0F2FE", fg: "#075985", dot: "#0284C7" },
    ink:     { bg: "#0E1116", fg: "#fff", dot: "#34D399" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: t.bg, color: t.fg,
      padding: "3px 9px", borderRadius: 999,
      fontSize: 11.5, fontWeight: 600, lineHeight: 1.4,
      letterSpacing: "-0.01em",
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: t.dot, display: "inline-block" }} />}
      {children}
    </span>
  );
};

const Btn = ({ variant = "ghost", size = "md", icon, children, onClick, style, active }) => {
  const sizes = {
    sm: { pad: "6px 10px", fs: 12.5, h: 28 },
    md: { pad: "8px 14px", fs: 13.5, h: 36 },
    lg: { pad: "10px 18px", fs: 14, h: 42 },
  }[size];
  const variants = {
    primary: { bg: "#0E1116", fg: "#fff", bd: "#0E1116", hover: "#1F2937" },
    secondary: { bg: "#fff", fg: "#0E1116", bd: "#E2E5EA", hover: "#F4F5F7" },
    ghost: { bg: "transparent", fg: "#374151", bd: "transparent", hover: "#F1F3F5" },
    accent: { bg: "#10B981", fg: "#fff", bd: "#10B981", hover: "#059669" },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: active ? "#0E1116" : v.bg,
      color: active ? "#fff" : v.fg,
      border: `1px solid ${active ? "#0E1116" : v.bd}`,
      borderRadius: 999,
      padding: sizes.pad, height: sizes.h,
      fontSize: sizes.fs, fontWeight: 600,
      letterSpacing: "-0.01em",
      transition: "all .15s ease",
      ...style,
    }}
    onMouseEnter={e => !active && (e.currentTarget.style.background = v.hover)}
    onMouseLeave={e => !active && (e.currentTarget.style.background = v.bg)}>
      {icon}
      {children}
    </button>
  );
};

const Stat = ({ label, value, unit, delta, deltaLabel = "전일", icon, accent }) => {
  const positive = delta != null && delta >= 0;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      {icon && (
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: accent || "#F1F3F5",
          color: accent ? "#fff" : "#374151",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>{icon}</div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: "#6B7280", fontWeight: 500, marginBottom: 4, letterSpacing: "-0.01em" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
          <div className="num" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em", color: "#0E1116" }}>{value}</div>
          {unit && <div style={{ fontSize: 12, color: "#9AA0AB", fontWeight: 500 }}>{unit}</div>}
        </div>
        {delta != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{
              color: positive ? "#059669" : "#BE123C",
              fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 2,
            }}>
              {positive ? "▲" : "▼"} {Math.abs(delta)}%
            </span>
            <span style={{ color: "#9AA0AB" }}>{deltaLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ title, subtitle, action }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#0E1116" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2, letterSpacing: "-0.01em" }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

// Tiny sparkline
const Spark = ({ data, color = "#10B981", h = 32, w = 80, fill = true }) => {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - ((v - min) / span) * h * 0.9 - 2]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const fillPath = fill ? `${path} L${w} ${h} L0 ${h} Z` : null;
  const gradId = "spark-" + color.replace("#", "");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={fillPath} fill={`url(#${gradId})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Format helpers
const fmt = {
  n: (n, d = 0) => n?.toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d }),
  won: (n) => n?.toLocaleString("ko-KR") + "원",
  kwh: (n, d = 1) => n?.toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d }),
};

window.cn = cn;
window.Pill = Pill;
window.Btn = Btn;
window.Stat = Stat;
window.SectionTitle = SectionTitle;
window.Spark = Spark;
window.fmt = fmt;
