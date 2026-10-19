/**
 * Accept only same-origin relative paths. Rejects protocol-relative `//host` and any
 * backslash: browsers normalise `/\host` to `//host`, which would be an open redirect.
 */
export function safeNextPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw) {
    return fallback;
  }
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return fallback;
  }
  // Control characters (e.g. tab/newline) are stripped by URL parsers and can hide `//`.
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) {
      return fallback;
    }
  }
  return raw;
}
