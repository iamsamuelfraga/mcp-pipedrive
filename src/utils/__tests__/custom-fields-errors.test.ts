import { describe, it, expect } from 'vitest';
import {
  CustomFieldResolutionError,
  CustomFieldValidationError,
} from '../custom-fields-errors.js';

describe('CustomFieldResolutionError', () => {
  it('carries kind, fieldName, suggestions and candidates', () => {
    const err = new CustomFieldResolutionError({
      kind: 'not_found',
      fieldName: 'Industri',
      suggestions: ['Industria', 'Industry'],
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.kind).toBe('not_found');
    expect(err.fieldName).toBe('Industri');
    expect(err.suggestions).toEqual(['Industria', 'Industry']);
    expect(err.message).toContain('Industri');
    expect(err.message).toContain('Industria');
  });

  it('emits duplicate_name with candidate hashes', () => {
    const err = new CustomFieldResolutionError({
      kind: 'duplicate_name',
      fieldName: 'Plan',
      candidates: ['hash-a', 'hash-b'],
    });
    expect(err.message).toContain('hash-a');
    expect(err.message).toContain('hash-b');
  });
});

describe('CustomFieldValidationError', () => {
  it('reports field name, expected type, and the offending value', () => {
    const err = new CustomFieldValidationError({
      fieldName: 'Budget',
      expectedType: 'monetary',
      value: 'not a number',
    });
    expect(err.message).toContain('Budget');
    expect(err.message).toContain('monetary');
    expect(err.message).toContain('not a number');
  });
});
