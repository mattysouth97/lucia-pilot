// SVG icon set — minimal, 20px, currentColor
const Icon = ({ d, size = 20, stroke = 1.6, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const Icons = {
  Sun:    <Icon d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>} />,
  Bolt:   <Icon d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  Coin:   <Icon d={<><circle cx="12" cy="12" r="9"/><path d="M9 9.5c.5-1 1.5-1.5 3-1.5s2.5.6 2.5 1.6c0 2-5.5 1-5.5 3 0 1 1 1.6 2.5 1.6s2.5-.6 3-1.6"/><path d="M12 6.5v11"/></>} />,
  Home:   <Icon d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  Chain:  <Icon d="M10 13a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 11a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  Bell:   <Icon d="M6 8a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 13zM10 19a2 2 0 0 0 4 0" />,
  Search: <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />,
  Caret:  <Icon d="m6 9 6 6 6-6" />,
  Arrow:  <Icon d="M5 12h14M13 6l6 6-6 6" />,
  Plus:   <Icon d="M12 5v14M5 12h14" />,
  Filter: <Icon d="M4 5h16l-6 8v6l-4-2v-4z" />,
  Doc:    <Icon d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6" />,
  Grid:   <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  Map:    <Icon d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>,
  Chart:  <Icon d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>,
  Lock:   <Icon d={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>} />,
  Down:   <Icon d="M12 4v12m0 0-5-5m5 5 5-5M4 20h16"/>,
  Settings: <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>} />,
  Share:  <Icon d="M4 12v8h16v-8M16 6l-4-4-4 4M12 2v14"/>,
  Check:  <Icon d="m5 12 5 5L20 7"/>,
  Cross:  <Icon d="m6 6 12 12M6 18 18 6"/>,
  Clock:  <Icon d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
  Spark:  <Icon d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>,
};

window.Icons = Icons;
