// apps/lucia-energy/src/sections/InquirySplit.tsx
// 2-column inquiry form: 전기구매자 / 발전사업자.
import { LuciaEnergy } from '@lucia/contracts';
import type { CSSProperties } from 'react';
import { useEffect, useId, useState } from 'react';

import { INQUIRY } from '../copy';
import { submitInquiry } from '../lib/inquiryApi';

type Persona = LuciaEnergy.Persona;
type Interest = LuciaEnergy.Interest;

interface InquirySplitProps {
  initialPersona?: Persona;
}

export function InquirySplit({ initialPersona }: InquirySplitProps) {
  return (
    <section
      aria-labelledby="inquiry-heading"
      style={{ padding: '80px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="inquiry-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {INQUIRY.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24,
        }}
      >
        <InquiryCard
          title={INQUIRY.buyer.title}
          sub={INQUIRY.buyer.sub}
          defaultPersona={initialPersona ?? INQUIRY.buyer.defaultPersona}
        />
        <InquiryCard
          title={INQUIRY.generator.title}
          sub={INQUIRY.generator.sub}
          defaultPersona={initialPersona ?? INQUIRY.generator.defaultPersona}
        />
      </div>
    </section>
  );
}

interface InquiryCardProps {
  title: string;
  sub: string;
  defaultPersona: Persona;
}

function InquiryCard({ title, sub, defaultPersona }: InquiryCardProps) {
  const id = useId();
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [persona, setPersona] = useState<Persona>(defaultPersona);
  const [interests, setInterests] = useState<ReadonlyArray<Interest>>([]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Honor URL hash #persona=<key> — set by section persona-chip clicks.
  useEffect(() => {
    const m = window.location.hash.match(/persona=([a-z_]+)/);
    if (m && m[1]) {
      const guard = LuciaEnergy.PersonaEnum.safeParse(m[1]);
      if (guard.success) setPersona(guard.data);
    }
  }, []);

  const toggleInterest = (i: Interest) => {
    setInterests(prev => (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const result = await submitInquiry({
      company,
      contact_name: contact,
      email,
      phone,
      persona,
      interests,
      message: message.length > 0 ? message : undefined,
      consent_pii: consent,
      source_url: window.location.href,
    });
    if (result.ok) {
      setStatus('success');
    } else {
      setStatus('error');
      setError(result.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card card-pad" style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{sub}</div>

      <Field id={`${id}-company`} label={INQUIRY.fields.company} required>
        <input
          id={`${id}-company`}
          type="text"
          required
          value={company}
          onChange={e => setCompany(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field id={`${id}-contact`} label={INQUIRY.fields.contact} required>
        <input
          id={`${id}-contact`}
          type="text"
          required
          value={contact}
          onChange={e => setContact(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field id={`${id}-email`} label={INQUIRY.fields.email} required>
        <input
          id={`${id}-email`}
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field id={`${id}-phone`} label={INQUIRY.fields.phone} required>
        <input
          id={`${id}-phone`}
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field id={`${id}-persona`} label={INQUIRY.fields.persona} required>
        <select
          id={`${id}-persona`}
          value={persona}
          onChange={e => setPersona(e.target.value as Persona)}
          style={inputStyle}
        >
          {(Object.keys(INQUIRY.personaLabels) as ReadonlyArray<Persona>).map(k => (
            <option key={k} value={k}>
              {INQUIRY.personaLabels[k]}
            </option>
          ))}
        </select>
      </Field>

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={legendStyle}>{INQUIRY.fields.interests}</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {(Object.keys(INQUIRY.interestLabels) as ReadonlyArray<Interest>).map(k => {
            const checked = interests.includes(k);
            return (
              <label
                key={k}
                style={{
                  ...chipStyle,
                  background: checked ? 'var(--accent-soft)' : 'transparent',
                  borderColor: checked ? 'var(--accent)' : 'var(--line)',
                  color: checked ? 'var(--accent)' : 'var(--ink-2)',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleInterest(k)}
                  style={{ marginRight: 6 }}
                />
                {INQUIRY.interestLabels[k]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field id={`${id}-message`} label={INQUIRY.fields.message}>
        <textarea
          id={`${id}-message`}
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </Field>

      <label style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', gap: 6 }}>
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
        />
        {INQUIRY.fields.consent}
      </label>

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          marginTop: 8,
          padding: '12px 16px',
          background: 'var(--accent)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'var(--r-md)',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {status === 'sending' ? INQUIRY.fields.sending : INQUIRY.fields.submit}
      </button>

      {status === 'success' && (
        <div role="status" style={{ fontSize: 13, color: 'var(--positive)' }}>
          {INQUIRY.fields.success}
        </div>
      )}
      {status === 'error' && (
        <div role="alert" style={{ fontSize: 13, color: 'var(--alert)' }}>
          {INQUIRY.fields.errorPrefix}: {error}.{' '}
          <a
            href={INQUIRY.fields.fallbackMailto}
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            {INQUIRY.fields.fallbackMailtoLabel}
          </a>
        </div>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 4 }}>
      <span style={legendStyle}>
        {label}
        {required ? ' *' : null}
      </span>
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  fontFamily: 'inherit',
  color: 'var(--ink)',
  background: 'var(--bg)',
};

const legendStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink-3)',
};

const chipStyle: CSSProperties = {
  padding: '6px 12px',
  border: '1px solid',
  borderRadius: 'var(--r-sm)',
  fontSize: 12.5,
  cursor: 'pointer',
};
