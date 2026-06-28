# Stages CRUD + Lead Labels CRUD + Conversions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose 11 new Pipedrive operations as MCP tools — full stage CRUD, lead-label CRUD, and async lead↔deal conversions — by extending the HTTP client to support API v2 and adding a PATCH verb, then layering the new tools on top.

**Architecture:** Two structural changes to `PipedriveClient` (path-based v2 detection + new `patch()` method + cache invalidation update) followed by mechanical addition of schemas and tools in their respective entity folders. New `src/tools/stages/` folder is created; leads and deals get new sibling files inside their existing folders. The HTTP client extension is **retro-compatible**: every existing v1 call continues unchanged.

**Tech Stack:** TypeScript (ESM), Zod for validation, Vitest for tests, MCP SDK 1.x. Node 22+.

---

## Conventions used in every task

- Project uses ESM with `.js` extensions in imports even when source is `.ts`. **Always** import as `from './foo.js'`, never `from './foo'`.
- Test runner: `npm test -- --run <path>` runs Vitest single pass; default is watch.
- Mock client: `createMockClient()` from `src/__tests__/mocks/client.mock.ts`. After Task 4 it exposes `patch` too.
- Commits follow semantic-release format: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`. **No** Co-Authored-By, **no** "Claude" or "AI" references.
- Tests for utilities live under `src/utils/__tests__/<name>.test.ts`. Tests for tools live under `src/tools/__tests__/<group>.test.ts`. Tests for schemas live under `src/schemas/__tests__/<entity>.test.ts`.
- Branch: `feat/stages-labels-conversions` (already created and checked out, with spec doc already committed).

---

## File Structure

**New files:**

- `src/schemas/stage.ts`
- `src/schemas/__tests__/stage.test.ts`
- `src/schemas/lead-label.ts`
- `src/schemas/__tests__/lead-label.test.ts`
- `src/tools/stages/list.ts`
- `src/tools/stages/get.ts`
- `src/tools/stages/create.ts`
- `src/tools/stages/update.ts`
- `src/tools/stages/delete.ts`
- `src/tools/stages/index.ts`
- `src/tools/__tests__/stages.test.ts`
- `src/tools/leads/labels.ts`
- `src/tools/__tests__/lead-labels.test.ts`
- `src/tools/leads/convert.ts`
- `src/tools/__tests__/leads-convert.test.ts`
- `src/tools/deals/convert.ts`
- `src/tools/__tests__/deals-convert.test.ts`

**Modified files:**

- `src/pipedrive-client.ts` — `resolveUrl()` helper, new `patch()` method, updated `invalidateCachePattern()`
- `src/__tests__/mocks/client.mock.ts` — add `patch: vi.fn()`
- `src/tools/leads/index.ts` — register new lead label and convert tools
- `src/tools/deals/index.ts` — register new convert tools
- `src/index.ts` — register new stages tool group
- `CHANGELOG.md` — Unreleased entry
- `README.md` — short note about new tools

---

## Phase 1 — `PipedriveClient` extensions

### Task 1: Add `resolveUrl()` for v2 path detection

**Files:**
- Modify: `src/pipedrive-client.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/pipedrive-client.ts` test file. If `src/__tests__/pipedrive-client.test.ts` does not exist, create it:

```typescript
// src/__tests__/pipedrive-client.test.ts
import { describe, it, expect } from 'vitest';
import { PipedriveClient } from '../pipedrive-client.js';

describe('PipedriveClient.resolveUrl (via private access)', () => {
  it('prefixes v1 base for endpoints starting with /', () => {
    const client = new PipedriveClient('test-token');
    // Access private method via cast for testing.
    const url = (client as unknown as { resolveUrl(s: string): string }).resolveUrl('/deals');
    expect(url).toBe('https://api.pipedrive.com/v1/deals');
  });

  it('uses bare host for endpoints starting with /api/v2/', () => {
    const client = new PipedriveClient('test-token');
    const url = (client as unknown as { resolveUrl(s: string): string }).resolveUrl(
      '/api/v2/stages'
    );
    expect(url).toBe('https://api.pipedrive.com/api/v2/stages');
  });

  it('preserves nested path segments under /api/v2/', () => {
    const client = new PipedriveClient('test-token');
    const url = (client as unknown as { resolveUrl(s: string): string }).resolveUrl(
      '/api/v2/leads/abc-def/convert/deal'
    );
    expect(url).toBe('https://api.pipedrive.com/api/v2/leads/abc-def/convert/deal');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/pipedrive-client.test.ts`
Expected: FAIL — `resolveUrl is not a function`.

- [ ] **Step 3: Implement**

In `src/pipedrive-client.ts`, add the helper method (near the other private methods, e.g. just above `private invalidateCachePattern`):

```typescript
  private resolveUrl(endpoint: string): string {
    // v2 endpoints come as "/api/v2/..." — use bare host.
    // v1 endpoints come as "/deals", "/persons", etc. — prepend "/v1".
    return endpoint.startsWith('/api/v2/')
      ? `https://api.pipedrive.com${endpoint}`
      : `${this.baseUrl}${endpoint}`;
  }
```

Then change the two URL construction sites to use it.

In the `request()` private method, replace:

```typescript
const url = new URL(`${this.baseUrl}${endpoint}`);
```

with:

```typescript
const url = new URL(this.resolveUrl(endpoint));
```

In the `uploadFile()` method, replace:

```typescript
const url = `${this.baseUrl}${endpoint}`;
```

with:

```typescript
const url = this.resolveUrl(endpoint);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/pipedrive-client.test.ts`
Expected: PASS (3 assertions).

Then run the full suite to confirm no regressions:

Run: `npm test -- --run`
Expected: 959 + 3 = 962 tests pass (or 959 if Vitest groups the new file count differently — what matters is no failures).

- [ ] **Step 5: Commit**

```bash
git add src/pipedrive-client.ts src/__tests__/pipedrive-client.test.ts
git commit -m "feat: support API v2 endpoints via path-based URL resolution"
```

---

### Task 2: Update `invalidateCachePattern` for v2

**Files:**
- Modify: `src/pipedrive-client.ts`
- Modify: `src/__tests__/pipedrive-client.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/pipedrive-client.test.ts`:

```typescript
describe('PipedriveClient.invalidateCachePattern (via private access)', () => {
  it('extracts the resource name from a v1 endpoint', () => {
    const client = new PipedriveClient('test-token');
    // Seed a cache entry, invalidate, then read.
    (client as unknown as { cache: { set(k: string, v: unknown): void } }).cache.set(
      'GET:/deals:{}',
      { data: 'cached' }
    );
    (client as unknown as { invalidateCachePattern(s: string): void }).invalidateCachePattern(
      '/deals/123'
    );
    const after = (
      client as unknown as { cache: { get(k: string): unknown } }
    ).cache.get('GET:/deals:{}');
    expect(after).toBeUndefined();
  });

  it('extracts the resource name from a v2 endpoint and invalidates only the v2 family', () => {
    const client = new PipedriveClient('test-token');
    const cache = (client as unknown as { cache: { set(k: string, v: unknown): void; get(k: string): unknown } }).cache;
    cache.set('GET:/api/v2/stages:{}', { data: 'cached-v2' });
    cache.set('GET:/deals:{}', { data: 'cached-v1' });

    (client as unknown as { invalidateCachePattern(s: string): void }).invalidateCachePattern(
      '/api/v2/stages/5'
    );

    expect(cache.get('GET:/api/v2/stages:{}')).toBeUndefined();
    expect(cache.get('GET:/deals:{}')).toEqual({ data: 'cached-v1' });
  });

  it('does nothing when the endpoint has no parseable resource segment', () => {
    const client = new PipedriveClient('test-token');
    // Should not throw.
    expect(() =>
      (client as unknown as { invalidateCachePattern(s: string): void }).invalidateCachePattern('/')
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/__tests__/pipedrive-client.test.ts`
Expected: the v2 invalidation test fails because the current implementation extracts `"api"` from the path.

- [ ] **Step 3: Implement**

Replace the existing `invalidateCachePattern` in `src/pipedrive-client.ts` with:

```typescript
  private invalidateCachePattern(endpoint: string): void {
    const parts = endpoint.split('/').filter(Boolean);
    // v1: ["deals", "123"] → resource = "deals"
    // v2: ["api", "v2", "stages", "5"] → resource = "stages"
    const resource = parts[0] === 'api' ? parts[2] : parts[0];
    if (!resource) return;
    const pattern = new RegExp(`^GET:/(api/v2/)?${resource}`);
    this.cache.invalidatePattern(pattern);
    logger.debug('Cache invalidated for pattern', { pattern: pattern.toString() });
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/pipedrive-client.test.ts`
Expected: PASS.

Then full suite:

Run: `npm test -- --run`
Expected: no regressions.

- [ ] **Step 5: Commit**

```bash
git add src/pipedrive-client.ts src/__tests__/pipedrive-client.test.ts
git commit -m "fix: extract resource correctly when invalidating v2 cache entries"
```

---

### Task 3: Add `patch()` method to client

**Files:**
- Modify: `src/pipedrive-client.ts`
- Modify: `src/__tests__/pipedrive-client.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/__tests__/pipedrive-client.test.ts`:

```typescript
describe('PipedriveClient.patch', () => {
  it('exposes a PATCH method that invalidates cache like put/delete', async () => {
    const client = new PipedriveClient('test-token');
    // Just verify the method exists and is callable. Network call will fail with the test token, so we only check the surface.
    expect(typeof (client as unknown as { patch: unknown }).patch).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/pipedrive-client.test.ts`
Expected: FAIL — `patch is not a function`.

- [ ] **Step 3: Implement**

In `src/pipedrive-client.ts`, add the `patch()` method below `put()` (around line 90):

```typescript
  async patch<T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const result = await this.request<T>('PATCH', endpoint, body, params);

    // Invalidate related cache entries
    this.invalidateCachePattern(endpoint);

    return result;
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/__tests__/pipedrive-client.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pipedrive-client.ts src/__tests__/pipedrive-client.test.ts
git commit -m "feat: add patch() method to PipedriveClient"
```

---

### Task 4: Add `patch` to the mock client

**Files:**
- Modify: `src/__tests__/mocks/client.mock.ts`

- [ ] **Step 1: Modify the mock**

Open `src/__tests__/mocks/client.mock.ts`. Locate the `createMockClient` function. It currently looks like:

```typescript
export const createMockClient = () => {
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    uploadFile: vi.fn(),
    createPaginator: vi.fn(),
    clearCache: vi.fn(),
    getRateLimiterStats: vi.fn(),
    getCacheStats: vi.fn(),
  };
  return mockClient as unknown as PipedriveClient;
};
```

Add `patch: vi.fn(),` between `put` and `delete`:

```typescript
export const createMockClient = () => {
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    uploadFile: vi.fn(),
    createPaginator: vi.fn(),
    clearCache: vi.fn(),
    getRateLimiterStats: vi.fn(),
    getCacheStats: vi.fn(),
  };
  return mockClient as unknown as PipedriveClient;
};
```

- [ ] **Step 2: Run full test suite**

Run: `npm test -- --run`
Expected: no regressions.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/mocks/client.mock.ts
git commit -m "test: add patch mock to createMockClient"
```

---

## Phase 2 — Stages CRUD

### Task 5: Stage zod schemas

**Files:**
- Create: `src/schemas/stage.ts`
- Create: `src/schemas/__tests__/stage.test.ts`

- [ ] **Step 1: Write the failing test**

`src/schemas/__tests__/stage.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run test, expect FAIL**

Run: `npm test -- --run src/schemas/__tests__/stage.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/schemas/stage.ts`:

```typescript
import { z } from 'zod';
import { IdSchema } from './common.js';

const ProbabilitySchema = z
  .number()
  .min(0, 'Probability must be 0-100')
  .max(100, 'Probability must be 0-100');

export const CreateStageSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name max 255 chars'),
    pipeline_id: z.coerce.number().int().positive('pipeline_id must be a positive integer'),
    order_nr: z.coerce.number().int().nonnegative().optional(),
    deal_probability: ProbabilitySchema.optional(),
    is_deal_rot_enabled: z.boolean().optional(),
    days_to_rot: z.coerce.number().int().nonnegative().optional(),
  })
  .strict();

export type CreateStageInput = z.infer<typeof CreateStageSchema>;

export const UpdateStageSchema = z
  .object({
    id: IdSchema.describe('Stage ID to update'),
    name: z.string().min(1).max(255).optional(),
    pipeline_id: z.coerce.number().int().positive().optional(),
    order_nr: z.coerce.number().int().nonnegative().optional(),
    deal_probability: ProbabilitySchema.optional(),
    is_deal_rot_enabled: z.boolean().optional(),
    days_to_rot: z.coerce.number().int().nonnegative().optional(),
  })
  .strict();

export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;

export const ListStagesSchema = z
  .object({
    pipeline_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export type ListStagesInput = z.infer<typeof ListStagesSchema>;

export const GetStageSchema = z
  .object({
    id: IdSchema.describe('Stage ID to fetch'),
  })
  .strict();

export type GetStageInput = z.infer<typeof GetStageSchema>;

export const DeleteStageSchema = z
  .object({
    id: IdSchema.describe('Stage ID to delete'),
  })
  .strict();

export type DeleteStageInput = z.infer<typeof DeleteStageSchema>;
```

- [ ] **Step 4: Run test, expect PASS**

Run: `npm test -- --run src/schemas/__tests__/stage.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add src/schemas/stage.ts src/schemas/__tests__/stage.test.ts
git commit -m "feat: add stage zod schemas"
```

---

### Task 6: Stages CRUD tools (all 5 in one task — single TDD scope)

**Files:**
- Create: `src/tools/stages/list.ts`, `get.ts`, `create.ts`, `update.ts`, `delete.ts`, `index.ts`
- Create: `src/tools/__tests__/stages.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/tools/__tests__/stages.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getStageTools } from '../stages/index.js';

describe('Stages tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('stages_list calls GET /api/v2/stages with no filter when omitted', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [{ id: 1 }] });
    const tools = getStageTools(mockClient);
    await tools['stages_list'].handler({});
    expect(mockClient.get).toHaveBeenCalledWith('/api/v2/stages', {}, expect.any(Object));
  });

  it('stages_list forwards pipeline_id filter as query param', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [] });
    const tools = getStageTools(mockClient);
    await tools['stages_list'].handler({ pipeline_id: 7 });
    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/v2/stages',
      { pipeline_id: 7 },
      expect.any(Object)
    );
  });

  it('stages_get calls GET /api/v2/stages/{id}', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getStageTools(mockClient);
    await tools['stages_get'].handler({ id: 5 });
    expect(mockClient.get).toHaveBeenCalledWith('/api/v2/stages/5', undefined, expect.any(Object));
  });

  it('stages_create posts to /api/v2/stages with the parsed body', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 11 } });
    const tools = getStageTools(mockClient);
    await tools['stages_create'].handler({
      name: 'Qualified',
      pipeline_id: 1,
      deal_probability: 50,
    });
    expect(mockClient.post).toHaveBeenCalledWith(
      '/api/v2/stages',
      expect.objectContaining({ name: 'Qualified', pipeline_id: 1, deal_probability: 50 })
    );
  });

  it('stages_update patches to /api/v2/stages/{id} with id stripped from body', async () => {
    mockClient.patch.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getStageTools(mockClient);
    await tools['stages_update'].handler({ id: 5, name: 'Renamed', order_nr: 2 });
    expect(mockClient.patch).toHaveBeenCalledWith(
      '/api/v2/stages/5',
      expect.objectContaining({ name: 'Renamed', order_nr: 2 })
    );
    const body = (mockClient.patch.mock.calls[0] as any[])[1];
    expect(body.id).toBeUndefined();
  });

  it('stages_delete calls DELETE /api/v2/stages/{id}', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getStageTools(mockClient);
    await tools['stages_delete'].handler({ id: 5 });
    expect(mockClient.delete).toHaveBeenCalledWith('/api/v2/stages/5');
  });
});
```

- [ ] **Step 2: Run tests, expect FAIL**

Run: `npm test -- --run src/tools/__tests__/stages.test.ts`
Expected: FAIL — module `../stages/index.js` not found.

- [ ] **Step 3: Implement the 5 tools and the index**

`src/tools/stages/list.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListStagesSchema } from '../../schemas/stage.js';

export function getListStagesTool(client: PipedriveClient) {
  return {
    stages_list: {
      description: `List all pipeline stages across the workspace.

Optionally filter by pipeline_id to scope to a single pipeline. Returns the canonical
stage collection via API v2.

Cached for 5 minutes.

Common use cases:
- List all stages: {}
- List stages of a pipeline: { "pipeline_id": 3 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          pipeline_id: {
            type: 'number',
            description: 'Optional pipeline ID filter',
          },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListStagesSchema.parse(args);
        const params: Record<string, number> = {};
        if (validated.pipeline_id !== undefined) params.pipeline_id = validated.pipeline_id;
        return client.get('/api/v2/stages', params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
```

`src/tools/stages/get.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetStageSchema } from '../../schemas/stage.js';

export function getGetStageTool(client: PipedriveClient) {
  return {
    stages_get: {
      description: `Get a specific stage by ID.

Returns the stage's full configuration: name, pipeline_id, order_nr, probability, rotting settings.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Stage ID' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetStageSchema.parse(args);
        return client.get(`/api/v2/stages/${id}`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
```

`src/tools/stages/create.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateStageSchema } from '../../schemas/stage.js';

export function getCreateStageTool(client: PipedriveClient) {
  return {
    stages_create: {
      description: `Create a new pipeline stage.

Required: name + pipeline_id. Optional: order_nr (position in pipeline), deal_probability
(0-100), is_deal_rot_enabled + days_to_rot for rotting deals.

Common use cases:
- Basic stage: { "name": "Qualified", "pipeline_id": 1 }
- With probability and rot: { "name": "Negotiation", "pipeline_id": 1, "deal_probability": 75, "is_deal_rot_enabled": true, "days_to_rot": 30 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Display name (required)' },
          pipeline_id: { type: 'number', description: 'Pipeline this stage belongs to (required)' },
          order_nr: { type: 'number', description: 'Position in the pipeline' },
          deal_probability: { type: 'number', description: 'Default deal win probability 0-100' },
          is_deal_rot_enabled: {
            type: 'boolean',
            description: 'Whether deals can rot in this stage',
          },
          days_to_rot: { type: 'number', description: 'Days before a deal rots (requires is_deal_rot_enabled)' },
        },
        required: ['name', 'pipeline_id'],
      },
      handler: async (args: unknown) => {
        const validated = CreateStageSchema.parse(args);
        return client.post('/api/v2/stages', validated);
      },
    },
  };
}
```

`src/tools/stages/update.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateStageSchema } from '../../schemas/stage.js';

export function getUpdateStageTool(client: PipedriveClient) {
  return {
    stages_update: {
      description: `Update an existing stage.

Provide only the fields you want to change. To reorder stages within a pipeline, update
the order_nr field.

Common use cases:
- Rename: { "id": 5, "name": "Closed Won" }
- Reorder: { "id": 5, "order_nr": 0 }
- Adjust rot rules: { "id": 5, "is_deal_rot_enabled": true, "days_to_rot": 14 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Stage ID to update' },
          name: { type: 'string', description: 'New display name' },
          pipeline_id: { type: 'number', description: 'Move stage to a different pipeline' },
          order_nr: { type: 'number', description: 'New position in the pipeline' },
          deal_probability: { type: 'number', description: 'Default deal win probability 0-100' },
          is_deal_rot_enabled: { type: 'boolean' },
          days_to_rot: { type: 'number' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...body } = UpdateStageSchema.parse(args);
        return client.patch(`/api/v2/stages/${id}`, body);
      },
    },
  };
}
```

`src/tools/stages/delete.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteStageSchema } from '../../schemas/stage.js';

export function getDeleteStageTool(client: PipedriveClient) {
  return {
    stages_delete: {
      description: `Delete a stage by ID.

This is a soft delete. Existing deals in the stage are NOT cascaded — they remain pointing
to the deleted stage's ID until they are moved.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Stage ID to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteStageSchema.parse(args);
        return client.delete(`/api/v2/stages/${id}`);
      },
    },
  };
}
```

`src/tools/stages/index.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListStagesTool } from './list.js';
import { getGetStageTool } from './get.js';
import { getCreateStageTool } from './create.js';
import { getUpdateStageTool } from './update.js';
import { getDeleteStageTool } from './delete.js';

/**
 * Stage tools (Pipedrive API v2). Provides full CRUD over individual stages,
 * complementing the nested-list convenience `pipelines_get_stages` (v1).
 */
export function getStageTools(client: PipedriveClient) {
  return {
    ...getListStagesTool(client),
    ...getGetStageTool(client),
    ...getCreateStageTool(client),
    ...getUpdateStageTool(client),
    ...getDeleteStageTool(client),
  };
}
```

- [ ] **Step 4: Run tests, expect PASS**

Run: `npm test -- --run src/tools/__tests__/stages.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/schemas/stage.ts src/tools/stages src/tools/__tests__/stages.test.ts
git commit -m "feat: add stages CRUD tools (API v2)"
```

---

## Phase 3 — Lead Labels CRUD

### Task 7: Lead-label zod schemas

**Files:**
- Create: `src/schemas/lead-label.ts`
- Create: `src/schemas/__tests__/lead-label.test.ts`

- [ ] **Step 1: Write the failing test**

`src/schemas/__tests__/lead-label.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  CreateLeadLabelSchema,
  UpdateLeadLabelSchema,
  DeleteLeadLabelSchema,
} from '../lead-label.js';

describe('CreateLeadLabelSchema', () => {
  it('accepts a label with valid color', () => {
    const r = CreateLeadLabelSchema.parse({ name: 'Hot', color: 'red' });
    expect(r.name).toBe('Hot');
    expect(r.color).toBe('red');
  });

  it('requires name and color', () => {
    expect(() => CreateLeadLabelSchema.parse({})).toThrow();
    expect(() => CreateLeadLabelSchema.parse({ name: 'Hot' })).toThrow();
    expect(() => CreateLeadLabelSchema.parse({ color: 'red' })).toThrow();
  });

  it('rejects unknown colors', () => {
    expect(() => CreateLeadLabelSchema.parse({ name: 'X', color: 'magenta' })).toThrow();
  });
});

describe('UpdateLeadLabelSchema', () => {
  it('requires id, allows partial update', () => {
    const r = UpdateLeadLabelSchema.parse({ id: 'abc-uuid', name: 'Renamed' });
    expect(r.id).toBe('abc-uuid');
    expect(r.name).toBe('Renamed');
  });
});

describe('DeleteLeadLabelSchema', () => {
  it('requires id', () => {
    expect(() => DeleteLeadLabelSchema.parse({})).toThrow();
    expect(DeleteLeadLabelSchema.parse({ id: 'abc-uuid' }).id).toBe('abc-uuid');
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

Run: `npm test -- --run src/schemas/__tests__/lead-label.test.ts`

- [ ] **Step 3: Implement**

`src/schemas/lead-label.ts`:

```typescript
import { z } from 'zod';

const LabelColorSchema = z.enum([
  'blue',
  'brown',
  'dark-gray',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'yellow',
]);

export type LeadLabelColor = z.infer<typeof LabelColorSchema>;

// Lead labels in Pipedrive use UUID string IDs.
const LeadLabelIdSchema = z.string().min(1, 'Lead label ID is required');

export const CreateLeadLabelSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name max 255 chars'),
    color: LabelColorSchema,
  })
  .strict();

export type CreateLeadLabelInput = z.infer<typeof CreateLeadLabelSchema>;

export const UpdateLeadLabelSchema = z
  .object({
    id: LeadLabelIdSchema,
    name: z.string().min(1).max(255).optional(),
    color: LabelColorSchema.optional(),
  })
  .strict();

export type UpdateLeadLabelInput = z.infer<typeof UpdateLeadLabelSchema>;

export const DeleteLeadLabelSchema = z
  .object({
    id: LeadLabelIdSchema,
  })
  .strict();

export type DeleteLeadLabelInput = z.infer<typeof DeleteLeadLabelSchema>;
```

- [ ] **Step 4: Run test, expect PASS**

Run: `npm test -- --run src/schemas/__tests__/lead-label.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/schemas/lead-label.ts src/schemas/__tests__/lead-label.test.ts
git commit -m "feat: add lead-label zod schemas"
```

---

### Task 8: Lead label CRUD tools

**Files:**
- Create: `src/tools/leads/labels.ts`
- Create: `src/tools/__tests__/lead-labels.test.ts`

- [ ] **Step 1: Write the failing test**

`src/tools/__tests__/lead-labels.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getLeadLabelTools } from '../leads/labels.js';

describe('Lead label tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('lead_labels_create posts to /leadLabels', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 'uuid-1', name: 'Hot', color: 'red' } });
    const tools = getLeadLabelTools(mockClient);
    await tools['lead_labels_create'].handler({ name: 'Hot', color: 'red' });
    expect(mockClient.post).toHaveBeenCalledWith('/leadLabels', { name: 'Hot', color: 'red' });
  });

  it('lead_labels_update patches /leadLabels/{id} with id stripped from body', async () => {
    mockClient.patch.mockResolvedValue({ success: true, data: { id: 'uuid-1' } });
    const tools = getLeadLabelTools(mockClient);
    await tools['lead_labels_update'].handler({ id: 'uuid-1', name: 'Cool' });
    expect(mockClient.patch).toHaveBeenCalledWith('/leadLabels/uuid-1', { name: 'Cool' });
    const body = (mockClient.patch.mock.calls[0] as any[])[1];
    expect(body.id).toBeUndefined();
  });

  it('lead_labels_delete calls DELETE /leadLabels/{id}', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 'uuid-1' } });
    const tools = getLeadLabelTools(mockClient);
    await tools['lead_labels_delete'].handler({ id: 'uuid-1' });
    expect(mockClient.delete).toHaveBeenCalledWith('/leadLabels/uuid-1');
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

Run: `npm test -- --run src/tools/__tests__/lead-labels.test.ts`

- [ ] **Step 3: Implement**

`src/tools/leads/labels.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  CreateLeadLabelSchema,
  UpdateLeadLabelSchema,
  DeleteLeadLabelSchema,
} from '../../schemas/lead-label.js';

export function getLeadLabelTools(client: PipedriveClient) {
  return {
    lead_labels_create: {
      description: `Create a new lead label.

Required: name + color. Color must be one of: blue, brown, dark-gray, gray, green,
orange, pink, purple, red, yellow.

Common use cases:
- Hot lead: { "name": "Hot", "color": "red" }
- Qualified lead: { "name": "Qualified", "color": "green" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Label display name' },
          color: {
            type: 'string',
            enum: [
              'blue',
              'brown',
              'dark-gray',
              'gray',
              'green',
              'orange',
              'pink',
              'purple',
              'red',
              'yellow',
            ],
            description: 'Label color',
          },
        },
        required: ['name', 'color'],
      },
      handler: async (args: unknown) => {
        const parsed = CreateLeadLabelSchema.parse(args);
        return client.post('/leadLabels', parsed);
      },
    },

    lead_labels_update: {
      description: `Update an existing lead label.

Provide the label's UUID and any combination of name/color to change.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead label UUID' },
          name: { type: 'string', description: 'New name' },
          color: {
            type: 'string',
            enum: [
              'blue',
              'brown',
              'dark-gray',
              'gray',
              'green',
              'orange',
              'pink',
              'purple',
              'red',
              'yellow',
            ],
            description: 'New color',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...body } = UpdateLeadLabelSchema.parse(args);
        return client.patch(`/leadLabels/${id}`, body);
      },
    },

    lead_labels_delete: {
      description: `Delete a lead label by UUID.

Existing leads carrying this label will lose it after deletion.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead label UUID' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteLeadLabelSchema.parse(args);
        return client.delete(`/leadLabels/${id}`);
      },
    },
  };
}
```

- [ ] **Step 4: Run test, expect PASS**

Run: `npm test -- --run src/tools/__tests__/lead-labels.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/tools/leads/labels.ts src/tools/__tests__/lead-labels.test.ts
git commit -m "feat: add lead label CRUD tools"
```

---

## Phase 4 — Conversions

### Task 9: Lead → Deal conversion tools

**Files:**
- Create: `src/tools/leads/convert.ts`
- Create: `src/tools/__tests__/leads-convert.test.ts`

- [ ] **Step 1: Write the failing test**

`src/tools/__tests__/leads-convert.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getLeadConvertTools } from '../leads/convert.js';

describe('Lead conversion tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('leads_convert_to_deal posts to /api/v2/leads/{id}/convert/deal', async () => {
    mockClient.post.mockResolvedValue({
      success: true,
      data: { id: 'conv-123', status: 'queued' },
    });
    const tools = getLeadConvertTools(mockClient);
    const result = await tools['leads_convert_to_deal'].handler({ id: 'lead-uuid' });
    expect(mockClient.post).toHaveBeenCalledWith('/api/v2/leads/lead-uuid/convert/deal');
    expect((result as { data: { id: string } }).data.id).toBe('conv-123');
  });

  it('leads_convert_status fetches /api/v2/leads/{id}/convert/status/{conversion_id}', async () => {
    mockClient.get.mockResolvedValue({
      success: true,
      data: { id: 'conv-123', status: 'completed', deal_id: 42 },
    });
    const tools = getLeadConvertTools(mockClient);
    await tools['leads_convert_status'].handler({
      id: 'lead-uuid',
      conversion_id: 'conv-123',
    });
    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/v2/leads/lead-uuid/convert/status/conv-123'
    );
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

Run: `npm test -- --run src/tools/__tests__/leads-convert.test.ts`

- [ ] **Step 3: Implement**

`src/tools/leads/convert.ts`:

```typescript
import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';

const ConvertLeadSchema = z
  .object({
    id: z.string().min(1, 'Lead UUID required'),
  })
  .strict();

const ConvertStatusSchema = z
  .object({
    id: z.string().min(1, 'Lead UUID required'),
    conversion_id: z.string().min(1, 'conversion_id required'),
  })
  .strict();

export function getLeadConvertTools(client: PipedriveClient) {
  return {
    leads_convert_to_deal: {
      description: `Convert a lead into a deal (asynchronous, two-step flow).

Step 1 (this tool): POST starts the conversion. Returns { id: conversion_id, status: 'queued' | 'running' }.
Step 2 (separate tool): poll leads_convert_status with the lead id AND the conversion_id
returned here, every few seconds, until status === 'completed'. The completed response
includes the resulting deal_id.

Related entities (notes, files, emails, activities) are transferred to the new deal.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead UUID to convert' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = ConvertLeadSchema.parse(args);
        return client.post(`/api/v2/leads/${id}/convert/deal`);
      },
    },

    leads_convert_status: {
      description: `Check the status of a lead-to-deal conversion job.

Use the conversion_id returned by leads_convert_to_deal. Possible statuses: queued,
running, completed, failed. When completed, the response includes the resulting deal_id.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead UUID that is being converted' },
          conversion_id: { type: 'string', description: 'ID returned by leads_convert_to_deal' },
        },
        required: ['id', 'conversion_id'],
      },
      handler: async (args: unknown) => {
        const { id, conversion_id } = ConvertStatusSchema.parse(args);
        return client.get(`/api/v2/leads/${id}/convert/status/${conversion_id}`);
      },
    },
  };
}
```

- [ ] **Step 4: Run test, expect PASS**

Run: `npm test -- --run src/tools/__tests__/leads-convert.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/tools/leads/convert.ts src/tools/__tests__/leads-convert.test.ts
git commit -m "feat: add lead-to-deal conversion tools"
```

---

### Task 10: Deal → Lead conversion tools

**Files:**
- Create: `src/tools/deals/convert.ts`
- Create: `src/tools/__tests__/deals-convert.test.ts`

- [ ] **Step 1: Write the failing test**

`src/tools/__tests__/deals-convert.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getDealConvertTools } from '../deals/convert.js';

describe('Deal conversion tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('deals_convert_to_lead posts to /api/v2/deals/{id}/convert/lead', async () => {
    mockClient.post.mockResolvedValue({
      success: true,
      data: { id: 'conv-456', status: 'queued' },
    });
    const tools = getDealConvertTools(mockClient);
    const result = await tools['deals_convert_to_lead'].handler({ id: 99 });
    expect(mockClient.post).toHaveBeenCalledWith('/api/v2/deals/99/convert/lead');
    expect((result as { data: { id: string } }).data.id).toBe('conv-456');
  });

  it('deals_convert_status fetches /api/v2/deals/{id}/convert/status/{conversion_id}', async () => {
    mockClient.get.mockResolvedValue({
      success: true,
      data: { id: 'conv-456', status: 'completed', lead_id: 'lead-new-uuid' },
    });
    const tools = getDealConvertTools(mockClient);
    await tools['deals_convert_status'].handler({ id: 99, conversion_id: 'conv-456' });
    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/v2/deals/99/convert/status/conv-456'
    );
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

Run: `npm test -- --run src/tools/__tests__/deals-convert.test.ts`

- [ ] **Step 3: Implement**

`src/tools/deals/convert.ts`:

```typescript
import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import { IdSchema } from '../../schemas/common.js';

const ConvertDealSchema = z
  .object({
    id: IdSchema,
  })
  .strict();

const ConvertStatusSchema = z
  .object({
    id: IdSchema,
    conversion_id: z.string().min(1, 'conversion_id required'),
  })
  .strict();

export function getDealConvertTools(client: PipedriveClient) {
  return {
    deals_convert_to_lead: {
      description: `Convert a deal into a lead (asynchronous, two-step flow).

Step 1 (this tool): POST starts the conversion. Returns { id: conversion_id, status: 'queued' | 'running' }.
Step 2 (separate tool): poll deals_convert_status with the deal id AND the conversion_id
returned here, every few seconds, until status === 'completed'. The completed response
includes the resulting lead_id.

Related entities (notes, files, emails, activities) are transferred to the new lead.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Deal ID to convert' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = ConvertDealSchema.parse(args);
        return client.post(`/api/v2/deals/${id}/convert/lead`);
      },
    },

    deals_convert_status: {
      description: `Check the status of a deal-to-lead conversion job.

Use the conversion_id returned by deals_convert_to_lead. Possible statuses: queued,
running, completed, failed. When completed, the response includes the resulting lead_id.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Deal ID that is being converted' },
          conversion_id: { type: 'string', description: 'ID returned by deals_convert_to_lead' },
        },
        required: ['id', 'conversion_id'],
      },
      handler: async (args: unknown) => {
        const { id, conversion_id } = ConvertStatusSchema.parse(args);
        return client.get(`/api/v2/deals/${id}/convert/status/${conversion_id}`);
      },
    },
  };
}
```

- [ ] **Step 4: Run test, expect PASS**

Run: `npm test -- --run src/tools/__tests__/deals-convert.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/tools/deals/convert.ts src/tools/__tests__/deals-convert.test.ts
git commit -m "feat: add deal-to-lead conversion tools"
```

---

## Phase 5 — Registration

### Task 11: Register new tools in their aggregators

**Files:**
- Modify: `src/tools/leads/index.ts`
- Modify: `src/tools/deals/index.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Inspect existing aggregators**

Run: `head -30 src/tools/leads/index.ts src/tools/deals/index.ts`

Note the existing import + spread pattern.

- [ ] **Step 2: Modify `src/tools/leads/index.ts`**

At the top of the file, add the new imports alongside the existing ones:

```typescript
import { getLeadLabelTools } from './labels.js';
import { getLeadConvertTools } from './convert.js';
```

In the function body (where the existing tools are spread into the returned object), append:

```typescript
    ...getLeadLabelTools(client),
    ...getLeadConvertTools(client),
```

- [ ] **Step 3: Modify `src/tools/deals/index.ts`**

Add the import at the top:

```typescript
import { getDealConvertTools } from './convert.js';
```

In the function body, append the spread:

```typescript
    ...getDealConvertTools(client),
```

- [ ] **Step 4: Modify `src/index.ts`**

Add the import near the other tool group imports (between the existing `getOrganizationTools` and `getActivityTools` lines, alphabetical doesn't matter — keep nearby imports together):

```typescript
import { getStageTools } from './tools/stages/index.js';
```

In the place where tool groups are spread into the master tools object (search for `...getPipelineTools(client),` or similar), add:

```typescript
    ...getStageTools(client),
```

- [ ] **Step 5: Type-check and run full suite**

Run: `npm run type-check`
Expected: clean.

Run: `npm test -- --run`
Expected: 959 baseline + new tests (~30) = ~989 tests, all green.

- [ ] **Step 6: Commit**

```bash
git add src/tools/leads/index.ts src/tools/deals/index.ts src/index.ts
git commit -m "feat: register stages, lead labels, and conversion tools"
```

---

## Phase 6 — Documentation

### Task 12: CHANGELOG + README

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `README.md`

- [ ] **Step 1: CHANGELOG entry**

Prepend at the top of `CHANGELOG.md` (above the v2.3.0 entry):

```markdown
## [Unreleased]

### Added
- Stages CRUD via API v2: `stages_list`, `stages_get`, `stages_create`, `stages_update`, `stages_delete`. The existing `pipelines_get_stages` is kept as a discovery convenience.
- Lead label CRUD: `lead_labels_create`, `lead_labels_update`, `lead_labels_delete`. The existing `leads_get_labels` (list) is unchanged.
- Asynchronous lead↔deal conversion: `leads_convert_to_deal`, `leads_convert_status`, `deals_convert_to_lead`, `deals_convert_status`.

### Changed
- `PipedriveClient` now routes endpoints starting with `/api/v2/` to the API v2 host directly; v1 endpoints continue using the existing base URL.
- `PipedriveClient` exposes a new `patch()` method (used by stages and lead labels updates).
- Cache invalidation correctly extracts the resource segment for both v1 and v2 endpoint shapes.
```

- [ ] **Step 2: README entry**

Find an appropriate place in `README.md` (e.g. near other recent tool additions or at the end of the feature list). Add a short blurb:

```markdown
### Stage and lead-label management

Manage pipeline stages and lead labels directly from the LLM:

```json
{ "name": "Qualified", "pipeline_id": 1, "deal_probability": 75 }
```

Convert qualified leads into deals (or roll a deal back to a lead) via the asynchronous
`*_convert_to_*` / `*_convert_status` tool pairs.
```

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md README.md
git commit -m "docs: changelog and readme entries for stages, lead labels, and conversions"
```

---

## Final Validation

- [ ] **Step 1: Full test suite**

Run: `npm test -- --run`
Expected: ~989 tests pass, no failures.

- [ ] **Step 2: Type-check**

Run: `npm run type-check`
Expected: clean.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Lint + format**

Run: `npm run lint`
Expected: 0 new errors (warnings on pre-existing files acceptable).

Run: `npm run format:check`
Expected: clean. If not, run `npm run format` and commit as `style: prettier auto-fix`.

---

## Self-Review Checklist (run by planner before handoff)

**Spec coverage:**
- Spec §1 Stages CRUD → Tasks 5–6 ✓
- Spec §2 Lead Labels CRUD → Tasks 7–8 ✓
- Spec §3 Lead ↔ Deal conversions → Tasks 9–10 ✓
- Spec architecture: v2 path detection → Task 1 ✓
- Spec architecture: PATCH method → Task 3 ✓
- Spec architecture: cache invalidation update → Task 2 ✓
- Spec architecture: mock client `patch` → Task 4 ✓
- Spec testing strategy: regression test on `resolveUrl` → Task 1 ✓
- Spec testing strategy: regression test on `invalidateCachePattern` → Task 2 ✓
- Tool registration in aggregators → Task 11 ✓
- Docs → Task 12 ✓

**Placeholder scan:** no `TBD`, no "implement later", no bare "similar to". Each task carries the full code it needs.

**Type consistency:**
- `LeadLabelColor` defined once in Task 7, referenced by `inputSchema.enum` array in Task 8 (the strings are duplicated literally — acceptable since the JSON Schema enum has to be string literals; no type leak).
- `ConvertLeadSchema` (lead UUID) vs `ConvertDealSchema` (numeric ID) — distinct on purpose because Pipedrive leads use UUIDs and deals use integers; `ConvertStatusSchema` in each file uses the same ID shape as its sibling create schema.
- `getStageTools`, `getLeadLabelTools`, `getLeadConvertTools`, `getDealConvertTools` — names consistent across definition (Tasks 6, 8, 9, 10) and registration (Task 11).
- Tool keys: `stages_*`, `lead_labels_*`, `leads_convert_*`, `deals_convert_*` — consistent across handler tests and registration.

No issues found.
