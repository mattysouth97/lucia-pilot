// FR-R-005 — shared shape passed into both RE100 and retail LOI templates.
// Kept narrow: only the fields the rendered HTML actually displays.

import type { Investor, LOI } from '@lucia/contracts/domain';

export interface LOIDocumentInput {
  /** The LOI being rendered. */
  readonly loi: LOI;
  /** The investor identity (RE100 vs retail union — discriminator drives template). */
  readonly investor: Investor;
  /** Resolved site display labels (e.g. "ULJN-001 — 경상북도 울진군 울진읍"). */
  readonly siteLabels: readonly string[];
  /** Optional: timestamp printed on the LOI cover (ISO datetime). Defaults to loi.created_at. */
  readonly issuedAt?: string;
}

/** Korean number formatter for KRW amounts (e.g. 1,200,000원). */
export function formatKRW(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

/** YYYY년 M월 D일. */
export function formatDateKR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** HTML-escape user-supplied text. Prevents XSS via investor names etc. */
export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
