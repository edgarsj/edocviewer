/**
 * Byte content as a Blob part.
 *
 * TypeScript's DOM types only accept ArrayBuffer-backed views as BlobPart.
 * File contents here come from FileReader/fetch or fflate, which always
 * allocate regular ArrayBuffers (never SharedArrayBuffer), so this is a
 * type-level narrowing without copying the data.
 */
export function toBlobPart(data: Uint8Array | ArrayBuffer): BlobPart {
  return data as Uint8Array<ArrayBuffer> | ArrayBuffer;
}
