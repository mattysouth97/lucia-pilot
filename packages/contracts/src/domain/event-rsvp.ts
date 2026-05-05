// FRD §6 v1.3 — EventRSVP (FR-M-010 RSVP signal for community events)
//
// One row per (event, resident). Updates if the resident changes their mind.

import { z } from 'zod';

export const EventRSVPStatus = z.enum(['attending', 'maybe', 'declined']);
export type EventRSVPStatus = z.infer<typeof EventRSVPStatus>;

export const EventRSVP = z.object({
  id: z.string().min(1),
  event_id: z.string().min(1),
  resident_id: z.string().min(1),
  status: EventRSVPStatus,
  rsvp_at: z.string().datetime(),
});
export type EventRSVP = z.infer<typeof EventRSVP>;
