import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitInquiry } from '../../src/lib/inquiryApi';

const VALID_INQUIRY = {
  company: 'Acme',
  contact_name: '홍길동',
  email: 'a@b.kr',
  phone: '02-0000-0000',
  persona: 'generator' as const,
  interests: ['operations_outsource' as const],
  consent_pii: true as const,
};

describe('submitInquiry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('falls back to console.info when no endpoint is configured', async () => {
    // vi.stubEnv with empty string is the canonical way to clear an env var in
    // vitest — direct assignment to import.meta.env doesn't propagate.
    vi.stubEnv('VITE_INQUIRY_ENDPOINT', '');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const result = await submitInquiry(VALID_INQUIRY);
    expect(result).toEqual({ ok: true, mode: 'console' });
    expect(spy).toHaveBeenCalled();
  });

  it('POSTs to the configured endpoint when set', async () => {
    vi.stubEnv('VITE_INQUIRY_ENDPOINT', 'https://api.example.kr/inquiry');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const result = await submitInquiry(VALID_INQUIRY);
    expect(result).toEqual({ ok: true, mode: 'http' });
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.example.kr/inquiry',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns { ok: false, mode: "http", error } when fetch rejects', async () => {
    vi.stubEnv('VITE_INQUIRY_ENDPOINT', 'https://api.example.kr/inquiry');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const result = await submitInquiry(VALID_INQUIRY);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.mode).toBe('http');
      expect(result.error).toContain('network down');
    }
  });

  it('rejects an invalid payload before submitting', async () => {
    vi.stubEnv('VITE_INQUIRY_ENDPOINT', '');
    const result = await submitInquiry({
      ...VALID_INQUIRY,
      email: 'not-an-email',
    } as never);
    expect(result.ok).toBe(false);
  });
});
