export type ResolutionErrorKind =
  | 'not_found'
  | 'duplicate_name'
  | 'invalid_value'
  | 'invalid_option';

export interface ResolutionErrorParams {
  kind: ResolutionErrorKind;
  fieldName: string;
  suggestions?: string[];
  candidates?: string[];
  detail?: string;
}

export class CustomFieldResolutionError extends Error {
  readonly kind: ResolutionErrorKind;
  readonly fieldName: string;
  readonly suggestions?: string[];
  readonly candidates?: string[];

  constructor(params: ResolutionErrorParams) {
    const parts = [`Custom field "${params.fieldName}"`];
    switch (params.kind) {
      case 'not_found':
        parts.push('not found.');
        if (params.suggestions?.length) {
          parts.push(`Did you mean: ${params.suggestions.map((s) => `"${s}"`).join(', ')}?`);
        }
        break;
      case 'duplicate_name':
        parts.push('matches multiple definitions.');
        if (params.candidates?.length) {
          parts.push(`Disambiguate using one of: ${params.candidates.join(', ')}.`);
        }
        break;
      case 'invalid_value':
        parts.push('has an invalid value.');
        if (params.detail) parts.push(params.detail);
        break;
      case 'invalid_option':
        parts.push('option label not found.');
        if (params.detail) parts.push(params.detail);
        break;
    }
    super(parts.join(' '));
    this.name = 'CustomFieldResolutionError';
    this.kind = params.kind;
    this.fieldName = params.fieldName;
    this.suggestions = params.suggestions;
    this.candidates = params.candidates;
  }
}

export interface ValidationErrorParams {
  fieldName: string;
  expectedType: string;
  value: unknown;
  detail?: string;
}

export class CustomFieldValidationError extends Error {
  readonly fieldName: string;
  readonly expectedType: string;
  readonly value: unknown;

  constructor(params: ValidationErrorParams) {
    const valueStr =
      typeof params.value === 'string' ? params.value : JSON.stringify(params.value);
    const detail = params.detail ? ` ${params.detail}` : '';
    super(
      `Custom field "${params.fieldName}" expects type ${params.expectedType}, got ${valueStr}.${detail}`
    );
    this.name = 'CustomFieldValidationError';
    this.fieldName = params.fieldName;
    this.expectedType = params.expectedType;
    this.value = params.value;
  }
}
