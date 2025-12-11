/**
 * Tests for Pipedrive validation schemas
 * These tests demonstrate validation behavior and serve as documentation
 */

import { describe, it, expect } from 'vitest';
import { CreateDealSchema, UpdateDealSchema, ListDealsSchema, SearchDealsSchema } from '../deal.js';
import { CreatePersonSchema, UpdatePersonSchema, SearchPersonsSchema } from '../person.js';
import { CreateOrganizationSchema, UpdateOrganizationSchema } from '../organization.js';
import { CreateActivitySchema, ListActivitiesSchema, ActivityTypeSchema } from '../activity.js';
import { UploadFileSchema, UploadFileFromPathSchema } from '../file.js';
import {
  PaginationSchema,
  VisibilitySchema,
  EmailSchema,
  PhoneSchema,
  DealStatusSchema,
  CurrencySchema,
} from '../common.js';

// ============================================================================
// Common Schemas Tests
// ============================================================================

describe('Common Schemas', () => {
  describe('PaginationSchema', () => {
    it('should accept valid pagination params', () => {
      const result = PaginationSchema.safeParse({
        start: 0,
        limit: 50,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative start', () => {
      const result = PaginationSchema.safeParse({
        start: -1,
        limit: 50,
      });
      expect(result.success).toBe(false);
    });

    it('should reject limit over 500', () => {
      const result = PaginationSchema.safeParse({
        start: 0,
        limit: 501,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('VisibilitySchema', () => {
    it('should accept valid visibility levels', () => {
      expect(VisibilitySchema.safeParse('1').success).toBe(true);
      expect(VisibilitySchema.safeParse('3').success).toBe(true);
      expect(VisibilitySchema.safeParse('5').success).toBe(true);
      expect(VisibilitySchema.safeParse('7').success).toBe(true);
    });

    it('should reject invalid visibility levels', () => {
      expect(VisibilitySchema.safeParse('2').success).toBe(false);
      expect(VisibilitySchema.safeParse('10').success).toBe(false);
    });
  });

  describe('EmailSchema', () => {
    it('should accept valid email array', () => {
      const result = EmailSchema.safeParse([
        { value: 'test@example.com', primary: true, label: 'work' },
      ]);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = EmailSchema.safeParse([{ value: 'invalid-email', primary: true }]);
      expect(result.success).toBe(false);
    });

    it('should reject empty array', () => {
      const result = EmailSchema.safeParse([]);
      expect(result.success).toBe(false);
    });
  });

  describe('CurrencySchema', () => {
    it('should accept valid 3-letter currency codes', () => {
      expect(CurrencySchema.safeParse('USD').success).toBe(true);
      expect(CurrencySchema.safeParse('EUR').success).toBe(true);
      expect(CurrencySchema.safeParse('gbp').success).toBe(true); // Should convert to uppercase
    });

    it('should reject invalid currency codes', () => {
      expect(CurrencySchema.safeParse('US').success).toBe(false);
      expect(CurrencySchema.safeParse('USDD').success).toBe(false);
    });
  });
});

// ============================================================================
// Deal Schemas Tests
// ============================================================================

describe('Deal Schemas', () => {
  describe('CreateDealSchema', () => {
    it('should accept valid deal data', () => {
      const result = CreateDealSchema.safeParse({
        title: 'Test Deal',
        value: 1000,
        currency: 'USD',
        person_id: 123,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = CreateDealSchema.safeParse({
        title: '',
        value: 1000,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative value', () => {
      const result = CreateDealSchema.safeParse({
        title: 'Test Deal',
        value: -100,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid probability', () => {
      const result = CreateDealSchema.safeParse({
        title: 'Test Deal',
        probability: 150,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateDealSchema', () => {
    it('should require deal ID', () => {
      const result = UpdateDealSchema.safeParse({
        title: 'Updated Deal',
      });
      expect(result.success).toBe(false);
    });

    it('should accept partial updates', () => {
      const result = UpdateDealSchema.safeParse({
        id: 123,
        value: 2000,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('SearchDealsSchema', () => {
    it('should accept valid search params', () => {
      const result = SearchDealsSchema.safeParse({
        term: 'test',
        fields: 'title',
        exact_match: false,
      });
      expect(result.success).toBe(true);
    });

    it('should reject search term less than 2 characters', () => {
      const result = SearchDealsSchema.safeParse({
        term: 'a',
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// Person Schemas Tests
// ============================================================================

describe('Person Schemas', () => {
  describe('CreatePersonSchema', () => {
    it('should accept valid person data', () => {
      const result = CreatePersonSchema.safeParse({
        name: 'John Doe',
        email: [{ value: 'john@example.com', primary: true }],
        phone: [{ value: '+1-555-0123', primary: true }],
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = CreatePersonSchema.safeParse({
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid marketing status', () => {
      const result = CreatePersonSchema.safeParse({
        name: 'John Doe',
        marketing_status: 'subscribed',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('UpdatePersonSchema', () => {
    it('should require person ID', () => {
      const result = UpdatePersonSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(false);
    });

    it('should accept partial updates with ID', () => {
      const result = UpdatePersonSchema.safeParse({
        id: 123,
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// Organization Schemas Tests
// ============================================================================

describe('Organization Schemas', () => {
  describe('CreateOrganizationSchema', () => {
    it('should accept valid organization data', () => {
      const result = CreateOrganizationSchema.safeParse({
        name: 'Acme Corp',
        address: '123 Main St',
        address_locality: 'San Francisco',
        address_country: 'USA',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = CreateOrganizationSchema.safeParse({
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept full address details', () => {
      const result = CreateOrganizationSchema.safeParse({
        name: 'Acme Corp',
        address_street_number: '123',
        address_route: 'Main Street',
        address_locality: 'San Francisco',
        address_admin_area_level_1: 'California',
        address_country: 'United States',
        address_postal_code: '94102',
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// Activity Schemas Tests
// ============================================================================

describe('Activity Schemas', () => {
  describe('ActivityTypeSchema', () => {
    it('should accept valid activity types', () => {
      expect(ActivityTypeSchema.safeParse('call').success).toBe(true);
      expect(ActivityTypeSchema.safeParse('meeting').success).toBe(true);
      expect(ActivityTypeSchema.safeParse('task').success).toBe(true);
    });

    it('should reject invalid activity types', () => {
      expect(ActivityTypeSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('CreateActivitySchema', () => {
    it('should accept valid activity data', () => {
      const result = CreateActivitySchema.safeParse({
        subject: 'Test Meeting',
        type: 'meeting',
        due_date: '2025-12-15',
        deal_id: 123,
      });
      expect(result.success).toBe(true);
    });

    it('should require at least one association', () => {
      const result = CreateActivitySchema.safeParse({
        subject: 'Test Meeting',
        type: 'meeting',
        due_date: '2025-12-15',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid time format', () => {
      const result = CreateActivitySchema.safeParse({
        subject: 'Test Meeting',
        type: 'meeting',
        due_date: '2025-12-15',
        due_time: '14:30',
        deal_id: 123,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const result = CreateActivitySchema.safeParse({
        subject: 'Test Meeting',
        type: 'meeting',
        due_date: '2025-12-15',
        due_time: '25:00',
        deal_id: 123,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ListActivitiesSchema', () => {
    it('should validate date range', () => {
      const result = ListActivitiesSchema.safeParse({
        start_date: '2025-12-01',
        end_date: '2025-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const result = ListActivitiesSchema.safeParse({
        start_date: '2025-12-31',
        end_date: '2025-12-01',
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// File Schemas Tests
// ============================================================================

describe('File Schemas', () => {
  describe('UploadFileSchema', () => {
    it('should accept valid file upload data', () => {
      const buffer = Buffer.from('test');
      const result = UploadFileSchema.safeParse({
        file: buffer,
        file_name: 'test.pdf',
        deal_id: 123,
      });
      expect(result.success).toBe(true);
    });

    it('should require at least one association', () => {
      const buffer = Buffer.from('test');
      const result = UploadFileSchema.safeParse({
        file: buffer,
        file_name: 'test.pdf',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-Buffer file', () => {
      const result = UploadFileSchema.safeParse({
        file: 'not a buffer',
        file_name: 'test.pdf',
        deal_id: 123,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UploadFileFromPathSchema', () => {
    it('should accept valid file path upload', () => {
      const result = UploadFileFromPathSchema.safeParse({
        file_path: '/path/to/file.pdf',
        deal_id: 123,
      });
      expect(result.success).toBe(true);
    });

    it('should require at least one association', () => {
      const result = UploadFileFromPathSchema.safeParse({
        file_path: '/path/to/file.pdf',
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// Edge Cases and Special Validations
// ============================================================================

describe('Edge Cases', () => {
  it('should handle optional fields correctly', () => {
    const result = CreateDealSchema.safeParse({
      title: 'Minimal Deal',
    });
    expect(result.success).toBe(true);
  });

  it('should reject extra fields in strict mode', () => {
    const result = CreateDealSchema.safeParse({
      title: 'Test Deal',
      extra_field: 'should not be here',
    });
    expect(result.success).toBe(false);
  });

  it('should handle default values', () => {
    const result = PaginationSchema.parse({ limit: 50 });
    expect(result.start).toBe(0); // Default value
  });

  it('should transform currency to uppercase', () => {
    const result = CurrencySchema.parse('usd');
    expect(result).toBe('USD');
  });
});
