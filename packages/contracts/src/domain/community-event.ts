// FRD §6 v1.3 — CommunityEvent (FR-M-010 입주민 커뮤니티 이벤트 피드)
//
// ESG events / 마을투어 / 농산물 지원 sessions. Created by operators
// (/admin/community), surfaced to residents at /portal/{id}/community.
// Past events also feed an archive grid with photo gallery.

import { z } from 'zod';

import { BeneficiaryCategory } from './beneficiary.js';

export const CommunityEventStatus = z.enum(['upcoming', 'past']);
export type CommunityEventStatus = z.infer<typeof CommunityEventStatus>;

export const CommunityEvent = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  /** Event start datetime (ISO). For past events this is when the event occurred. */
  datetime: z.string().datetime(),
  location: z.string().min(1),
  capacity: z.number().int().positive(),
  /** Hero image / cover photo. Null until the operator uploads one. */
  photo_url: z.string().url().nullable(),
  /** Which beneficiary groups are invited. Empty → open to all residents. */
  beneficiary_groups: z.array(BeneficiaryCategory).default([]),
  status: CommunityEventStatus,
  /** Operator (FR-A-001 'operator' role) who created the event. */
  created_by_operator_id: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type CommunityEvent = z.infer<typeof CommunityEvent>;
