import { expect } from 'vitest';
import type { PipedriveResponse, Pagination } from '../../types/common.js';

/**
 * Custom assertions for testing Pipedrive-related functionality
 */

/**
 * Assert that a response is a valid Pipedrive response
 */
export const assertValidPipedriveResponse = <T>(
  response: any
): asserts response is PipedriveResponse<T> => {
  expect(response).toBeDefined();
  expect(response).toHaveProperty('success');
  expect(response).toHaveProperty('data');
  expect(typeof response.success).toBe('boolean');
};

/**
 * Assert that a response is a successful Pipedrive response
 */
export const assertSuccessResponse = <T>(
  response: any
): asserts response is PipedriveResponse<T> & { success: true } => {
  assertValidPipedriveResponse(response);
  expect(response.success).toBe(true);
  expect(response.data).toBeDefined();
};

/**
 * Assert that a response contains pagination data
 */
export const assertHasPagination = (response: any) => {
  expect(response).toHaveProperty('additional_data');
  expect(response.additional_data).toHaveProperty('pagination');
  const pagination = response.additional_data.pagination as Pagination;
  expect(typeof pagination.start).toBe('number');
  expect(typeof pagination.limit).toBe('number');
  expect(typeof pagination.more_items_in_collection).toBe('boolean');
};

/**
 * Assert that pagination indicates more items
 */
export const assertHasMoreItems = (response: any) => {
  assertHasPagination(response);
  const pagination = response.additional_data.pagination as Pagination;
  expect(pagination.more_items_in_collection).toBe(true);
  expect(pagination.next_start).toBeDefined();
  expect(typeof pagination.next_start).toBe('number');
};

/**
 * Assert that pagination indicates no more items
 */
export const assertNoMoreItems = (response: any) => {
  assertHasPagination(response);
  const pagination = response.additional_data.pagination as Pagination;
  expect(pagination.more_items_in_collection).toBe(false);
};

/**
 * Assert that a deal object has required fields
 */
export const assertValidDeal = (deal: any) => {
  expect(deal).toBeDefined();
  expect(deal).toHaveProperty('id');
  expect(deal).toHaveProperty('title');
  expect(typeof deal.id).toBe('number');
  expect(typeof deal.title).toBe('string');
  expect(deal.title.length).toBeGreaterThan(0);
};

/**
 * Assert that a person object has required fields
 */
export const assertValidPerson = (person: any) => {
  expect(person).toBeDefined();
  expect(person).toHaveProperty('id');
  expect(person).toHaveProperty('name');
  expect(typeof person.id).toBe('number');
  expect(typeof person.name).toBe('string');
  expect(person.name.length).toBeGreaterThan(0);
};

/**
 * Assert that an organization object has required fields
 */
export const assertValidOrganization = (org: any) => {
  expect(org).toBeDefined();
  expect(org).toHaveProperty('id');
  expect(org).toHaveProperty('name');
  expect(typeof org.id).toBe('number');
  expect(typeof org.name).toBe('string');
  expect(org.name.length).toBeGreaterThan(0);
};

/**
 * Assert that an activity object has required fields
 */
export const assertValidActivity = (activity: any) => {
  expect(activity).toBeDefined();
  expect(activity).toHaveProperty('id');
  expect(activity).toHaveProperty('subject');
  expect(activity).toHaveProperty('type');
  expect(activity).toHaveProperty('due_date');
  expect(typeof activity.id).toBe('number');
  expect(typeof activity.subject).toBe('string');
  expect(typeof activity.type).toBe('string');
  expect(typeof activity.due_date).toBe('string');
};

/**
 * Assert that a pipeline object has required fields
 */
export const assertValidPipeline = (pipeline: any) => {
  expect(pipeline).toBeDefined();
  expect(pipeline).toHaveProperty('id');
  expect(pipeline).toHaveProperty('name');
  expect(typeof pipeline.id).toBe('number');
  expect(typeof pipeline.name).toBe('string');
  expect(pipeline.name.length).toBeGreaterThan(0);
};

/**
 * Assert that a user object has required fields
 */
export const assertValidUser = (user: any) => {
  expect(user).toBeDefined();
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(typeof user.id).toBe('number');
  expect(typeof user.name).toBe('string');
  expect(typeof user.email).toBe('string');
  expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

/**
 * Assert that a file object has required fields
 */
export const assertValidFile = (file: any) => {
  expect(file).toBeDefined();
  expect(file).toHaveProperty('id');
  expect(file).toHaveProperty('name');
  expect(file).toHaveProperty('file_type');
  expect(typeof file.id).toBe('number');
  expect(typeof file.name).toBe('string');
  expect(typeof file.file_type).toBe('string');
};

/**
 * Assert that a note object has required fields
 */
export const assertValidNote = (note: any) => {
  expect(note).toBeDefined();
  expect(note).toHaveProperty('id');
  expect(note).toHaveProperty('content');
  expect(typeof note.id).toBe('number');
  expect(typeof note.content).toBe('string');
};

/**
 * Assert that a product object has required fields
 */
export const assertValidProduct = (product: any) => {
  expect(product).toBeDefined();
  expect(product).toHaveProperty('id');
  expect(product).toHaveProperty('name');
  expect(typeof product.id).toBe('number');
  expect(typeof product.name).toBe('string');
};

/**
 * Assert that an array contains only valid entities of a specific type
 */
export const assertArrayOfValidEntities = <T>(
  array: T[],
  validator: (item: T) => void
) => {
  expect(Array.isArray(array)).toBe(true);
  array.forEach(validator);
};

/**
 * Assert that a date string is valid ISO 8601 format
 */
export const assertValidISODate = (dateString: string) => {
  expect(typeof dateString).toBe('string');
  const date = new Date(dateString);
  expect(date.toString()).not.toBe('Invalid Date');
  expect(date.toISOString()).toBe(dateString);
};

/**
 * Assert that a date string is valid YYYY-MM-DD format
 */
export const assertValidDateString = (dateString: string) => {
  expect(typeof dateString).toBe('string');
  expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const date = new Date(dateString);
  expect(date.toString()).not.toBe('Invalid Date');
};

/**
 * Assert that a time string is valid HH:MM format
 */
export const assertValidTimeString = (timeString: string) => {
  expect(typeof timeString).toBe('string');
  expect(timeString).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
};

/**
 * Assert that an email is valid
 */
export const assertValidEmail = (email: string) => {
  expect(typeof email).toBe('string');
  expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

/**
 * Assert that a phone number is valid
 */
export const assertValidPhone = (phone: string) => {
  expect(typeof phone).toBe('string');
  expect(phone.length).toBeGreaterThan(0);
  // Allow various phone formats
  expect(phone).toMatch(/^[\d\s\-\+\(\)]+$/);
};

/**
 * Assert that a URL is valid
 */
export const assertValidUrl = (url: string) => {
  expect(typeof url).toBe('string');
  expect(() => new URL(url)).not.toThrow();
};

/**
 * Assert that an ID is valid
 */
export const assertValidId = (id: number) => {
  expect(typeof id).toBe('number');
  expect(id).toBeGreaterThan(0);
  expect(Number.isInteger(id)).toBe(true);
};

/**
 * Assert that a value is within a range
 */
export const assertInRange = (value: number, min: number, max: number) => {
  expect(typeof value).toBe('number');
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
};

/**
 * Assert that an object has timestamps
 */
export const assertHasTimestamps = (obj: any) => {
  expect(obj).toHaveProperty('add_time');
  expect(obj).toHaveProperty('update_time');
  assertValidISODate(obj.add_time);
  assertValidISODate(obj.update_time);
};

/**
 * Assert that a mock was called with specific arguments
 */
export const assertCalledWith = (
  mock: any,
  ...expectedArgs: any[]
) => {
  expect(mock).toHaveBeenCalled();
  const calls = mock.mock.calls;
  const found = calls.some((call: any[]) => {
    return expectedArgs.every((arg, index) => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(call[index]) === JSON.stringify(arg);
      }
      return call[index] === arg;
    });
  });
  expect(found).toBe(true);
};

/**
 * Assert that a mock was called exactly once
 */
export const assertCalledOnce = (mock: any) => {
  expect(mock).toHaveBeenCalledTimes(1);
};

/**
 * Assert that a mock was never called
 */
export const assertNotCalled = (mock: any) => {
  expect(mock).not.toHaveBeenCalled();
};

/**
 * Assert that an error has specific properties
 */
export const assertErrorHasProps = (
  error: Error,
  props: Record<string, any>
) => {
  expect(error).toBeDefined();
  expect(error).toBeInstanceOf(Error);
  for (const [key, value] of Object.entries(props)) {
    expect((error as any)[key]).toBe(value);
  }
};

/**
 * Assert that a Pipedrive error has status code
 */
export const assertPipedriveError = (
  error: Error,
  expectedStatusCode?: number
) => {
  expect(error).toBeDefined();
  expect(error).toBeInstanceOf(Error);
  expect((error as any).statusCode).toBeDefined();
  if (expectedStatusCode !== undefined) {
    expect((error as any).statusCode).toBe(expectedStatusCode);
  }
};

/**
 * Assert that a value is a non-empty string
 */
export const assertNonEmptyString = (value: any) => {
  expect(typeof value).toBe('string');
  expect(value.length).toBeGreaterThan(0);
};

/**
 * Assert that a value is a positive number
 */
export const assertPositiveNumber = (value: any) => {
  expect(typeof value).toBe('number');
  expect(value).toBeGreaterThan(0);
};

/**
 * Assert that a value is a non-negative number
 */
export const assertNonNegativeNumber = (value: any) => {
  expect(typeof value).toBe('number');
  expect(value).toBeGreaterThanOrEqual(0);
};

/**
 * Assert that an object matches a partial structure
 */
export const assertObjectContains = (obj: any, partial: any) => {
  expect(obj).toMatchObject(partial);
};

/**
 * Assert that an array contains an item matching a partial structure
 */
export const assertArrayContains = (array: any[], partial: any) => {
  expect(Array.isArray(array)).toBe(true);
  const found = array.some((item) => {
    try {
      expect(item).toMatchObject(partial);
      return true;
    } catch {
      return false;
    }
  });
  expect(found).toBe(true);
};

/**
 * Assert that an array is sorted in ascending order
 */
export const assertArraySortedAsc = (array: any[], key?: string) => {
  expect(Array.isArray(array)).toBe(true);
  for (let i = 1; i < array.length; i++) {
    const prev = key ? array[i - 1][key] : array[i - 1];
    const curr = key ? array[i][key] : array[i];
    expect(curr).toBeGreaterThanOrEqual(prev);
  }
};

/**
 * Assert that an array is sorted in descending order
 */
export const assertArraySortedDesc = (array: any[], key?: string) => {
  expect(Array.isArray(array)).toBe(true);
  for (let i = 1; i < array.length; i++) {
    const prev = key ? array[i - 1][key] : array[i - 1];
    const curr = key ? array[i][key] : array[i];
    expect(curr).toBeLessThanOrEqual(prev);
  }
};
