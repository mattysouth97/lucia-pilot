// packages/contracts/src/lucia-energy/__tests__/inquiry.test.ts
import { describe, expect, it } from 'vitest';

import { LuciaEnergyInquirySchema } from '../inquiry.js';

describe('LuciaEnergyInquirySchema', () => {
  const base = {
    company: '주식회사 빛나는옥상',
    contact_name: '홍길동',
    email: 'inquiry@example.kr',
    phone: '02-1234-5678',
    persona: 'generator',
    interests: ['operations_outsource'],
    consent_pii: true,
  };

  it('accepts a valid payload', () => {
    expect(() => LuciaEnergyInquirySchema.parse(base)).not.toThrow();
  });

  it('rejects an empty interests array', () => {
    expect(() => LuciaEnergyInquirySchema.parse({ ...base, interests: [] })).toThrow();
  });

  it('rejects an unconsented submission', () => {
    expect(() =>
      LuciaEnergyInquirySchema.parse({ ...base, consent_pii: false }),
    ).toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() =>
      LuciaEnergyInquirySchema.parse({ ...base, email: 'not-an-email' }),
    ).toThrow();
  });

  it('rejects an unknown persona', () => {
    expect(() =>
      LuciaEnergyInquirySchema.parse({ ...base, persona: 'martian' }),
    ).toThrow();
  });
});
