declare module 'wawoff2' {
  /** WOFF2 → TTF decompression. */
  export function decompress(input: Uint8Array): Promise<Uint8Array>;
  /** TTF → WOFF2 compression (unused). */
  export function compress(input: Uint8Array): Promise<Uint8Array>;
  const _default: { decompress: typeof decompress; compress: typeof compress };
  export default _default;
}
