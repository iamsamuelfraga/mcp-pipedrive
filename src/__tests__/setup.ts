import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Configure global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PIPEDRIVE_API_TOKEN = 'test-api-token-123456789';
});

afterAll(() => {
  // Clean up environment variables
  delete process.env.PIPEDRIVE_API_TOKEN;
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

// Mock console methods to reduce noise in test output
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Replace console methods with mocks
global.console = {
  ...console,
  ...consoleMock,
} as Console;

// Utility to restore console for specific tests
export const restoreConsole = () => {
  global.console = {
    ...console,
    ...originalConsole,
  } as Console;
};

// Utility to get console mock calls
export const getConsoleCalls = () => ({
  log: consoleMock.log.mock.calls,
  error: consoleMock.error.mock.calls,
  warn: consoleMock.warn.mock.calls,
  info: consoleMock.info.mock.calls,
  debug: consoleMock.debug.mock.calls,
});

// Global test timeout
vi.setConfig({ testTimeout: 10000 });
