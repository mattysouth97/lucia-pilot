import type { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', marginBottom: 16,
    }}>
      <div>
        <div style={{
          fontSize: 17, fontWeight: 700,
          letterSpacing: '-0.02em', color: '#0E1116',
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            fontSize: 13, color: '#6B7280',
            marginTop: 2, letterSpacing: '-0.01em',
          }}>
            {subtitle}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}
