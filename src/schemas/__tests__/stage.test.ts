import { describe, it, expect } from 'vitest';
import {
  CreateStageSchema,
  UpdateStageSchema,
  ListStagesSchema,
  GetStageSchema,
  DeleteStageSchema,
} from '../stage.js';

describe('CreateStageSchema', () => {
  it('accepts a minimal stage', () => {
    const r = CreateStageSchema.parse({ name: 'Qualified', pipeline_id: 1 });
    expect(r.name).toBe('Qualified');
    expect(r.pipeline_id).toBe(1);
  });

  it('requires name and pipeline_id', () => {
    expect(() => CreateStageSchema.parse({})).toThrow();
    expect(() => CreateStageSchema.parse({ name: 'X' })).toThrow();
    expect(() => CreateStageSchema.parse({ pipeline_id: 1 })).toThrow();
  });

  it('accepts optional probability, order_nr, rotting flags', () => {
    const r = CreateStageSchema.parse({
      name: 'Qualified',
      pipeline_id: 1,
      deal_probability: 75,
      order_nr: 2,
      is_deal_rot_enabled: true,
      days_to_rot: 30,
    });
    expect(r.deal_probability).toBe(75);
    expect(r.days_to_rot).toBe(30);
  });

  it('rejects deal_probability out of range', () => {
    expect(() =>
      CreateStageSchema.parse({ name: 'X', pipeline_id: 1, deal_probability: 150 })
    ).toThrow();
    expect(() =>
      CreateStageSchema.parse({ name: 'X', pipeline_id: 1, deal_probability: -1 })
    ).toThrow();
  });
});

describe('UpdateStageSchema', () => {
  it('requires id', () => {
    expect(() => UpdateStageSchema.parse({ name: 'X' })).toThrow();
  });

  it('accepts id alone (no-op update is allowed by schema)', () => {
    const r = UpdateStageSchema.parse({ id: 5 });
    expect(r.id).toBe(5);
  });

  it('accepts partial updates', () => {
    const r = UpdateStageSchema.parse({ id: 5, name: 'Renamed', order_nr: 1 });
    expect(r.name).toBe('Renamed');
    expect(r.order_nr).toBe(1);
  });
});

describe('ListStagesSchema', () => {
  it('accepts empty object', () => {
    expect(ListStagesSchema.parse({}).pipeline_id).toBeUndefined();
  });

  it('accepts pipeline_id filter', () => {
    expect(ListStagesSchema.parse({ pipeline_id: 3 }).pipeline_id).toBe(3);
  });
});

describe('GetStageSchema', () => {
  it('requires id', () => {
    expect(() => GetStageSchema.parse({})).toThrow();
    expect(GetStageSchema.parse({ id: 5 }).id).toBe(5);
  });
});

describe('DeleteStageSchema', () => {
  it('requires id', () => {
    expect(() => DeleteStageSchema.parse({})).toThrow();
    expect(DeleteStageSchema.parse({ id: 5 }).id).toBe(5);
  });
});
