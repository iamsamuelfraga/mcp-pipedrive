import { vi, beforeEach, afterEach } from 'vitest';

/**
 * Test utility functions for common testing patterns
 */

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wait for a condition to be true
 */
export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(condition());
    if (result) {
      return;
    }
    await wait(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Create a spy on a method
 */
export const createSpy = <T extends (...args: any[]) => any>(
  implementation?: T
): ReturnType<typeof vi.fn<T>> => {
  return implementation ? vi.fn(implementation) : vi.fn();
};

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

/**
 * Mock timer functions
 */
export const mockTimers = () => {
  vi.useFakeTimers();
};

export const restoreTimers = () => {
  vi.useRealTimers();
};

export const advanceTimersByTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
};

export const runAllTimers = () => {
  vi.runAllTimers();
};

/**
 * Create a mock promise that can be manually resolved/rejected
 */
export class DeferredPromise<T> {
  promise: Promise<T>;
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * Create a deferred promise
 */
export const createDeferredPromise = <T>(): DeferredPromise<T> => {
  return new DeferredPromise<T>();
};

/**
 * Suppress console errors for a specific test
 */
export const suppressConsoleError = () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });
};

/**
 * Suppress console warnings for a specific test
 */
export const suppressConsoleWarn = () => {
  const originalWarn = console.warn;
  beforeEach(() => {
    console.warn = vi.fn();
  });
  afterEach(() => {
    console.warn = originalWarn;
  });
};

/**
 * Generate a random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random string of specified length
 */
export const randomString = (length = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a random email
 */
export const randomEmail = (): string => {
  return `${randomString(8)}@${randomString(6)}.com`;
};

/**
 * Generate a random date between start and end
 */
export const randomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

/**
 * Format a date as YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date as ISO string
 */
export const formatDateTime = (date: Date): string => {
  return date.toISOString();
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are deeply equal
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Create a mock fetch response
 */
export const createMockFetchResponse = <T>(
  data: T,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {}
): Response => {
  const { status = 200, statusText = 'OK', headers = {} } = options;

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: false,
    url: '',
    redirected: false,
    type: 'basic',
  } as Response;
};

/**
 * Create a mock fetch error
 */
export const createMockFetchError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'FetchError';
  return error;
};

/**
 * Mock global fetch
 */
export const mockFetch = (implementation: (...args: any[]) => any) => {
  global.fetch = vi.fn(implementation);
};

/**
 * Restore global fetch
 */
export const restoreFetch = () => {
  vi.restoreAllMocks();
};

/**
 * Create a test environment variable setter
 */
export const setTestEnv = (key: string, value: string) => {
  process.env[key] = value;
};

/**
 * Create a test environment variable getter
 */
export const getTestEnv = (key: string): string | undefined => {
  return process.env[key];
};

/**
 * Clear a test environment variable
 */
export const clearTestEnv = (key: string) => {
  delete process.env[key];
};

/**
 * Clear all test environment variables
 */
export const clearAllTestEnv = () => {
  for (const key in process.env) {
    if (key.startsWith('TEST_') || key.startsWith('PIPEDRIVE_')) {
      delete process.env[key];
    }
  }
};

/**
 * Assert that a function throws an error
 */
export const expectToThrow = async (
  fn: () => any | Promise<any>,
  errorMessage?: string | RegExp
) => {
  let error: Error | undefined;
  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }

  if (!error) {
    throw new Error('Expected function to throw, but it did not');
  }

  if (errorMessage) {
    if (typeof errorMessage === 'string') {
      if (!error.message.includes(errorMessage)) {
        throw new Error(
          `Expected error message to include "${errorMessage}", but got "${error.message}"`
        );
      }
    } else {
      if (!errorMessage.test(error.message)) {
        throw new Error(
          `Expected error message to match ${errorMessage}, but got "${error.message}"`
        );
      }
    }
  }

  return error;
};

/**
 * Create a mock console for capturing console output
 */
export const createMockConsole = () => {
  const logs: string[] = [];
  const errors: string[] = [];
  const warns: string[] = [];

  return {
    log: (...args: any[]) => logs.push(args.join(' ')),
    error: (...args: any[]) => errors.push(args.join(' ')),
    warn: (...args: any[]) => warns.push(args.join(' ')),
    info: (...args: any[]) => logs.push(args.join(' ')),
    debug: (...args: any[]) => logs.push(args.join(' ')),
    getLogs: () => logs,
    getErrors: () => errors,
    getWarns: () => warns,
    clear: () => {
      logs.length = 0;
      errors.length = 0;
      warns.length = 0;
    },
  };
};

/**
 * Retry a function until it succeeds or max attempts is reached
 */
export const retry = async <T>(
  fn: () => T | Promise<T>,
  maxAttempts = 3,
  delay = 100
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed');
};
