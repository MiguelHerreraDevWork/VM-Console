/** Parse JWT_EXPIRES_IN values like `8h`, `30m`, `3600s`, or plain seconds. */
export function expiresInToSeconds(value: string): number {
  const trimmed = value.trim();
  const match = /^(\d+)([smhd])?$/i.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${value}`);
  }
  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      throw new Error(`Invalid JWT_EXPIRES_IN unit: ${value}`);
  }
}
