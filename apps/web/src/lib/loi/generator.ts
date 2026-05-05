// FR-R-005 — LOI generator. Orchestrates template selection + HTML rendering
// + Blob construction + SHA-256 hashing.
//
// Output is consumed by:
//   - <LOIPreview> — iframe srcDoc
//   - "PDF download" button (window.print() against the iframe in browser)
//   - blockchain-hash registration (Slice 3)

import { sha256Hex } from './sha256.js';
import { renderRE100Template } from './templates/re100.js';
import { renderRetailTemplate } from './templates/retail.js';
import type { LOIDocumentInput } from './templates/types.js';

export interface LOIGenerateOutput {
  /** Rendered HTML (full <!doctype html> document). */
  readonly html: string;
  /** HTML wrapped in a Blob ('text/html') — printable / downloadable. */
  readonly blob: Blob;
  /** SHA-256 hex digest of the HTML (UTF-8 bytes). Used for FR-S-007 registration. */
  readonly hash: string;
}

/**
 * Render an LOI document and produce {html, blob, hash}.
 *
 * Throws if the LOI's investor.type doesn't match a known template.
 * The shape passes validate() / Investor.parse() upstream — this function
 * trusts its input shape and focuses on output orchestration.
 *
 * Performance: with the small templates here, completes in a few ms in
 * the browser. FRD AC ("PDF 5초 이내") refers to the print-to-PDF cycle
 * (browser-side window.print after iframe srcdoc paint), not this call.
 */
export async function generateLOI(input: LOIDocumentInput): Promise<LOIGenerateOutput> {
  const html = renderTemplate(input);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const hash = await sha256Hex(html);
  return { html, blob, hash };
}

function renderTemplate(input: LOIDocumentInput): string {
  switch (input.investor.type) {
    case 're100':
      return renderRE100Template(input);
    case 'retail':
      return renderRetailTemplate(input);
    default: {
      const exhaustive: never = input.investor;
      void exhaustive;
      throw new Error(
        `generateLOI: unknown investor.type ${(input.investor as { type: string }).type}`,
      );
    }
  }
}
