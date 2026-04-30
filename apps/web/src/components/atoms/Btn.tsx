import type { CSSProperties, ReactNode, MouseEvent } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  children?: ReactNode;
}

const sizes: Record<Size, { pad: string; fs: number; h: number }> = {
  sm: { pad: '6px 10px',  fs: 12.5, h: 28 },
  md: { pad: '8px 14px',  fs: 13.5, h: 36 },
  lg: { pad: '10px 18px', fs: 14,   h: 42 },
};

const variants: Record<Variant, { bg: string; fg: string; bd: string; hover: string }> = {
  primary:   { bg: '#0E1116', fg: '#fff',     bd: '#0E1116', hover: '#1F2937' },
  secondary: { bg: '#fff',    fg: '#0E1116',  bd: '#E2E5EA', hover: '#F4F5F7' },
  ghost:     { bg: 'transparent', fg: '#374151', bd: 'transparent', hover: '#F1F3F5' },
  accent:    { bg: '#10B981', fg: '#fff',     bd: '#10B981', hover: '#059669' },
};

export function Btn({
  variant = 'ghost',
  size = 'md',
  icon,
  children,
  onClick,
  style,
  active,
}: BtnProps) {
  const sz = sizes[size];
  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: active ? '#0E1116' : v.bg,
        color: active ? '#fff' : v.fg,
        border: `1px solid ${active ? '#0E1116' : v.bd}`,
        borderRadius: 999,
        padding: sz.pad, height: sz.h,
        fontSize: sz.fs, fontWeight: 600,
        letterSpacing: '-0.01em',
        transition: 'all .15s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = v.hover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = v.bg;
      }}
    >
      {icon}
      {children}
    </button>
  );
}
