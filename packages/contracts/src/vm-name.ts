/** NFC + trim + collapse internal whitespace. Shared by web, API and seed. */
export function normalizeVmName(raw: string): string {
  return raw.normalize('NFC').trim().replace(/\s+/g, ' ');
}

/** Case-insensitive uniqueness key; accents are preserved. */
export function vmNameKey(raw: string): string {
  return normalizeVmName(raw).toLocaleLowerCase('en-US');
}
