import { ApiClientError } from './api-client';

type FieldPath = 'name' | 'cores' | 'ram' | 'disk' | 'os' | 'status';

const FIELD_PATHS = new Set<string>(['name', 'cores', 'ram', 'disk', 'os', 'status']);

export function mapApiDetailsToFieldErrors(
  error: unknown,
): Partial<Record<FieldPath, string>> {
  if (!(error instanceof ApiClientError) || !Array.isArray(error.details)) {
    return {};
  }

  const next: Partial<Record<FieldPath, string>> = {};
  for (const item of error.details) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'path' in item &&
      'message' in item &&
      typeof (item as { path: unknown }).path === 'string' &&
      typeof (item as { message: unknown }).message === 'string'
    ) {
      const path = (item as { path: string }).path.split('.')[0] ?? '';
      if (FIELD_PATHS.has(path) && next[path as FieldPath] === undefined) {
        next[path as FieldPath] = (item as { message: string }).message;
      }
    }
  }
  return next;
}
