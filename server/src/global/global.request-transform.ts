import type { TransformFnParams } from 'class-transformer';

export const normalizeText = ({ value }: TransformFnParams) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
};

export const normalizeOptionalSearch = ({ value }: TransformFnParams) => {
  const normalized = normalizeText({ value } as TransformFnParams);

  if (typeof normalized !== 'string') {
    return normalized;
  }

  return normalized.length > 0 ? normalized : undefined;
};

export const normalizeSlug = ({ value }: TransformFnParams) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().toLowerCase();
};

export const toBooleanValue = ({ value }: TransformFnParams) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1') {
      return true;
    }

    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  return value;
};
