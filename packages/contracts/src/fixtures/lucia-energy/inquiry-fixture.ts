// packages/contracts/src/fixtures/lucia-energy/inquiry-fixture.ts
import { LuciaEnergyInquirySchema, type LuciaEnergyInquiry } from '../../lucia-energy/inquiry.js';

export const inquiryFixture: LuciaEnergyInquiry = LuciaEnergyInquirySchema.parse({
  company: '주식회사 빛나는옥상',
  contact_name: '홍길동',
  email: 'inquiry@example.kr',
  phone: '02-1234-5678',
  persona: 'generator',
  interests: ['operations_outsource', 'multi_asset'],
  message: '서울시 강남구 옥상 4동(합계 약 1,200평) 통합 운영 위탁 가능 여부 문의드립니다.',
  consent_pii: true,
});
