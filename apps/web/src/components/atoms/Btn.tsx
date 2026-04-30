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

// Btn — utilitarian rectangle, 6px radius. Not a pill.
// See DESIGN.md "Components > Btn" for the variant matrix.

const sizes: Record<Size, { pad: string; fs: number; h: number }> = {
  sm: { pad: '6px 10px',  fs: 12.5, h: 28 },
  md: { pad: '7px 14px',  fs: 13,   h: 34 },
  lg: { pad: '9px 18px',  fs: 13.5, h: 40 },
};

interface VariantSpec {
  bg: string;
  fg: string;
  bd: string;
  hoverBg: string;
  hoverBd: string;
}

const variants: Record<Variant, VariantSpec> = {
  primary: {
    bg: 'var(--ink)',
    fg: '#fff',
    bd: 'var(--ink)',
    hoverBg: 'var(--ink-2)',
    hoverBd: 'var(--ink-2)',
  },
  secondary: {
    bg: 'var(--panel)',
    fg: 'var(--ink)',
    bd: 'var(--line-2)',
    hoverBg: 'var(--chip)',
    hoverBd: 'var(--line-2)',
  },
  ghost: {
    bg: 'transparent',
    fg: 'var(--ink-2)',
    bd: 'transparent',
    hoverBg: 'var(--chip)',
    hoverBd: 'transparent',
  },
  accent: {
    bg: 'var(--accent)',
    fg: '#fff',
    bd: 'var(--accent)',
    hoverBg: 'var(--accent-ink)',
    hoverBd: 'var(--accent-ink)',
  },
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
  const activeBg = active ? 'var(--ink)' : v.bg;
  const activeFg = active ? '#fff' : v.fg;
  const activeBd = active ? 'var(--ink)' : v.bd;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        background: activeBg,
        color: activeFg,
        border: `1px solid ${activeBd}`,
        borderRadius: 'var(--r-md)',
        padding: sz.pad,
        height: sz.h,
        fontSize: sz.fs,
        fontWeight: 600,
        letterSpacing: '-0.005em',
        transition: 'background-color .12s ease, border-color .12s ease, color .12s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (active) return;
        e.currentTarget.style.background = v.hoverBg;
        e.currentTarget.style.borderColor = v.hoverBd;
      }}
      onMouseLeave={(e) => {
        if (active) return;
        e.currentTarget.style.background = v.bg;
        e.currentTarget.style.borderColor = v.bd;
      }}
    >
      {icon}
      {children}
    </button>
  );
}
