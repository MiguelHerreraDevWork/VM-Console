import type { ApiErrorCode } from '@repo/contracts';

const statusByCode: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  INVALID_CREDENTIALS: 401,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  ORIGIN_NOT_ALLOWED: 403,
  NOT_FOUND: 404,
  VM_NOT_FOUND: 404,
  VM_NAME_TAKEN: 409,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.code = code;
    this.statusCode = statusByCode[code];
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export function toErrorBody(error: HttpError) {
  const body: {
    error: { code: ApiErrorCode; message: string; details?: unknown };
  } = {
    error: {
      code: error.code,
      message: error.message,
    },
  };
  if (error.details !== undefined) {
    body.error.details = error.details;
  }
  return body;
}
