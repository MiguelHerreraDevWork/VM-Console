export const ROLES = ['ADMIN', 'CLIENT'] as const;
export type Role = (typeof ROLES)[number];

export const VM_STATUSES = ['ON', 'OFF'] as const;
export type VmStatus = (typeof VM_STATUSES)[number];

export const VM_OS_OPTIONS = ['Ubuntu', 'Debian', 'Windows Server', 'Rocky Linux'] as const;
export type VmOs = (typeof VM_OS_OPTIONS)[number];

/** Semantic error codes in JSON body; HTTP status is separate. */
export const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'INVALID_CREDENTIALS',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'ORIGIN_NOT_ALLOWED',
  'NOT_FOUND',
  'VM_NOT_FOUND',
  'VM_NAME_TAKEN',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const SESSION_COOKIE_NAME = 'session';
