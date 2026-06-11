import { describe, it, expect } from 'vitest';
import { CustomFieldResolutionError, CustomFieldValidationError } from '../custom-fields-errors.js';

describe('CustomFieldResolutionError', () => {
  it('carries kind, fieldName and suggestions', () => {
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

  it('invalid_value includes field name and detail', () => {
    const err = new CustomFieldResolutionError({
      kind: 'invalid_value',
      fieldName: 'Revenue',
      detail: 'Must be a positive number.',
    });
    expect(err.message).toContain('Revenue');
    expect(err.message).toContain('Must be a positive number.');
  });

  it('invalid_option includes field name and detail', () => {
    const err = new CustomFieldResolutionError({
      kind: 'invalid_option',
      fieldName: 'Stage',
      detail: 'Valid options are: Open, Closed.',
    });
    expect(err.message).toContain('Stage');
    expect(err.message).toContain('Valid options are: Open, Closed.');
  });

  it('not_found without suggestions does NOT contain "Did you mean"', () => {
    const errNoSuggestions = new CustomFieldResolutionError({
      kind: 'not_found',
      fieldName: 'Unknown',
    });
    expect(errNoSuggestions.message).not.toContain('Did you mean');

    const errEmptySuggestions = new CustomFieldResolutionError({
      kind: 'not_found',
      fieldName: 'Unknown',
      suggestions: [],
    });
    expect(errEmptySuggestions.message).not.toContain('Did you mean');
  });

  it('duplicate_name without candidates does NOT contain "Disambiguate"', () => {
    const errNoCandidates = new CustomFieldResolutionError({
      kind: 'duplicate_name',
      fieldName: 'Plan',
    });
    expect(errNoCandidates.message).not.toContain('Disambiguate');

    const errEmptyCandidates = new CustomFieldResolutionError({
      kind: 'duplicate_name',
      fieldName: 'Plan',
      candidates: [],
    });
    expect(errEmptyCandidates.message).not.toContain('Disambiguate');
  });

  it('exposes detail as instance property', () => {
    const err = new CustomFieldResolutionError({
      kind: 'invalid_value',
      fieldName: 'Budget',
      detail: 'Must be numeric.',
    });
    expect(err.detail).toBe('Must be numeric.');
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

  it('does not throw and includes field name when value is a circular reference', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    let err!: CustomFieldValidationError;
    expect(() => {
      err = new CustomFieldValidationError({
        fieldName: 'CircularField',
        expectedType: 'text',
        value: circular,
      });
    }).not.toThrow();
    expect(err.message).toContain('CircularField');
  });

  it('includes detail in message when provided', () => {
    const err = new CustomFieldValidationError({
      fieldName: 'StartDate',
      expectedType: 'date',
      value: 'not-a-date',
      detail: 'Use ISO 8601 format.',
    });
    expect(err.message).toContain('StartDate');
    expect(err.message).toContain('Use ISO 8601 format.');
  });
});
