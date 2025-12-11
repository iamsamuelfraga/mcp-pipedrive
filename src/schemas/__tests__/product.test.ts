import { describe, it, expect } from 'vitest';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ListProductsSchema,
  SearchProductsSchema,
  BillingFrequencySchema,
  PriceSchema,
} from '../product.js';

describe('PriceSchema', () => {
  it('should accept valid price', () => {
    const valid = {
      price: 99.99,
      currency: 'USD',
    };
    expect(() => PriceSchema.parse(valid)).not.toThrow();
  });

  it('should accept price with cost fields', () => {
    const valid = {
      price: 100,
      currency: 'EUR',
      cost: 50,
      overhead_cost: 10,
      notes: 'Wholesale pricing',
    };
    expect(() => PriceSchema.parse(valid)).not.toThrow();
  });

  it('should reject negative price', () => {
    const invalid = {
      price: -10,
      currency: 'USD',
    };
    expect(() => PriceSchema.parse(invalid)).toThrow('Price must be non-negative');
  });

  it('should reject negative cost', () => {
    const invalid = {
      price: 100,
      currency: 'USD',
      cost: -50,
    };
    expect(() => PriceSchema.parse(invalid)).toThrow('Cost must be non-negative');
  });

  it('should reject negative overhead_cost', () => {
    const invalid = {
      price: 100,
      currency: 'USD',
      overhead_cost: -10,
    };
    expect(() => PriceSchema.parse(invalid)).toThrow('Overhead cost must be non-negative');
  });

  it('should reject invalid currency length', () => {
    const invalid = {
      price: 100,
      currency: 'US',
    };
    expect(() => PriceSchema.parse(invalid)).toThrow('Currency must be a 3-letter code');
  });

  it('should reject extra fields', () => {
    const invalid = {
      price: 100,
      currency: 'USD',
      extra_field: 'not allowed',
    };
    expect(() => PriceSchema.parse(invalid)).toThrow();
  });
});

describe('BillingFrequencySchema', () => {
  it('should accept all valid billing frequencies', () => {
    const validFrequencies = [
      'one-time',
      'weekly',
      'monthly',
      'quarterly',
      'semi-annually',
      'annually',
    ];
    validFrequencies.forEach((freq) => {
      expect(() => BillingFrequencySchema.parse(freq)).not.toThrow();
    });
  });

  it('should reject invalid billing frequency', () => {
    expect(() => BillingFrequencySchema.parse('daily')).toThrow(
      'Billing frequency must be one of: one-time, weekly, monthly, quarterly, semi-annually, annually'
    );
  });
});

describe('CreateProductSchema', () => {
  it('should accept valid product with name only', () => {
    const valid = {
      name: 'Basic Product',
    };
    const result = CreateProductSchema.parse(valid);
    expect(result.tax).toBe(0);
    expect(result.active_flag).toBe(true);
    expect(result.selectable).toBe(true);
  });

  it('should accept product with all fields', () => {
    const valid = {
      name: 'Premium Product',
      code: 'PROD-001',
      description: 'A premium product offering',
      unit: 'pcs',
      tax: 8.5,
      active_flag: true,
      selectable: true,
      visible_to: '3',
      owner_id: 1,
      prices: [
        { price: 100, currency: 'USD' },
        { price: 85, currency: 'EUR', cost: 50 },
      ],
      billing_frequency: 'monthly',
      billing_frequency_cycles: 12,
    };
    expect(() => CreateProductSchema.parse(valid)).not.toThrow();
  });

  it('should accept product with various units', () => {
    const units = ['pcs', 'kg', 'hours', 'licenses', 'meters'];
    units.forEach((unit) => {
      const valid = { name: 'Product', unit };
      expect(() => CreateProductSchema.parse(valid)).not.toThrow();
    });
  });

  it('should reject empty name', () => {
    const invalid = { name: '' };
    expect(() => CreateProductSchema.parse(invalid)).toThrow(
      'Name is required and cannot be empty'
    );
  });

  it('should reject name exceeding 255 characters', () => {
    const invalid = { name: 'a'.repeat(256) };
    expect(() => CreateProductSchema.parse(invalid)).toThrow('Name cannot exceed 255 characters');
  });

  it('should reject code exceeding 255 characters', () => {
    const invalid = {
      name: 'Product',
      code: 'a'.repeat(256),
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow('Code cannot exceed 255 characters');
  });

  it('should reject negative tax', () => {
    const invalid = {
      name: 'Product',
      tax: -5,
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow('Tax must be non-negative');
  });

  it('should reject tax exceeding 100', () => {
    const invalid = {
      name: 'Product',
      tax: 101,
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow('Tax cannot exceed 100%');
  });

  it('should accept tax at boundaries', () => {
    const valid1 = { name: 'Product', tax: 0 };
    const valid2 = { name: 'Product', tax: 100 };
    expect(() => CreateProductSchema.parse(valid1)).not.toThrow();
    expect(() => CreateProductSchema.parse(valid2)).not.toThrow();
  });

  it('should accept boolean-like values for flags', () => {
    const valid1 = { name: 'Product', active_flag: '1', selectable: 1 };
    const valid2 = { name: 'Product', active_flag: '0', selectable: 0 };
    expect(() => CreateProductSchema.parse(valid1)).not.toThrow();
    expect(() => CreateProductSchema.parse(valid2)).not.toThrow();
  });

  it('should reject invalid visibility', () => {
    const invalid = {
      name: 'Product',
      visible_to: '2',
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid billing frequency', () => {
    const invalid = {
      name: 'Product',
      billing_frequency: 'biweekly',
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow();
  });

  it('should reject zero billing_frequency_cycles', () => {
    const invalid = {
      name: 'Product',
      billing_frequency_cycles: 0,
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow(
      'Billing frequency cycles must be positive'
    );
  });

  it('should reject negative billing_frequency_cycles', () => {
    const invalid = {
      name: 'Product',
      billing_frequency_cycles: -1,
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow(
      'Billing frequency cycles must be positive'
    );
  });

  it('should reject non-integer billing_frequency_cycles', () => {
    const invalid = {
      name: 'Product',
      billing_frequency_cycles: 12.5,
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow(
      'Billing frequency cycles must be an integer'
    );
  });

  it('should accept null billing_frequency_cycles', () => {
    const valid = {
      name: 'Product',
      billing_frequency_cycles: null,
    };
    expect(() => CreateProductSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid prices array', () => {
    const invalid = {
      name: 'Product',
      prices: [{ price: -10, currency: 'USD' }],
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow();
  });

  it('should accept empty prices array', () => {
    const valid = {
      name: 'Product',
      prices: [],
    };
    expect(() => CreateProductSchema.parse(valid)).not.toThrow();
  });
});

describe('UpdateProductSchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: 1 };
    expect(() => UpdateProductSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with multiple fields', () => {
    const valid = {
      id: 1,
      name: 'Updated Product',
      code: 'PROD-002',
      tax: 10,
      active_flag: false,
    };
    expect(() => UpdateProductSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { name: 'Updated Product' };
    expect(() => UpdateProductSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid = { id: -1 };
    expect(() => UpdateProductSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject empty name if provided', () => {
    const invalid = { id: 1, name: '' };
    expect(() => UpdateProductSchema.parse(invalid)).toThrow('Name cannot be empty');
  });
});

describe('ListProductsSchema', () => {
  it('should accept valid list request with defaults', () => {
    const valid = {};
    const result = ListProductsSchema.parse(valid);
    expect(result.start).toBe(0);
  });

  it('should accept list with all filters', () => {
    const valid = {
      start: 10,
      limit: 50,
      user_id: 1,
      filter_id: 5,
      ids: [1, 2, 3, 4, 5],
      first_char: 'P',
      get_summary: true,
    };
    expect(() => ListProductsSchema.parse(valid)).not.toThrow();
  });

  it('should accept empty ids array', () => {
    const valid = { ids: [] };
    expect(() => ListProductsSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid IDs in array', () => {
    const invalid = { ids: [1, -2, 3] };
    expect(() => ListProductsSchema.parse(invalid)).toThrow();
  });

  it('should reject first_char with multiple characters', () => {
    const invalid = { first_char: 'AB' };
    expect(() => ListProductsSchema.parse(invalid)).toThrow(
      'First char must be a single character'
    );
  });

  it('should reject first_char with number', () => {
    const invalid = { first_char: '1' };
    expect(() => ListProductsSchema.parse(invalid)).toThrow('First char must be a letter');
  });

  it('should reject negative start', () => {
    const invalid = { start: -1 };
    expect(() => ListProductsSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { limit: 501 };
    expect(() => ListProductsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });
});

describe('SearchProductsSchema', () => {
  it('should accept valid search with required fields', () => {
    const valid = {
      term: 'Product Name',
    };
    const result = SearchProductsSchema.parse(valid);
    expect(result.exact_match).toBe(false);
    expect(result.start).toBe(0);
  });

  it('should accept search with all filters', () => {
    const valid = {
      term: 'Search',
      fields: 'name,code',
      exact_match: true,
      include_fields: 'id,name,price',
      start: 10,
      limit: 100,
    };
    expect(() => SearchProductsSchema.parse(valid)).not.toThrow();
  });

  it('should accept search term with 1 character', () => {
    const valid = { term: 'A' };
    expect(() => SearchProductsSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty search term', () => {
    const invalid = { term: '' };
    expect(() => SearchProductsSchema.parse(invalid)).toThrow(
      'Search term must be at least 1 character'
    );
  });

  it('should reject search term exceeding 255 characters', () => {
    const invalid = { term: 'a'.repeat(256) };
    expect(() => SearchProductsSchema.parse(invalid)).toThrow(
      'Search term cannot exceed 255 characters'
    );
  });

  it('should reject negative start', () => {
    const invalid = { term: 'Search', start: -1 };
    expect(() => SearchProductsSchema.parse(invalid)).toThrow('Start must be non-negative');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { term: 'Search', limit: 501 };
    expect(() => SearchProductsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });
});

describe('CreateProductSchema - Complex Price Scenarios', () => {
  it('should accept multiple prices with different currencies', () => {
    const valid = {
      name: 'Global Product',
      prices: [
        { price: 100, currency: 'USD' },
        { price: 85, currency: 'EUR' },
        { price: 75, currency: 'GBP' },
        { price: 12000, currency: 'JPY' },
      ],
    };
    expect(() => CreateProductSchema.parse(valid)).not.toThrow();
  });

  it('should accept prices with full cost breakdown', () => {
    const valid = {
      name: 'Product',
      prices: [
        {
          price: 100,
          currency: 'USD',
          cost: 50,
          overhead_cost: 10,
          notes: 'Standard pricing with margins',
        },
      ],
    };
    expect(() => CreateProductSchema.parse(valid)).not.toThrow();
  });

  it('should accept subscription product', () => {
    const valid = {
      name: 'SaaS Product',
      billing_frequency: 'monthly',
      billing_frequency_cycles: 12,
      prices: [{ price: 49.99, currency: 'USD' }],
    };
    expect(() => CreateProductSchema.parse(valid)).not.toThrow();
  });

  it('should accept one-time product', () => {
    const valid = {
      name: 'One-time Service',
      billing_frequency: 'one-time',
      prices: [{ price: 500, currency: 'USD' }],
    };
    expect(() => CreateProductSchema.parse(valid)).not.toThrow();
  });
});
