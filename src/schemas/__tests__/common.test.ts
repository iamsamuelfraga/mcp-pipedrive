import { describe, it, expect } from 'vitest';
import {
  EmailSchema,
  EmailItemSchema,
  PhoneSchema,
  PhoneItemSchema,
  PaginationSchema,
  IdSchema,
  OptionalIdSchema,
  DealStatusSchema,
  VisibilitySchema,
  MarketingStatusSchema,
  CurrencySchema,
  DateStringSchema,
  DateTimeStringSchema,
  BooleanLikeSchema,
  SortDirectionSchema,
} from '../common.js';

describe('EmailItemSchema', () => {
  it('should accept valid email item', () => {
    const validEmail = {
      value: 'test@example.com',
      primary: true,
      label: 'work',
    };
    expect(() => EmailItemSchema.parse(validEmail)).not.toThrow();
  });

  it('should accept email without optional fields', () => {
    const minimalEmail = {
      value: 'test@example.com',
    };
    const result = EmailItemSchema.parse(minimalEmail);
    expect(result.primary).toBe(false); // default value
  });

  it('should reject invalid email format', () => {
    const invalidEmail = {
      value: 'not-an-email',
    };
    expect(() => EmailItemSchema.parse(invalidEmail)).toThrow('Invalid email format');
  });

  it('should reject empty email', () => {
    const emptyEmail = {
      value: '',
    };
    expect(() => EmailItemSchema.parse(emptyEmail)).toThrow();
  });
});

describe('EmailSchema', () => {
  it('should accept array with one email', () => {
    const validEmails = [{ value: 'test@example.com' }];
    expect(() => EmailSchema.parse(validEmails)).not.toThrow();
  });

  it('should accept array with multiple emails', () => {
    const validEmails = [
      { value: 'test1@example.com', primary: true, label: 'work' },
      { value: 'test2@example.com', primary: false, label: 'personal' },
    ];
    expect(() => EmailSchema.parse(validEmails)).not.toThrow();
  });

  it('should reject empty array', () => {
    expect(() => EmailSchema.parse([])).toThrow('At least one email is required');
  });

  it('should reject array with invalid email', () => {
    const invalidEmails = [{ value: 'invalid-email' }];
    expect(() => EmailSchema.parse(invalidEmails)).toThrow();
  });
});

describe('PhoneItemSchema', () => {
  it('should accept valid phone item', () => {
    const validPhone = {
      value: '+1-555-0123',
      primary: true,
      label: 'mobile',
    };
    expect(() => PhoneItemSchema.parse(validPhone)).not.toThrow();
  });

  it('should accept phone without optional fields', () => {
    const minimalPhone = {
      value: '1234567890',
    };
    const result = PhoneItemSchema.parse(minimalPhone);
    expect(result.primary).toBe(false);
  });

  it('should reject empty phone number', () => {
    const emptyPhone = {
      value: '',
    };
    expect(() => PhoneItemSchema.parse(emptyPhone)).toThrow('Phone number cannot be empty');
  });
});

describe('PhoneSchema', () => {
  it('should accept array with one phone', () => {
    const validPhones = [{ value: '+1-555-0123' }];
    expect(() => PhoneSchema.parse(validPhones)).not.toThrow();
  });

  it('should accept array with multiple phones', () => {
    const validPhones = [
      { value: '+1-555-0123', primary: true, label: 'mobile' },
      { value: '+1-555-0124', primary: false, label: 'work' },
    ];
    expect(() => PhoneSchema.parse(validPhones)).not.toThrow();
  });

  it('should reject empty array', () => {
    expect(() => PhoneSchema.parse([])).toThrow('At least one phone number is required');
  });
});

describe('PaginationSchema', () => {
  it('should accept valid pagination', () => {
    const valid = {
      start: 0,
      limit: 100,
    };
    expect(() => PaginationSchema.parse(valid)).not.toThrow();
  });

  it('should use default start value', () => {
    const result = PaginationSchema.parse({});
    expect(result.start).toBe(0);
  });

  it('should accept pagination without limit', () => {
    const valid = {
      start: 10,
    };
    expect(() => PaginationSchema.parse(valid)).not.toThrow();
  });

  it('should reject negative start', () => {
    const invalid = {
      start: -1,
      limit: 100,
    };
    expect(() => PaginationSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject non-integer start', () => {
    const invalid = {
      start: 1.5,
      limit: 100,
    };
    expect(() => PaginationSchema.parse(invalid)).toThrow('Start must be an integer');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = {
      start: 0,
      limit: 501,
    };
    expect(() => PaginationSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });

  it('should reject zero limit', () => {
    const invalid = {
      start: 0,
      limit: 0,
    };
    expect(() => PaginationSchema.parse(invalid)).toThrow('Limit must be positive');
  });

  it('should reject negative limit', () => {
    const invalid = {
      start: 0,
      limit: -10,
    };
    expect(() => PaginationSchema.parse(invalid)).toThrow('Limit must be positive');
  });
});

describe('IdSchema', () => {
  it('should accept positive integer', () => {
    expect(() => IdSchema.parse(1)).not.toThrow();
    expect(() => IdSchema.parse(999999)).not.toThrow();
  });

  it('should reject zero', () => {
    expect(() => IdSchema.parse(0)).toThrow('ID must be positive');
  });

  it('should reject negative number', () => {
    expect(() => IdSchema.parse(-1)).toThrow('ID must be positive');
  });

  it('should reject decimal number', () => {
    expect(() => IdSchema.parse(1.5)).toThrow('ID must be an integer');
  });

  it('should reject string', () => {
    expect(() => IdSchema.parse('123')).toThrow();
  });
});

describe('OptionalIdSchema', () => {
  it('should accept positive integer', () => {
    expect(() => OptionalIdSchema.parse(1)).not.toThrow();
  });

  it('should accept undefined', () => {
    expect(() => OptionalIdSchema.parse(undefined)).not.toThrow();
  });

  it('should reject zero', () => {
    expect(() => OptionalIdSchema.parse(0)).toThrow('ID must be positive');
  });
});

describe('DealStatusSchema', () => {
  it('should accept valid statuses', () => {
    expect(() => DealStatusSchema.parse('open')).not.toThrow();
    expect(() => DealStatusSchema.parse('won')).not.toThrow();
    expect(() => DealStatusSchema.parse('lost')).not.toThrow();
    expect(() => DealStatusSchema.parse('deleted')).not.toThrow();
    expect(() => DealStatusSchema.parse('all_not_deleted')).not.toThrow();
  });

  it('should reject invalid status', () => {
    expect(() => DealStatusSchema.parse('invalid')).toThrow('Status must be one of: open, won, lost, deleted, all_not_deleted');
  });

  it('should reject empty string', () => {
    expect(() => DealStatusSchema.parse('')).toThrow();
  });
});

describe('VisibilitySchema', () => {
  it('should accept valid visibility levels', () => {
    expect(() => VisibilitySchema.parse('1')).not.toThrow();
    expect(() => VisibilitySchema.parse('3')).not.toThrow();
    expect(() => VisibilitySchema.parse('5')).not.toThrow();
    expect(() => VisibilitySchema.parse('7')).not.toThrow();
  });

  it('should reject invalid visibility level', () => {
    expect(() => VisibilitySchema.parse('2')).toThrow('Visibility must be one of: 1 (private), 3 (shared), 5 (private), 7 (public)');
  });

  it('should reject numeric input', () => {
    expect(() => VisibilitySchema.parse(1)).toThrow();
  });
});

describe('MarketingStatusSchema', () => {
  it('should accept valid marketing statuses', () => {
    expect(() => MarketingStatusSchema.parse('no_consent')).not.toThrow();
    expect(() => MarketingStatusSchema.parse('unsubscribed')).not.toThrow();
    expect(() => MarketingStatusSchema.parse('subscribed')).not.toThrow();
    expect(() => MarketingStatusSchema.parse('archived')).not.toThrow();
  });

  it('should reject invalid marketing status', () => {
    expect(() => MarketingStatusSchema.parse('invalid')).toThrow('Marketing status must be one of: no_consent, unsubscribed, subscribed, archived');
  });
});

describe('CurrencySchema', () => {
  it('should accept valid 3-letter currency codes', () => {
    expect(() => CurrencySchema.parse('USD')).not.toThrow();
    expect(() => CurrencySchema.parse('EUR')).not.toThrow();
    expect(() => CurrencySchema.parse('GBP')).not.toThrow();
  });

  it('should convert to uppercase', () => {
    const result = CurrencySchema.parse('usd');
    expect(result).toBe('USD');
  });

  it('should reject 2-letter code', () => {
    expect(() => CurrencySchema.parse('US')).toThrow('Currency must be a 3-letter ISO code');
  });

  it('should reject 4-letter code', () => {
    expect(() => CurrencySchema.parse('USDA')).toThrow('Currency must be a 3-letter ISO code');
  });

  it('should reject empty string', () => {
    expect(() => CurrencySchema.parse('')).toThrow();
  });
});

describe('DateStringSchema', () => {
  it('should accept valid date format', () => {
    expect(() => DateStringSchema.parse('2024-12-10')).not.toThrow();
    expect(() => DateStringSchema.parse('2024-01-01')).not.toThrow();
  });

  it('should reject invalid date format', () => {
    expect(() => DateStringSchema.parse('12/10/2024')).toThrow('Date must be in YYYY-MM-DD format');
    expect(() => DateStringSchema.parse('2024-12-10T00:00:00')).toThrow('Date must be in YYYY-MM-DD format');
    expect(() => DateStringSchema.parse('2024-1-1')).toThrow('Date must be in YYYY-MM-DD format');
  });

  it('should reject empty string', () => {
    expect(() => DateStringSchema.parse('')).toThrow();
  });
});

describe('DateTimeStringSchema', () => {
  it('should accept valid ISO 8601 datetime', () => {
    expect(() => DateTimeStringSchema.parse('2024-12-10T10:30:00Z')).not.toThrow();
    expect(() => DateTimeStringSchema.parse('2024-12-10T10:30:00.000Z')).not.toThrow();
  });

  it('should reject invalid datetime format', () => {
    expect(() => DateTimeStringSchema.parse('2024-12-10')).toThrow('DateTime must be in ISO 8601 format');
    expect(() => DateTimeStringSchema.parse('2024-12-10 10:30:00')).toThrow('DateTime must be in ISO 8601 format');
  });
});

describe('BooleanLikeSchema', () => {
  it('should accept boolean values', () => {
    expect(BooleanLikeSchema.parse(true)).toBe(true);
    expect(BooleanLikeSchema.parse(false)).toBe(false);
  });

  it('should accept string "1" and "0"', () => {
    expect(BooleanLikeSchema.parse('1')).toBe(true);
    expect(BooleanLikeSchema.parse('0')).toBe(false);
  });

  it('should accept number 1 and 0', () => {
    expect(BooleanLikeSchema.parse(1)).toBe(true);
    expect(BooleanLikeSchema.parse(0)).toBe(false);
  });

  it('should transform all valid inputs to boolean', () => {
    expect(typeof BooleanLikeSchema.parse(true)).toBe('boolean');
    expect(typeof BooleanLikeSchema.parse('1')).toBe('boolean');
    expect(typeof BooleanLikeSchema.parse(1)).toBe('boolean');
  });

  it('should reject invalid values', () => {
    expect(() => BooleanLikeSchema.parse('true')).toThrow();
    expect(() => BooleanLikeSchema.parse(2)).toThrow();
    expect(() => BooleanLikeSchema.parse('yes')).toThrow();
  });
});

describe('SortDirectionSchema', () => {
  it('should accept valid sort directions', () => {
    expect(() => SortDirectionSchema.parse('asc')).not.toThrow();
    expect(() => SortDirectionSchema.parse('desc')).not.toThrow();
  });

  it('should use default value', () => {
    const result = SortDirectionSchema.parse(undefined);
    expect(result).toBe('asc');
  });

  it('should reject invalid direction', () => {
    expect(() => SortDirectionSchema.parse('ascending')).toThrow('Sort direction must be either asc or desc');
  });

  it('should reject uppercase', () => {
    expect(() => SortDirectionSchema.parse('ASC')).toThrow();
  });
});
