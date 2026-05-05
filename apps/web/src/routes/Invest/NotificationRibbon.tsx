// Thin black ribbon at the very top of /invest. Closeable; dismissal persists
// in localStorage so it stays hidden across reloads.

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'lucia.invest.ribbon.v1';
const RIBBON_TEXT = 'M+3 — LH 본사 시연 · Lucia 첫 분배 2026.05.05';
const RIBBON_HREF = '/invest/onboarding';

export function NotificationRibbon() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === 'dismissed');
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      /* sandboxed contexts disallow storage; fall back to in-memory only */
    }
    setHidden(true);
  }

  return (
    <div
      role="region"
      aria-label="공지사항"
      style={{
        background: 'var(--ink)',
        color: '#FFFFFF',
        fontSize: 12.5,
        letterSpacing: '-0.005em',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <a
        href={RIBBON_HREF}
        style={{
          color: '#FFFFFF',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: 999,
            background: 'var(--accent)',
          }}
        />
        {RIBBON_TEXT}
        <span aria-hidden style={{ color: 'rgba(255,255,255,0.55)' }}>→</span>
      </a>
      <button
        type="button"
        aria-label="닫기"
        onClick={dismiss}
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 16,
          lineHeight: 1,
          cursor: 'pointer',
          padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}
