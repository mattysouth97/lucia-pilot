// apps/lucia-energy/src/lib/inquiryApi.ts
// 3-tier fallback for inquiry submission:
//   1. POST to VITE_INQUIRY_ENDPOINT if set
//   2. console.info fallback (dev / pre-backend)
//   3. mailto: failsafe (rendered as a link by InquirySplit, not invoked here)
import { LuciaEnergy } from '@lucia/contracts';

export type SubmitInquiryResult =
  | { ok: true; mode: 'http' | 'console' }
  | { ok: false; mode: 'http' | 'validation'; error: string };

export async function submitInquiry(payload: unknown): Promise<SubmitInquiryResult> {
  const parsed = LuciaEnergy.LuciaEnergyInquirySchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, mode: 'validation', error: parsed.error.message };
  }

  const endpoint = import.meta.env.VITE_INQUIRY_ENDPOINT;
  if (!endpoint) {
    // Dev fallback. ops@ receives nothing here — it is a sentinel for "backend not yet wired".
    // eslint-disable-next-line no-console
    console.info('[lucia-energy] inquiry submitted (console fallback):', parsed.data);
    return { ok: true, mode: 'console' };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      return { ok: false, mode: 'http', error: `HTTP ${res.status}` };
    }
    return { ok: true, mode: 'http' };
  } catch (err) {
    return {
      ok: false,
      mode: 'http',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
