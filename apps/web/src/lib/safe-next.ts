/** Accept only same-origin relative paths (no protocol-relative `//`). */
export function safeNextPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw) {
    return fallback;
  }
  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return fallback;
  }
  return raw;
}
