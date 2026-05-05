// FR-R-005 — SHA-256 of the signed LOI payload, registered to FR-S-007 endpoint
// for chain-of-custody. Uses WebCrypto (available in browser + jsdom + Node 20+).

/**
 * Hash a string (or Uint8Array) with SHA-256 and return the lowercase hex digest.
 * Throws if WebCrypto is unavailable.
 */
export async function sha256Hex(input: string | Uint8Array | Blob): Promise<string> {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error('WebCrypto SubtleCrypto not available — cannot compute SHA-256');
  }
  const bytes = await toBytes(input);
  // TS 5.7+ tightened BufferSource typing — Uint8Array<ArrayBufferLike> doesn't
  // strictly satisfy BufferSource (which excludes SharedArrayBuffer-backed views).
  // Pass the underlying ArrayBuffer directly; `bytes` always wraps an ArrayBuffer
  // here (TextEncoder + Blob.arrayBuffer + the Uint8Array branch all return ArrayBuffer).
  const buf = await globalThis.crypto.subtle.digest('SHA-256', bytes.buffer as ArrayBuffer);
  return bytesToHex(new Uint8Array(buf));
}

async function toBytes(input: string | Uint8Array | Blob): Promise<Uint8Array> {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  // ArrayBuffer.isView avoids cross-realm `instanceof Uint8Array` failures
  // (jsdom's Uint8Array comes from a different realm than Vitest's globals).
  if (ArrayBuffer.isView(input)) {
    const view = input as Uint8Array;
    return new Uint8Array(view.buffer as ArrayBuffer, view.byteOffset, view.byteLength);
  }
  // Blob path — only exercised in real browsers / Node 20 globalThis.Blob
  // (jsdom's Blob shim returns inconsistent bytes; Slice 2 generator tests
  // exercise this end-to-end in the browser-like environment that matters).
  return new Uint8Array(await (input as Blob).arrayBuffer());
}

function bytesToHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i]!.toString(16).padStart(2, '0');
  }
  return s;
}
