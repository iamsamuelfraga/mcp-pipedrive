# Test Infrastructure Documentation

This directory contains the test infrastructure for the MCP Pipedrive project, including mock factories, test helpers, and custom assertions.

## Directory Structure

```
src/__tests__/
├── setup.ts              # Global test setup and configuration
├── mocks/
│   ├── client.mock.ts    # Mock PipedriveClient and helpers
│   ├── data.mock.ts      # Mock data for all Pipedrive entities
│   └── responses.mock.ts # Mock API responses
├── helpers/
│   ├── test-utils.ts     # Common test utility functions
│   └── assertions.ts     # Custom assertion helpers
├── example.test.ts       # Example tests showing usage
└── README.md            # This file
```

## Getting Started

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

## Test Setup

The `setup.ts` file configures the global test environment:

- Sets environment variables for tests
- Mocks console methods to reduce noise
- Configures global test timeout (10 seconds)
- Clears and restores mocks between tests

### Using Console Mocks

Console methods are automatically mocked. To restore them for specific tests:

```typescript
import { restoreConsole, getConsoleCalls } from './__tests__/setup.js';

it('should log something', () => {
  restoreConsole();
  console.log('This will be visible');

  // Or check mock calls
  const calls = getConsoleCalls();
  expect(calls.log).toHaveLength(1);
});
```

## Mock Factories

### Client Mock

Create mock PipedriveClient instances with all methods mocked:

```typescript
import { createMockClient, setupMockClientWithDefaults } from './__tests__/mocks/client.mock.js';

// Basic mock client
const client = createMockClient();
client.get.mockResolvedValue({ success: true, data: {} });

// Mock client with default responses
const client = setupMockClientWithDefaults();
```

### Creating Mock Responses

```typescript
import { createMockResponse, createMockPaginatedResponse } from './__tests__/mocks/client.mock.js';

// Simple response
const response = createMockResponse({ id: 1, name: 'Test' });

// Paginated response
const response = createMockPaginatedResponse(
  [item1, item2],
  0,    // start
  50,   // limit
  true  // hasMore
);
```

## Mock Data

Pre-built mock data for all major Pipedrive entities is available in `data.mock.ts`:

### Available Mock Data

- **Deals**: `mockDeal`, `mockDeals`
- **Persons**: `mockPerson`, `mockPersons`
- **Organizations**: `mockOrganization`, `mockOrganizations`
- **Activities**: `mockActivity`, `mockActivities`
- **Pipelines**: `mockPipeline`, `mockPipelines`
- **Stages**: `mockStage`, `mockStages`
- **Users**: `mockUser`, `mockUsers`
- **Files**: `mockFile`, `mockFiles`
- **Notes**: `mockNote`, `mockNotes`
- **Products**: `mockProduct`, `mockProducts`

### Example Usage

```typescript
import { mockDeal, mockPersons } from './__tests__/mocks/data.mock.js';

it('should handle deal data', () => {
  expect(mockDeal.title).toBe('Enterprise Software License');
  expect(mockDeal.value).toBe(50000);
});

it('should handle multiple persons', () => {
  expect(mockPersons).toHaveLength(3);
  expect(mockPersons[0].name).toBe('Jane Smith');
});
```

## Mock Responses

Pre-built API response structures in `responses.mock.ts`:

```typescript
import {
  mockDealResponse,
  mockDealsResponse,
  mockDealCreateResponse,
  mockNotFoundResponse,
} from './__tests__/mocks/responses.mock.js';

// Success responses
client.get.mockResolvedValue(mockDealResponse);
client.post.mockResolvedValue(mockDealCreateResponse);

// Error responses
client.get.mockRejectedValue(mockNotFoundResponse);
```

### Available Response Mocks

- Success responses for all entities (get, list, create, update, delete)
- Error responses (404, 401, 400, 429, 500)
- Validation errors
- Search responses
- System/health responses

## Test Utilities

The `test-utils.ts` file provides helper functions for common testing patterns:

### Async Utilities

```typescript
import { wait, waitFor, retry } from './__tests__/helpers/test-utils.js';

// Wait for specific time
await wait(100);

// Wait for condition
await waitFor(() => someCondition === true, 5000);

// Retry a function
const result = await retry(() => someFunction(), 3, 100);
```

### Mock Utilities

```typescript
import { createSpy, mockTimers } from './__tests__/helpers/test-utils.js';

// Create a spy
const spy = createSpy((arg) => arg * 2);
spy(5);
expect(spy).toHaveBeenCalledWith(5);

// Mock timers
mockTimers();
advanceTimersByTime(1000);
restoreTimers();
```

### Data Generators

```typescript
import {
  randomString,
  randomEmail,
  randomDate,
  formatDate,
} from './__tests__/helpers/test-utils.js';

const name = randomString(10);
const email = randomEmail();
const date = randomDate(new Date('2025-01-01'), new Date('2025-12-31'));
const dateStr = formatDate(date); // YYYY-MM-DD
```

### Fetch Mocking

```typescript
import { mockFetch, createMockFetchResponse } from './__tests__/helpers/test-utils.js';

mockFetch(() => createMockFetchResponse({ data: 'test' }));
const response = await fetch('/api/test');
expect(response.ok).toBe(true);
```

## Custom Assertions

The `assertions.ts` file provides custom assertions for Pipedrive-specific validation:

### Response Assertions

```typescript
import {
  assertSuccessResponse,
  assertHasPagination,
  assertHasMoreItems,
} from './__tests__/helpers/assertions.js';

assertSuccessResponse(response);
assertHasPagination(response);
assertHasMoreItems(response);
```

### Entity Assertions

```typescript
import {
  assertValidDeal,
  assertValidPerson,
  assertValidOrganization,
  assertValidActivity,
} from './__tests__/helpers/assertions.js';

assertValidDeal(deal);
assertValidPerson(person);
assertValidOrganization(org);
assertValidActivity(activity);
```

### Data Validation Assertions

```typescript
import {
  assertValidEmail,
  assertValidUrl,
  assertValidISODate,
  assertValidDateString,
  assertValidTimeString,
} from './__tests__/helpers/assertions.js';

assertValidEmail('test@example.com');
assertValidUrl('https://example.com');
assertValidISODate('2025-12-10T14:30:00Z');
assertValidDateString('2025-12-10');
assertValidTimeString('14:30');
```

### Array Assertions

```typescript
import {
  assertArrayOfValidEntities,
  assertArrayContains,
  assertArraySortedAsc,
} from './__tests__/helpers/assertions.js';

assertArrayOfValidEntities(deals, assertValidDeal);
assertArrayContains(persons, { name: 'Jane Smith' });
assertArraySortedAsc(items, 'created_at');
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockClient } from './__tests__/mocks/client.mock.js';
import { mockDealResponse } from './__tests__/mocks/responses.mock.js';
import { assertSuccessResponse } from './__tests__/helpers/assertions.js';

describe('Feature Name', () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
  });

  it('should do something', async () => {
    // Arrange
    client.get.mockResolvedValue(mockDealResponse);

    // Act
    const result = await client.get('/deals/1');

    // Assert
    assertSuccessResponse(result);
    expect(client.get).toHaveBeenCalledWith('/deals/1');
  });
});
```

### Testing with Pagination

```typescript
import { createMockPaginator } from './__tests__/mocks/client.mock.js';
import { mockDeals } from './__tests__/mocks/data.mock.js';

it('should handle pagination', async () => {
  const paginator = createMockPaginator(mockDeals);
  const items = await paginator.getAllItems();

  expect(items).toHaveLength(mockDeals.length);
});
```

### Testing Error Scenarios

```typescript
import { mockNotFoundResponse } from './__tests__/mocks/responses.mock.js';
import { assertPipedriveError } from './__tests__/helpers/assertions.js';

it('should handle errors', async () => {
  client.get.mockRejectedValue(new Error('Not found'));

  await expect(client.get('/deals/999')).rejects.toThrow('Not found');
});

it('should handle Pipedrive errors', async () => {
  const error = new Error('API Error');
  (error as any).statusCode = 404;
  client.get.mockRejectedValue(error);

  try {
    await client.get('/deals/999');
  } catch (e) {
    assertPipedriveError(e as Error, 404);
  }
});
```

## Coverage Targets

The project has the following coverage thresholds:

- **Lines**: 85%
- **Functions**: 85%
- **Statements**: 85%
- **Branches**: 80%

Run `npm run test:coverage` to check current coverage levels.

## Best Practices

1. **Use descriptive test names**: Tests should clearly describe what they're testing
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Mock at the right level**: Mock the PipedriveClient, not internal HTTP calls
4. **Use custom assertions**: They make tests more readable and maintainable
5. **Test edge cases**: Don't just test the happy path
6. **Keep tests isolated**: Each test should be independent
7. **Use beforeEach for setup**: Reset state between tests
8. **Clean up after tests**: Use afterEach when necessary

## Examples

See `example.test.ts` for complete examples demonstrating:

- Mock client usage
- Mock data usage
- Mock response usage
- Test utilities
- Custom assertions
- Test lifecycle management

## Troubleshooting

### Tests timing out

Increase timeout in vitest.config.ts or for specific tests:

```typescript
it('slow test', async () => {
  // test code
}, 30000); // 30 second timeout
```

### Mocks not resetting

Make sure you're using `beforeEach` to reset mocks:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  client = createMockClient();
});
```

### Type errors with mocks

Ensure you're importing types correctly:

```typescript
import type { PipedriveClient } from '../pipedrive-client.js';
const client = createMockClient() as PipedriveClient;
```
