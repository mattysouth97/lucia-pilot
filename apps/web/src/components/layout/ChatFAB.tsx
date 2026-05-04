import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/components/Icons';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json() as { content: string };
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: data.content },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          width: 336,
          height: 480,
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(10,12,15,0.14)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 41,
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bar)',
            color: 'var(--bar-ink)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
                Lucia AI
              </span>
            </div>
            <button
              aria-label="닫기"
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                color: 'var(--bar-ink-2)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--bar-ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--bar-ink-2)')}
            >
              {Icons.Cross}
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {messages.length === 0 && (
              <p style={{
                color: 'var(--muted-2)',
                fontSize: 12.5,
                textAlign: 'center',
                marginTop: 48,
                lineHeight: 1.6,
              }}>
                정산 데이터, 이상 감지,<br />보조금 현황에 대해 물어보세요.
              </p>
            )}

            {messages.map(m => (
              <div key={m.id} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '7px 11px',
                  borderRadius: m.role === 'user'
                    ? '10px 10px 2px 10px'
                    : '10px 10px 10px 2px',
                  background: m.role === 'user' ? 'var(--accent-soft)' : 'var(--chip)',
                  color: m.role === 'user' ? 'var(--accent-ink)' : 'var(--ink)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '9px 13px',
                  borderRadius: '10px 10px 10px 2px',
                  background: 'var(--chip)',
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center',
                }}>
                  {([0, 1, 2] as const).map(i => (
                    <span key={i} className={`chat-dot chat-dot-${i}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            gap: 7,
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="메시지 입력..."
              disabled={loading}
              style={{
                flex: 1,
                height: 34,
                padding: '0 10px',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: 13,
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--line)')}
            />
            <button
              aria-label="전송"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--r-md)',
                background: loading || !input.trim() ? 'var(--chip)' : 'var(--accent)',
                color: loading || !input.trim() ? 'var(--muted)' : '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                transition: 'background .15s',
                flexShrink: 0,
              }}
            >
              {Icons.Arrow}
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        aria-label={open ? 'AI 도우미 닫기' : 'AI 도우미 열기'}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 999,
          background: open ? 'var(--bar)' : 'var(--accent)',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          boxShadow: fabHovered
            ? '0 8px 28px rgba(18,100,211,0.45)'
            : '0 4px 16px rgba(18,100,211,0.28)',
          zIndex: 42,
          cursor: 'pointer',
          transform: fabHovered ? 'scale(1.07)' : 'scale(1)',
          transition: 'transform .18s ease, box-shadow .18s ease, background .18s ease',
          border: 'none',
        }}
      >
        {open ? Icons.Cross : Icons.Chat}
      </button>
    </>
  );
}
