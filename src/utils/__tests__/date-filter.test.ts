import { describe, it, expect } from 'vitest';
import { applyDateFilter } from '../date-filter';

interface ListResponse {
  success: boolean;
  data: Array<{ id: number; add_time?: string }>;
  additional_data?: { total_count?: number; pagination?: unknown };
}

function makeResponse(items: Array<{ id: number; add_time?: string }>): ListResponse {
  return {
    success: true,
    data: items,
    additional_data: { total_count: items.length },
  };
}

describe('applyDateFilter', () => {
  it('returns the response untouched when no bounds are provided', () => {
    const response = makeResponse([{ id: 1, add_time: '2023-05-01 10:00:00' }]);
    expect(applyDateFilter(response, undefined, undefined)).toBe(response);
  });

  it('filters out items before add_time_from (inclusive lower bound)', () => {
    const response = makeResponse([
      { id: 1, add_time: '2022-12-31 23:59:59' },
      { id: 2, add_time: '2023-01-01 00:00:00' },
      { id: 3, add_time: '2023-06-15 12:00:00' },
    ]);

    const result = applyDateFilter(response, '2023-01-01', undefined) as ListResponse;

    expect(result.data.map((d) => d.id)).toEqual([2, 3]);
  });

  it('filters out items after add_time_until (inclusive upper bound, full last day)', () => {
    const response = makeResponse([
      { id: 1, add_time: '2023-12-31 23:59:59' },
      { id: 2, add_time: '2024-01-01 00:00:00' },
    ]);

    const result = applyDateFilter(response, undefined, '2023-12-31') as ListResponse;

    // The item created at 23:59:59 on the boundary day is included...
    expect(result.data.map((d) => d.id)).toEqual([1]);
  });

  it('applies both bounds together', () => {
    const response = makeResponse([
      { id: 1, add_time: '2022-11-01 09:00:00' },
      { id: 2, add_time: '2023-03-10 09:00:00' },
      { id: 3, add_time: '2023-09-20 09:00:00' },
      { id: 4, add_time: '2024-02-01 09:00:00' },
    ]);

    const result = applyDateFilter(response, '2023-01-01', '2023-12-31') as ListResponse;

    expect(result.data.map((d) => d.id)).toEqual([2, 3]);
  });

  it('handles ISO 8601 add_time (leads format) the same as space-separated (deals format)', () => {
    const response = makeResponse([
      { id: 1, add_time: '2022-06-30T08:00:00.000Z' },
      { id: 2, add_time: '2023-06-30T08:00:00.000Z' },
    ]);

    const result = applyDateFilter(response, '2023-01-01', undefined) as ListResponse;

    expect(result.data.map((d) => d.id)).toEqual([2]);
  });

  it('does not misclassify boundary-day items regardless of host timezone', () => {
    // A deal created early UTC on the from-day. With naive Date parsing of the
    // space-separated (local-time) format this could land on the previous day
    // and be wrongly excluded; string comparison keeps it.
    const response = makeResponse([{ id: 1, add_time: '2023-01-01 00:30:00' }]);

    const result = applyDateFilter(response, '2023-01-01', '2023-01-01') as ListResponse;

    expect(result.data.map((d) => d.id)).toEqual([1]);
  });

  it('passes through items without an add_time field', () => {
    const response = makeResponse([{ id: 1 }, { id: 2, add_time: '2020-01-01 00:00:00' }]);

    const result = applyDateFilter(response, '2023-01-01', undefined) as ListResponse;

    expect(result.data.map((d) => d.id)).toEqual([1]);
  });

  it('updates total_count to the filtered count while preserving other additional_data', () => {
    const response: ListResponse = {
      success: true,
      data: [
        { id: 1, add_time: '2023-06-01 00:00:00' },
        { id: 2, add_time: '2020-06-01 00:00:00' },
      ],
      additional_data: { total_count: 2, pagination: { more_items_in_collection: false } },
    };

    const result = applyDateFilter(response, '2023-01-01', undefined) as ListResponse;

    expect(result.data).toHaveLength(1);
    expect(result.additional_data?.total_count).toBe(1);
    expect(result.additional_data?.pagination).toEqual({ more_items_in_collection: false });
  });

  it('returns the response untouched when data is not an array', () => {
    const response = { success: true, data: { id: 1 } };
    expect(applyDateFilter(response, '2023-01-01', undefined)).toBe(response);
  });
});
