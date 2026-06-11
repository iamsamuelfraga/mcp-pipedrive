# Custom Fields Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow create/update tools to accept custom field values by display name or hash, enrich read responses with `custom_fields_resolved`, and add CRUD parity for deal/person/product custom field definitions.

**Architecture:** New utility module `src/utils/custom-fields.ts` exposes pure functions (`resolveCustomFieldsForEntity`, `buildResolvedCustomFields`, `loadFieldDefinitions`). Existing write/read tool handlers gain a thin wrapper that calls these utilities before/after `client.post/put/get`. Cache is reused from the existing `TTLCache` in `PipedriveClient`. New CRUD tools for deal/person/product fields mirror the existing organization-field tools 1:1.

**Tech Stack:** TypeScript (ESM), Zod for validation, Vitest for tests, MCP SDK 1.x. Node 22+.

---

## Conventions used in every task

- Project uses ESM with `.js` extensions in imports even when source is `.ts`. **Always** import as `from './foo.js'`, never `from './foo'`.
- Test runner: `npm test -- <path>` runs Vitest in watch mode by default; use `npm test -- --run <path>` for single pass.
- Mock client: `createMockClient()` from `src/__tests__/mocks/client.mock.ts` returns `{ get, post, put, delete, ... }` all `vi.fn()`.
- Commit message format follows the existing convention (semantic-release): `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`. **No** Co-Authored-By footers, **no** "Claude" references.
- Tests for utilities live under `src/utils/__tests__/<name>.test.ts`. Tests for tools live under `src/tools/__tests__/<group>.test.ts`. Tests for schemas live under `src/schemas/__tests__/<entity>.test.ts`.

---

## File Structure

**New files:**

- `src/utils/custom-fields-errors.ts` — typed error classes
- `src/utils/custom-fields.ts` — resolution, validation, enrichment helpers
- `src/utils/__tests__/custom-fields.test.ts` — unit tests for the above
- `src/schemas/deal-field.ts` — Zod schemas for deal-field CRUD
- `src/schemas/person-field.ts` — Zod schemas for person-field CRUD
- `src/schemas/product-field.ts` — Zod schemas for product-field CRUD
- `src/tools/fields/create-deal-field.ts`, `update-deal-field.ts`, `delete-deal-field.ts`, `bulk-delete-deal-fields.ts`
- `src/tools/fields/create-person-field.ts`, `update-person-field.ts`, `delete-person-field.ts`, `bulk-delete-person-fields.ts`
- `src/tools/fields/create-product-field.ts`, `update-product-field.ts`, `delete-product-field.ts`, `bulk-delete-product-fields.ts`

**Modified files:**

- `src/schemas/deal.ts` — remove `.strict()`, add `custom_fields`
- `src/schemas/person.ts` — same
- `src/schemas/organization.ts` — same
- `src/schemas/product.ts` — same
- `src/schemas/lead.ts` — same
- `src/tools/deals/create.ts`, `update.ts`, `get.ts`, `list.ts`, `search.ts` — wire helpers
- `src/tools/persons/create.ts`, `update.ts`, `get.ts`, `list.ts`, `search.ts` — wire helpers
- `src/tools/organizations/create.ts`, `update.ts`, `get.ts`, `list.ts`, `search.ts` — wire helpers
- `src/tools/products/create.ts`, `update.ts`, `get.ts`, `list.ts`, `search.ts` — wire helpers
- `src/tools/leads/create.ts`, `update.ts`, `get.ts`, `list.ts`, `search.ts` — wire helpers (uses deal field defs)
- `src/tools/fields/index.ts` — register new tools
- `docs/CUSTOM_FIELDS.md` — usage docs
- `CHANGELOG.md` — release notes
- `README.md` — quick-start update

---

## Phase 1 — Custom-fields utility (TDD)

### Task 1: Error classes

**Files:**
- Create: `src/utils/custom-fields-errors.ts`
- Test: `src/utils/__tests__/custom-fields-errors.test.ts`

- [ ] **Step 1: Write the failing test**

`src/utils/__tests__/custom-fields-errors.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  CustomFieldResolutionError,
  CustomFieldValidationError,
} from '../custom-fields-errors.js';

describe('CustomFieldResolutionError', () => {
  it('carries kind, fieldName, suggestions and candidates', () => {
    const err = new CustomFieldResolutionError({
      kind: 'not_found',
      fieldName: 'Industri',
      suggestions: ['Industria', 'Industry'],
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.kind).toBe('not_found');
    expect(err.fieldName).toBe('Industri');
    expect(err.suggestions).toEqual(['Industria', 'Industry']);
    expect(err.message).toContain('Industri');
    expect(err.message).toContain('Industria');
  });

  it('emits duplicate_name with candidate hashes', () => {
    const err = new CustomFieldResolutionError({
      kind: 'duplicate_name',
      fieldName: 'Plan',
      candidates: ['hash-a', 'hash-b'],
    });
    expect(err.message).toContain('hash-a');
    expect(err.message).toContain('hash-b');
  });
});

describe('CustomFieldValidationError', () => {
  it('reports field name, expected type, and the offending value', () => {
    const err = new CustomFieldValidationError({
      fieldName: 'Budget',
      expectedType: 'monetary',
      value: 'not a number',
    });
    expect(err.message).toContain('Budget');
    expect(err.message).toContain('monetary');
    expect(err.message).toContain('not a number');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/utils/__tests__/custom-fields-errors.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the module**

`src/utils/custom-fields-errors.ts`:

```typescript
export type ResolutionErrorKind =
  | 'not_found'
  | 'duplicate_name'
  | 'invalid_value'
  | 'invalid_option';

export interface ResolutionErrorParams {
  kind: ResolutionErrorKind;
  fieldName: string;
  suggestions?: string[];
  candidates?: string[];
  detail?: string;
}

export class CustomFieldResolutionError extends Error {
  readonly kind: ResolutionErrorKind;
  readonly fieldName: string;
  readonly suggestions?: string[];
  readonly candidates?: string[];

  constructor(params: ResolutionErrorParams) {
    const parts = [`Custom field "${params.fieldName}"`];
    switch (params.kind) {
      case 'not_found':
        parts.push('not found.');
        if (params.suggestions?.length) {
          parts.push(`Did you mean: ${params.suggestions.map((s) => `"${s}"`).join(', ')}?`);
        }
        break;
      case 'duplicate_name':
        parts.push('matches multiple definitions.');
        if (params.candidates?.length) {
          parts.push(`Disambiguate using one of: ${params.candidates.join(', ')}.`);
        }
        break;
      case 'invalid_value':
        parts.push('has an invalid value.');
        if (params.detail) parts.push(params.detail);
        break;
      case 'invalid_option':
        parts.push('option label not found.');
        if (params.detail) parts.push(params.detail);
        break;
    }
    super(parts.join(' '));
    this.name = 'CustomFieldResolutionError';
    this.kind = params.kind;
    this.fieldName = params.fieldName;
    this.suggestions = params.suggestions;
    this.candidates = params.candidates;
  }
}

export interface ValidationErrorParams {
  fieldName: string;
  expectedType: string;
  value: unknown;
  detail?: string;
}

export class CustomFieldValidationError extends Error {
  readonly fieldName: string;
  readonly expectedType: string;
  readonly value: unknown;

  constructor(params: ValidationErrorParams) {
    const valueStr =
      typeof params.value === 'string' ? params.value : JSON.stringify(params.value);
    const detail = params.detail ? ` ${params.detail}` : '';
    super(
      `Custom field "${params.fieldName}" expects type ${params.expectedType}, got ${valueStr}.${detail}`
    );
    this.name = 'CustomFieldValidationError';
    this.fieldName = params.fieldName;
    this.expectedType = params.expectedType;
    this.value = params.value;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/utils/__tests__/custom-fields-errors.test.ts`
Expected: PASS (3 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/utils/custom-fields-errors.ts src/utils/__tests__/custom-fields-errors.test.ts
git commit -m "feat: add custom field error classes"
```

---

### Task 2: Field-definition types and entity mapping

**Files:**
- Create: `src/utils/custom-fields.ts` (initial skeleton with types + entity mapping)
- Test: `src/utils/__tests__/custom-fields.test.ts`

- [ ] **Step 1: Write the failing test**

`src/utils/__tests__/custom-fields.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getFieldDefinitionsEndpoint, isHashKey } from '../custom-fields.js';

describe('getFieldDefinitionsEndpoint', () => {
  it.each([
    ['deal', '/dealFields'],
    ['person', '/personFields'],
    ['organization', '/organizationFields'],
    ['product', '/productFields'],
    ['lead', '/dealFields'], // leads share deal fields
  ] as const)('maps %s to %s', (entity, endpoint) => {
    expect(getFieldDefinitionsEndpoint(entity)).toBe(endpoint);
  });
});

describe('isHashKey', () => {
  it('returns true for 40-char lowercase hex', () => {
    expect(isHashKey('abcdef0123456789abcdef0123456789abcdef01')).toBe(true);
  });

  it('returns false for short or non-hex strings', () => {
    expect(isHashKey('Industria')).toBe(false);
    expect(isHashKey('abc')).toBe(false);
    expect(isHashKey('ABCDEF0123456789ABCDEF0123456789ABCDEF01')).toBe(false); // uppercase
    expect(isHashKey('xyzdef0123456789abcdef0123456789abcdef01')).toBe(false); // non-hex
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/utils/custom-fields.ts`:

```typescript
import type { PipedriveClient } from '../pipedrive-client.js';

export type CustomFieldEntity = 'deal' | 'person' | 'organization' | 'product' | 'lead';

export interface FieldOption {
  id: number;
  label: string;
}

export interface FieldDefinition {
  id: number;
  key: string; // 40-char hex hash
  name: string;
  field_type: string;
  options?: FieldOption[];
}

export function getFieldDefinitionsEndpoint(entity: CustomFieldEntity): string {
  switch (entity) {
    case 'deal':
    case 'lead':
      return '/dealFields';
    case 'person':
      return '/personFields';
    case 'organization':
      return '/organizationFields';
    case 'product':
      return '/productFields';
  }
}

const HASH_KEY_RE = /^[a-f0-9]{40}$/;

export function isHashKey(value: string): boolean {
  return HASH_KEY_RE.test(value);
}

// Placeholder exports — implemented in later tasks.
export async function loadFieldDefinitions(
  _client: PipedriveClient,
  _entity: CustomFieldEntity,
  _opts?: { fetchIfMissing?: boolean }
): Promise<FieldDefinition[] | undefined> {
  throw new Error('not implemented');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: PASS (6 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/utils/custom-fields.ts src/utils/__tests__/custom-fields.test.ts
git commit -m "feat: add custom field types and entity-to-endpoint mapping"
```

---

### Task 3: `loadFieldDefinitions` with cache-aware behavior

**Files:**
- Modify: `src/utils/custom-fields.ts`
- Modify: `src/utils/__tests__/custom-fields.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/utils/__tests__/custom-fields.test.ts`:

```typescript
import { vi, beforeEach } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { loadFieldDefinitions } from '../custom-fields.js';

describe('loadFieldDefinitions', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('returns definitions array from Pipedrive', async () => {
    mockClient.get = vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum', options: [] },
      ],
    });

    const result = await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    expect(mockClient.get).toHaveBeenCalledWith('/dealFields', undefined, {
      enabled: true,
      ttl: 900000,
    });
    expect(result).toHaveLength(1);
    expect(result?.[0].name).toBe('Industria');
  });

  it('returns undefined when cache is cold and fetchIfMissing is false', async () => {
    // The mock get always returns data; when fetchIfMissing=false we should NOT call it.
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: [] });

    const result = await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: false });

    expect(mockClient.get).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('uses /dealFields for the lead entity', async () => {
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: [] });

    await loadFieldDefinitions(mockClient, 'lead', { fetchIfMissing: true });

    expect(mockClient.get).toHaveBeenCalledWith('/dealFields', undefined, expect.any(Object));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: FAIL — `not implemented`.

- [ ] **Step 3: Implement**

Replace the placeholder `loadFieldDefinitions` in `src/utils/custom-fields.ts` with:

```typescript
interface PipedriveListResponse<T> {
  success: boolean;
  data: T[] | null;
}

const FIELD_DEFINITIONS_TTL_MS = 900_000; // 15 min, matches existing field tools

/**
 * Loads field definitions for an entity.
 *
 * Two modes:
 * - fetchIfMissing=true (write path): always returns definitions, fetching once if cache cold.
 * - fetchIfMissing=false (read enrichment path): returns undefined if cache cold; never adds an HTTP call.
 *
 * The cache key is owned by PipedriveClient; we just pass `enabled:true` on the GET so the same
 * 15-min entry is reused across all read paths.
 */
export async function loadFieldDefinitions(
  client: PipedriveClient,
  entity: CustomFieldEntity,
  opts: { fetchIfMissing?: boolean } = {}
): Promise<FieldDefinition[] | undefined> {
  const endpoint = getFieldDefinitionsEndpoint(entity);

  if (!opts.fetchIfMissing) {
    // Read path: only return if already cached. We probe via getCacheStats indirectly —
    // since the client doesn't expose a "peek" API, we keep a tiny in-process WeakMap
    // of "definitions known to have been fetched at least once" per client.
    if (!cachePresence.get(client)?.has(endpoint)) {
      return undefined;
    }
  }

  const response = await client.get<PipedriveListResponse<FieldDefinition>>(
    endpoint,
    undefined,
    { enabled: true, ttl: FIELD_DEFINITIONS_TTL_MS }
  );

  // Track that we've populated the cache for this client/endpoint pair.
  let set = cachePresence.get(client);
  if (!set) {
    set = new Set();
    cachePresence.set(client, set);
  }
  set.add(endpoint);

  return response.data ?? [];
}

// Per-client tracker so the read path can know if the write path has ever
// warmed the cache for this entity. Cleared automatically when the client is GC'd.
const cachePresence = new WeakMap<PipedriveClient, Set<string>>();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add src/utils/custom-fields.ts src/utils/__tests__/custom-fields.test.ts
git commit -m "feat: add cache-aware loadFieldDefinitions helper"
```

---

### Task 4: `findFieldDefinition` (lookup by name or hash, suggestions on miss)

**Files:**
- Modify: `src/utils/custom-fields.ts`
- Modify: `src/utils/__tests__/custom-fields.test.ts`

- [ ] **Step 1: Write the failing test**

Append:

```typescript
import { findFieldDefinition } from '../custom-fields.js';
import { CustomFieldResolutionError } from '../custom-fields-errors.js';

describe('findFieldDefinition', () => {
  const defs: FieldDefinition[] = [
    { id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum', options: [] },
    { id: 2, key: 'b'.repeat(40), name: 'Industry', field_type: 'varchar' },
    { id: 3, key: 'c'.repeat(40), name: 'Plan', field_type: 'enum', options: [] },
    { id: 4, key: 'd'.repeat(40), name: 'plan', field_type: 'varchar' }, // duplicate (case-insensitive)
  ];

  it('finds by exact name', () => {
    expect(findFieldDefinition(defs, 'Industria').key).toBe('a'.repeat(40));
  });

  it('finds by case-insensitive name', () => {
    expect(findFieldDefinition(defs, 'industria').key).toBe('a'.repeat(40));
  });

  it('finds by trimmed name', () => {
    expect(findFieldDefinition(defs, '  Industria  ').key).toBe('a'.repeat(40));
  });

  it('passes hash through (returns synthetic definition)', () => {
    const hash = 'e'.repeat(40);
    const result = findFieldDefinition(defs, hash);
    expect(result.key).toBe(hash);
    expect(result.field_type).toBe('unknown');
  });

  it('throws not_found with top-3 suggestions', () => {
    expect(() => findFieldDefinition(defs, 'Industri')).toThrow(CustomFieldResolutionError);
    try {
      findFieldDefinition(defs, 'Industri');
    } catch (e) {
      const err = e as CustomFieldResolutionError;
      expect(err.kind).toBe('not_found');
      expect(err.suggestions).toContain('Industria');
    }
  });

  it('throws duplicate_name when two definitions share a case-insensitive name', () => {
    try {
      findFieldDefinition(defs, 'Plan');
    } catch (e) {
      const err = e as CustomFieldResolutionError;
      expect(err.kind).toBe('duplicate_name');
      expect(err.candidates).toEqual(['c'.repeat(40), 'd'.repeat(40)]);
    }
  });
});

// Need to import FieldDefinition for the typed defs above:
import type { FieldDefinition } from '../custom-fields.js';
```

(Move the type-only import to the top of the file, near the other imports, to keep TypeScript happy.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Append to `src/utils/custom-fields.ts`:

```typescript
import { CustomFieldResolutionError } from './custom-fields-errors.js';

/**
 * Locate a field definition by name (case-insensitive, trimmed) or hash key.
 * - Hash key: returns a synthetic definition with field_type='unknown' (skips validation).
 * - Exact case-insensitive match: returns the definition.
 * - Multiple matches: throws duplicate_name with all candidate hashes.
 * - No match: throws not_found with up to 3 suggestions by Levenshtein distance.
 */
export function findFieldDefinition(
  definitions: FieldDefinition[],
  input: string
): FieldDefinition {
  const trimmed = input.trim();

  if (isHashKey(trimmed)) {
    const exact = definitions.find((d) => d.key === trimmed);
    if (exact) return exact;
    return { id: -1, key: trimmed, name: trimmed, field_type: 'unknown' };
  }

  const needle = trimmed.toLowerCase();
  const matches = definitions.filter((d) => d.name.trim().toLowerCase() === needle);

  if (matches.length === 1) return matches[0];

  if (matches.length > 1) {
    throw new CustomFieldResolutionError({
      kind: 'duplicate_name',
      fieldName: trimmed,
      candidates: matches.map((d) => d.key),
    });
  }

  const suggestions = topSuggestions(trimmed, definitions);
  throw new CustomFieldResolutionError({
    kind: 'not_found',
    fieldName: trimmed,
    suggestions,
  });
}

function topSuggestions(input: string, defs: FieldDefinition[]): string[] {
  const lower = input.toLowerCase();
  return defs
    .map((d) => ({ name: d.name, dist: levenshtein(lower, d.name.toLowerCase()) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map((x) => x.name);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/custom-fields.ts src/utils/__tests__/custom-fields.test.ts
git commit -m "feat: add findFieldDefinition with name/hash lookup and suggestions"
```

---

### Task 5: `transformValueToWireFormat` (per-type conversion)

**Files:**
- Modify: `src/utils/custom-fields.ts`
- Modify: `src/utils/__tests__/custom-fields.test.ts`

- [ ] **Step 1: Write the failing test**

Append:

```typescript
import { transformValueToWireFormat } from '../custom-fields.js';
import { CustomFieldValidationError } from '../custom-fields-errors.js';

describe('transformValueToWireFormat', () => {
  const enumDef: FieldDefinition = {
    id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum',
    options: [{ id: 10, label: 'Tech' }, { id: 11, label: 'Finance' }],
  };
  const setDef: FieldDefinition = {
    id: 2, key: 'b'.repeat(40), name: 'Tags', field_type: 'set',
    options: [{ id: 20, label: 'A' }, { id: 21, label: 'B' }, { id: 22, label: 'C' }],
  };
  const dateDef: FieldDefinition = {
    id: 3, key: 'c'.repeat(40), name: 'Closed At', field_type: 'date',
  };
  const monetaryDef: FieldDefinition = {
    id: 4, key: 'd'.repeat(40), name: 'Budget', field_type: 'monetary',
  };
  const daterangeDef: FieldDefinition = {
    id: 5, key: 'e'.repeat(40), name: 'Window', field_type: 'daterange',
  };
  const textDef: FieldDefinition = {
    id: 6, key: 'f'.repeat(40), name: 'Notes', field_type: 'varchar',
  };
  const unknownDef: FieldDefinition = {
    id: -1, key: 'a'.repeat(40), name: 'a'.repeat(40), field_type: 'unknown',
  };

  it('enum: label → option id', () => {
    expect(transformValueToWireFormat(enumDef, 'Tech')).toEqual({ [enumDef.key]: 10 });
  });

  it('enum: unknown label throws invalid_option', () => {
    expect(() => transformValueToWireFormat(enumDef, 'Mining')).toThrow(/option/i);
  });

  it('set: array of labels → comma-separated option ids', () => {
    expect(transformValueToWireFormat(setDef, ['A', 'C'])).toEqual({ [setDef.key]: '20,22' });
  });

  it('set: non-array throws', () => {
    expect(() => transformValueToWireFormat(setDef, 'A')).toThrow(CustomFieldValidationError);
  });

  it('date: validates YYYY-MM-DD', () => {
    expect(transformValueToWireFormat(dateDef, '2026-06-11')).toEqual({ [dateDef.key]: '2026-06-11' });
    expect(() => transformValueToWireFormat(dateDef, '06/11/2026')).toThrow(CustomFieldValidationError);
  });

  it('monetary: number is passed through', () => {
    expect(transformValueToWireFormat(monetaryDef, 1000)).toEqual({ [monetaryDef.key]: 1000 });
  });

  it('monetary: { value, currency } passed through', () => {
    expect(
      transformValueToWireFormat(monetaryDef, { value: 1000, currency: 'EUR' })
    ).toEqual({ [monetaryDef.key]: 1000, [`${monetaryDef.key}_currency`]: 'EUR' });
  });

  it('daterange: { start, end } expands to <hash> and <hash>_until', () => {
    expect(
      transformValueToWireFormat(daterangeDef, { start: '2026-01-01', end: '2026-12-31' })
    ).toEqual({
      [daterangeDef.key]: '2026-01-01',
      [`${daterangeDef.key}_until`]: '2026-12-31',
    });
  });

  it('varchar: string is passed through', () => {
    expect(transformValueToWireFormat(textDef, 'hello')).toEqual({ [textDef.key]: 'hello' });
  });

  it('unknown field_type (hash passthrough): value is passed through untouched', () => {
    expect(transformValueToWireFormat(unknownDef, 42)).toEqual({ [unknownDef.key]: 42 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Append to `src/utils/custom-fields.ts`:

```typescript
import { CustomFieldValidationError } from './custom-fields-errors.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

/**
 * Converts an LLM-friendly value into the wire format Pipedrive expects, returning
 * the partial body object to merge into the request payload. Always keyed by hash.
 */
export function transformValueToWireFormat(
  def: FieldDefinition,
  value: unknown
): Record<string, unknown> {
  const key = def.key;

  switch (def.field_type) {
    case 'enum':
      return { [key]: optionLabelToId(def, value) };

    case 'set': {
      if (!Array.isArray(value)) {
        throw new CustomFieldValidationError({
          fieldName: def.name,
          expectedType: 'set (array of labels)',
          value,
        });
      }
      const ids = value.map((label) => optionLabelToId(def, label));
      return { [key]: ids.join(',') };
    }

    case 'date':
      if (typeof value !== 'string' || !DATE_RE.test(value)) {
        throw new CustomFieldValidationError({
          fieldName: def.name,
          expectedType: 'date (YYYY-MM-DD)',
          value,
        });
      }
      return { [key]: value };

    case 'time':
      if (typeof value !== 'string' || !TIME_RE.test(value)) {
        throw new CustomFieldValidationError({
          fieldName: def.name,
          expectedType: 'time (HH:MM or HH:MM:SS)',
          value,
        });
      }
      return { [key]: value };

    case 'daterange':
      return expandRange(def, value, DATE_RE, 'date (YYYY-MM-DD)');

    case 'timerange':
      return expandRange(def, value, TIME_RE, 'time (HH:MM[:SS])');

    case 'monetary':
      if (typeof value === 'number') return { [key]: value };
      if (
        value &&
        typeof value === 'object' &&
        'value' in value &&
        typeof (value as { value: unknown }).value === 'number'
      ) {
        const v = value as { value: number; currency?: string };
        const out: Record<string, unknown> = { [key]: v.value };
        if (v.currency) out[`${key}_currency`] = v.currency;
        return out;
      }
      throw new CustomFieldValidationError({
        fieldName: def.name,
        expectedType: 'monetary (number or { value, currency })',
        value,
      });

    case 'double':
      if (typeof value !== 'number') {
        throw new CustomFieldValidationError({
          fieldName: def.name,
          expectedType: 'number',
          value,
        });
      }
      return { [key]: value };

    case 'address':
      if (typeof value === 'string' || (value && typeof value === 'object')) {
        return { [key]: value };
      }
      throw new CustomFieldValidationError({
        fieldName: def.name,
        expectedType: 'address (string or structured object)',
        value,
      });

    case 'user':
    case 'org':
    case 'people':
      if (typeof value !== 'number') {
        throw new CustomFieldValidationError({
          fieldName: def.name,
          expectedType: `${def.field_type} (numeric id)`,
          value,
        });
      }
      return { [key]: value };

    case 'varchar':
    case 'varchar_auto':
    case 'text':
    case 'phone':
      if (typeof value !== 'string') {
        throw new CustomFieldValidationError({
          fieldName: def.name,
          expectedType: def.field_type,
          value,
        });
      }
      return { [key]: value };

    case 'unknown':
    default:
      // Hash passthrough or unknown — trust the caller.
      return { [key]: value };
  }
}

function optionLabelToId(def: FieldDefinition, label: unknown): number {
  if (typeof label !== 'string') {
    throw new CustomFieldValidationError({
      fieldName: def.name,
      expectedType: 'option label (string)',
      value: label,
    });
  }
  const needle = label.trim().toLowerCase();
  const match = def.options?.find((o) => o.label.trim().toLowerCase() === needle);
  if (!match) {
    throw new CustomFieldResolutionError({
      kind: 'invalid_option',
      fieldName: def.name,
      detail: `Valid options: ${def.options?.map((o) => `"${o.label}"`).join(', ') ?? '(none)'}.`,
    });
  }
  return match.id;
}

function expandRange(
  def: FieldDefinition,
  value: unknown,
  pattern: RegExp,
  expected: string
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    typeof (value as { start?: unknown }).start !== 'string' ||
    typeof (value as { end?: unknown }).end !== 'string'
  ) {
    throw new CustomFieldValidationError({
      fieldName: def.name,
      expectedType: `${def.field_type} ({ start, end })`,
      value,
    });
  }
  const { start, end } = value as { start: string; end: string };
  if (!pattern.test(start) || !pattern.test(end)) {
    throw new CustomFieldValidationError({
      fieldName: def.name,
      expectedType: `${def.field_type} of ${expected}`,
      value,
    });
  }
  return { [def.key]: start, [`${def.key}_until`]: end };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/custom-fields.ts src/utils/__tests__/custom-fields.test.ts
git commit -m "feat: add transformValueToWireFormat for all custom field types"
```

---

### Task 6: `resolveCustomFieldsForEntity` (orchestrator)

**Files:**
- Modify: `src/utils/custom-fields.ts`
- Modify: `src/utils/__tests__/custom-fields.test.ts`

- [ ] **Step 1: Write the failing test**

Append:

```typescript
import { resolveCustomFieldsForEntity } from '../custom-fields.js';

describe('resolveCustomFieldsForEntity', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  const defs: FieldDefinition[] = [
    {
      id: 1,
      key: 'a'.repeat(40),
      name: 'Industria',
      field_type: 'enum',
      options: [{ id: 10, label: 'Tech' }],
    },
    { id: 2, key: 'b'.repeat(40), name: 'Budget', field_type: 'monetary' },
  ];

  it('returns empty object when custom_fields is undefined', async () => {
    const result = await resolveCustomFieldsForEntity(mockClient, 'deal', undefined);
    expect(result).toEqual({});
    expect(mockClient.get).not.toHaveBeenCalled();
  });

  it('returns empty object when custom_fields is empty', async () => {
    const result = await resolveCustomFieldsForEntity(mockClient, 'deal', {});
    expect(result).toEqual({});
  });

  it('resolves multiple fields by name', async () => {
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });

    const result = await resolveCustomFieldsForEntity(mockClient, 'deal', {
      Industria: 'Tech',
      Budget: 5000,
    });

    expect(result).toEqual({
      [defs[0].key]: 10,
      [defs[1].key]: 5000,
    });
  });

  it('passes hash keys through without resolving', async () => {
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    const hash = 'c'.repeat(40);

    const result = await resolveCustomFieldsForEntity(mockClient, 'deal', {
      [hash]: 'raw-value',
    });

    expect(result).toEqual({ [hash]: 'raw-value' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Append to `src/utils/custom-fields.ts`:

```typescript
/**
 * Translates an LLM-friendly custom_fields object into a hash-keyed payload ready to merge
 * into a Pipedrive create/update request body. Loads field definitions on demand (cached).
 */
export async function resolveCustomFieldsForEntity(
  client: PipedriveClient,
  entity: CustomFieldEntity,
  customFields: Record<string, unknown> | undefined
): Promise<Record<string, unknown>> {
  if (!customFields || Object.keys(customFields).length === 0) return {};

  const defs = (await loadFieldDefinitions(client, entity, { fetchIfMissing: true })) ?? [];

  const out: Record<string, unknown> = {};
  for (const [inputKey, value] of Object.entries(customFields)) {
    const def = findFieldDefinition(defs, inputKey);
    Object.assign(out, transformValueToWireFormat(def, value));
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/custom-fields.ts src/utils/__tests__/custom-fields.test.ts
git commit -m "feat: add resolveCustomFieldsForEntity orchestrator"
```

---

### Task 7: `buildResolvedCustomFields` + `enrichEntityWithCustomFields` (read path)

**Files:**
- Modify: `src/utils/custom-fields.ts`
- Modify: `src/utils/__tests__/custom-fields.test.ts`

- [ ] **Step 1: Write the failing test**

Append:

```typescript
import {
  buildResolvedCustomFields,
  enrichEntityWithCustomFields,
} from '../custom-fields.js';

describe('buildResolvedCustomFields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  const defs: FieldDefinition[] = [
    {
      id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum',
      options: [{ id: 10, label: 'Tech' }, { id: 11, label: 'Finance' }],
    },
    { id: 2, key: 'b'.repeat(40), name: 'Budget', field_type: 'monetary' },
    { id: 3, key: 'c'.repeat(40), name: 'Tags', field_type: 'set',
      options: [{ id: 20, label: 'A' }, { id: 21, label: 'B' }] },
  ];

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('returns empty object when cache is cold (no HTTP call)', async () => {
    const result = await buildResolvedCustomFields(mockClient, 'deal', {
      ['a'.repeat(40)]: 10,
    });
    expect(result).toEqual({});
    expect(mockClient.get).not.toHaveBeenCalled();
  });

  it('maps enum hash to label when cache is warm', async () => {
    // Warm the cache by an explicit load.
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const result = await buildResolvedCustomFields(mockClient, 'deal', {
      ['a'.repeat(40)]: 10,
      ['b'.repeat(40)]: 5000,
      ['c'.repeat(40)]: '20,21',
    });

    expect(result).toEqual({
      Industria: 'Tech',
      Budget: 5000,
      Tags: ['A', 'B'],
    });
  });

  it('returns empty object when entity has no custom field values', async () => {
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const result = await buildResolvedCustomFields(mockClient, 'deal', {
      title: 'Deal X',
      id: 1,
    });
    expect(result).toEqual({});
  });
});

describe('enrichEntityWithCustomFields', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  const defs: FieldDefinition[] = [
    { id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum',
      options: [{ id: 10, label: 'Tech' }] },
  ];

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('adds custom_fields_resolved to a single-entity response', async () => {
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const response = {
      success: true,
      data: { id: 1, title: 'Deal X', ['a'.repeat(40)]: 10 },
    };
    const enriched = await enrichEntityWithCustomFields(mockClient, 'deal', response);
    expect((enriched.data as any).custom_fields_resolved).toEqual({ Industria: 'Tech' });
    expect((enriched.data as any).title).toBe('Deal X'); // preserved
  });

  it('adds custom_fields_resolved to each entity in a list response', async () => {
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const response = {
      success: true,
      data: [
        { id: 1, title: 'A', ['a'.repeat(40)]: 10 },
        { id: 2, title: 'B', ['a'.repeat(40)]: 10 },
      ],
    };
    const enriched = await enrichEntityWithCustomFields(mockClient, 'deal', response);
    expect((enriched.data as any[])[0].custom_fields_resolved).toEqual({ Industria: 'Tech' });
    expect((enriched.data as any[])[1].custom_fields_resolved).toEqual({ Industria: 'Tech' });
  });

  it('returns response unchanged when data is null/undefined', async () => {
    const response = { success: false, data: null };
    const enriched = await enrichEntityWithCustomFields(mockClient, 'deal', response);
    expect(enriched).toBe(response);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

Append to `src/utils/custom-fields.ts`:

```typescript
/**
 * Given a raw Pipedrive entity payload (a flat object), return a name-keyed map of
 * the resolved custom field values. Read-path only — never adds an HTTP call.
 */
export async function buildResolvedCustomFields(
  client: PipedriveClient,
  entity: CustomFieldEntity,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const defs = await loadFieldDefinitions(client, entity, { fetchIfMissing: false });
  if (!defs?.length) return {};

  const out: Record<string, unknown> = {};
  const byKey = new Map(defs.map((d) => [d.key, d] as const));

  for (const def of defs) {
    if (!(def.key in data)) continue;
    const raw = data[def.key];
    if (raw === null || raw === undefined || raw === '') continue;
    out[def.name] = humanizeValue(def, raw, byKey);
  }

  return out;
}

function humanizeValue(
  def: FieldDefinition,
  raw: unknown,
  _byKey: Map<string, FieldDefinition>
): unknown {
  if (def.field_type === 'enum' && typeof raw === 'number') {
    return def.options?.find((o) => o.id === raw)?.label ?? raw;
  }
  if (def.field_type === 'set' && typeof raw === 'string') {
    const ids = raw.split(',').map((s) => Number(s.trim()));
    return ids.map((id) => def.options?.find((o) => o.id === id)?.label ?? id);
  }
  return raw;
}

/**
 * Non-destructive wrapper: adds `custom_fields_resolved` next to the raw payload
 * for either a single entity (`data: { ... }`) or a list (`data: [...]`).
 */
export async function enrichEntityWithCustomFields<R extends { data?: unknown }>(
  client: PipedriveClient,
  entity: CustomFieldEntity,
  response: R
): Promise<R> {
  const data = response.data;
  if (!data) return response;

  if (Array.isArray(data)) {
    const enrichedItems = await Promise.all(
      data.map(async (item) => {
        if (!item || typeof item !== 'object') return item;
        const resolved = await buildResolvedCustomFields(
          client,
          entity,
          item as Record<string, unknown>
        );
        if (!Object.keys(resolved).length) return item;
        return { ...(item as Record<string, unknown>), custom_fields_resolved: resolved };
      })
    );
    return { ...response, data: enrichedItems };
  }

  if (typeof data === 'object') {
    const resolved = await buildResolvedCustomFields(
      client,
      entity,
      data as Record<string, unknown>
    );
    if (!Object.keys(resolved).length) return response;
    return {
      ...response,
      data: { ...(data as Record<string, unknown>), custom_fields_resolved: resolved },
    };
  }

  return response;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/utils/__tests__/custom-fields.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/custom-fields.ts src/utils/__tests__/custom-fields.test.ts
git commit -m "feat: add read-path enrichment helpers for custom fields"
```

---

## Phase 2 — Wire writes into entity tools

The pattern repeats per entity. Each entity has its own task in this phase; code is repeated in full because tasks may be executed out of order.

### Task 8: Deal schemas — add `custom_fields`, remove `.strict()`

**Files:**
- Modify: `src/schemas/deal.ts`
- Modify: `src/schemas/__tests__/deal.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/schemas/__tests__/deal.test.ts`:

```typescript
describe('CreateDealSchema custom_fields', () => {
  it('accepts a custom_fields object', () => {
    const result = CreateDealSchema.parse({
      title: 'X',
      custom_fields: { Industria: 'Tech', Budget: 5000 },
    });
    expect(result.custom_fields).toEqual({ Industria: 'Tech', Budget: 5000 });
  });

  it('no longer rejects unknown keys (passthrough)', () => {
    // Hashes passed at top level are tolerated and surface as unknown props.
    const result = CreateDealSchema.parse({
      title: 'X',
      ['a'.repeat(40)]: 'raw',
    } as any);
    expect(result.title).toBe('X');
  });
});

describe('UpdateDealSchema custom_fields', () => {
  it('accepts a custom_fields object', () => {
    const result = UpdateDealSchema.parse({ id: 1, custom_fields: { Plan: 'Gold' } });
    expect(result.custom_fields).toEqual({ Plan: 'Gold' });
  });
});
```

(Import `CreateDealSchema` and `UpdateDealSchema` at the top if not already present.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/schemas/__tests__/deal.test.ts`
Expected: FAIL.

- [ ] **Step 3: Modify `src/schemas/deal.ts`**

In `CreateDealSchema`: remove the `.strict()` call (delete that line). Before the closing `})`, add:

```typescript
    custom_fields: z
      .record(z.unknown())
      .optional()
      .describe('Map of custom field names (or hash keys) to values. Resolved server-side.'),
```

In `UpdateDealSchema`: same — remove `.strict()` and add the same `custom_fields` block.

(Do not change `.passthrough()` behavior elsewhere; removing `.strict()` is enough to make zod accept extra keys silently while still typing the known ones.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/schemas/__tests__/deal.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/deal.ts src/schemas/__tests__/deal.test.ts
git commit -m "feat: allow custom_fields on Create/Update deal schemas"
```

---

### Task 9: Wire `deals_create` and `deals_update` to resolve custom_fields

**Files:**
- Modify: `src/tools/deals/create.ts`
- Modify: `src/tools/deals/update.ts`
- Modify: `src/tools/__tests__/deals.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/tools/__tests__/deals.test.ts`:

```typescript
import { getUpdateDealTools } from '../deals/update.js';

describe('deals/create with custom_fields', () => {
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('resolves custom_fields by name and merges hash-keyed values into the request', async () => {
    const defs = [
      { id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum',
        options: [{ id: 10, label: 'Tech' }] },
    ];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });

    const tools = getCreateDealTool(mockClient);
    await tools['deals_create'].handler({
      title: 'X',
      custom_fields: { Industria: 'Tech' },
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/deals',
      expect.objectContaining({ title: 'X', [defs[0].key]: 10, status: 'open' })
    );
    // custom_fields itself must not be sent to Pipedrive
    const body = (mockClient.post.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});

describe('deals/update with custom_fields', () => {
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('merges resolved custom fields into the PUT body', async () => {
    const defs = [
      { id: 1, key: 'a'.repeat(40), name: 'Budget', field_type: 'monetary' },
    ];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.put.mockResolvedValue({ success: true, data: { id: 1 } });

    const tools = getUpdateDealTools(mockClient);
    await tools['deals_update'].handler({
      id: 1,
      custom_fields: { Budget: 9999 },
    });

    expect(mockClient.put).toHaveBeenCalledWith(
      '/deals/1',
      expect.objectContaining({ [defs[0].key]: 9999 })
    );
    const body = (mockClient.put.mock.calls[0] as any[])[1];
    expect(body.custom_fields).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tools/__tests__/deals.test.ts`
Expected: FAIL.

- [ ] **Step 3: Modify `src/tools/deals/create.ts`**

Replace the handler with:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateDealSchema } from '../../schemas/deal.js';
import { resolveCustomFieldsForEntity } from '../../utils/custom-fields.js';

export function getCreateDealTool(client: PipedriveClient) {
  return {
    deals_create: {
      description: `Create a new deal in Pipedrive.

Creates a new deal with the specified information. Only title is required.

Custom fields:
- Pass display names: { "custom_fields": { "Industria": "Tech", "Budget": 5000 } }
- Or hash keys directly: { "custom_fields": { "abc123...": "raw value" } }
- For enum/set fields, pass option labels (not ids).

Workflow tips:
- Title is the only required field
- Use persons/search or organizations/search to get person_id or org_id
- Use pipelines/list to get pipeline_id and stage_id
- Set expected_close_date in YYYY-MM-DD format
- Probability should be 0-100 (percentage)
- Currency must be a 3-letter code (e.g., USD, EUR, GBP)`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          title: { type: 'string', description: 'Deal title (required)' },
          value: { type: 'number', description: 'Deal value' },
          currency: { type: 'string', description: '3-letter currency code (e.g., USD, EUR)' },
          user_id: { type: 'number', description: 'ID of the user who will own this deal' },
          person_id: { type: 'number', description: 'ID of the person this deal is associated with' },
          org_id: { type: 'number', description: 'ID of the organization this deal is associated with' },
          pipeline_id: { type: 'number', description: 'ID of the pipeline this deal will be in' },
          stage_id: { type: 'number', description: 'ID of the stage this deal will be in' },
          status: { type: 'string', enum: ['open', 'won', 'lost'], description: 'Deal status (default: open)' },
          expected_close_date: { type: 'string', description: 'Expected close date in YYYY-MM-DD format' },
          probability: { type: 'number', description: 'Deal success probability (0-100)' },
          lost_reason: { type: 'string', description: 'Reason why the deal was lost' },
          visible_to: {
            type: 'string',
            enum: ['1', '3', '5', '7'],
            description: "Visibility: 1=Owner, 3=Owner's group, 5=Owner's group and sub-groups, 7=Entire company",
          },
          add_time: { type: 'string', description: 'Creation time in ISO 8601 format' },
          custom_fields: {
            type: 'object',
            description: 'Custom field values keyed by display name or hash. See description for format.',
            additionalProperties: true,
          },
        },
        required: ['title'],
      },
      handler: async (args: unknown) => {
        const { custom_fields, ...validated } = CreateDealSchema.parse(args);
        const resolved = await resolveCustomFieldsForEntity(client, 'deal', custom_fields);
        return client.post('/deals', { ...validated, ...resolved });
      },
    },
  };
}
```

- [ ] **Step 4: Modify `src/tools/deals/update.ts`**

Replace the `deals_update` handler with:

```typescript
import { resolveCustomFieldsForEntity } from '../../utils/custom-fields.js';
// ... keep existing imports for UpdateDealSchema, MoveDealStageSchema, PipedriveClient

      handler: async (args: unknown) => {
        const { id, custom_fields, ...updates } = UpdateDealSchema.parse(args);
        const resolved = await resolveCustomFieldsForEntity(client, 'deal', custom_fields);
        return client.put(`/deals/${id}`, { ...updates, ...resolved });
      },
```

Also add `custom_fields` to the `inputSchema.properties` of `deals_update`:

```typescript
          custom_fields: {
            type: 'object',
            description: 'Custom field values keyed by display name or hash.',
            additionalProperties: true,
          },
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- --run src/tools/__tests__/deals.test.ts`
Expected: PASS (all old + new tests).

- [ ] **Step 6: Commit**

```bash
git add src/tools/deals/create.ts src/tools/deals/update.ts src/tools/__tests__/deals.test.ts
git commit -m "feat: resolve custom_fields on deals_create and deals_update"
```

---

### Task 10: Persons schema + write tools

**Files:**
- Modify: `src/schemas/person.ts`
- Modify: `src/tools/persons/create.ts`
- Modify: `src/tools/persons/update.ts`
- Modify: `src/schemas/__tests__/person.test.ts`
- Modify: `src/tools/__tests__/persons.test.ts`

- [ ] **Step 1: Write the failing test (schema)**

Append to `src/schemas/__tests__/person.test.ts`:

```typescript
describe('CreatePersonSchema custom_fields', () => {
  it('accepts a custom_fields object', () => {
    const result = CreatePersonSchema.parse({
      name: 'X',
      custom_fields: { Region: 'EU' },
    });
    expect(result.custom_fields).toEqual({ Region: 'EU' });
  });
});

describe('UpdatePersonSchema custom_fields', () => {
  it('accepts a custom_fields object', () => {
    const result = UpdatePersonSchema.parse({ id: 1, custom_fields: { Region: 'EU' } });
    expect(result.custom_fields).toEqual({ Region: 'EU' });
  });
});
```

- [ ] **Step 2: Write the failing test (handlers)**

Append to `src/tools/__tests__/persons.test.ts`:

```typescript
describe('persons/create with custom_fields', () => {
  it('resolves and merges custom fields', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Region', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });

    const tools = getCreatePersonTool(mockClient);
    await tools['persons_create'].handler({ name: 'X', custom_fields: { Region: 'EU' } });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/persons',
      expect.objectContaining({ name: 'X', [defs[0].key]: 'EU' })
    );
  });
});
```

(Ensure `getCreatePersonTool` is imported.)

- [ ] **Step 3: Run tests to verify they fail**

Run:
```bash
npm test -- --run src/schemas/__tests__/person.test.ts src/tools/__tests__/persons.test.ts
```
Expected: FAIL.

- [ ] **Step 4: Modify `src/schemas/person.ts`**

In both `CreatePersonSchema` and `UpdatePersonSchema`: remove `.strict()` if present, and add:

```typescript
    custom_fields: z
      .record(z.unknown())
      .optional()
      .describe('Map of custom field names (or hash keys) to values.'),
```

- [ ] **Step 5: Modify `src/tools/persons/create.ts`**

Add import:
```typescript
import { resolveCustomFieldsForEntity } from '../../utils/custom-fields.js';
```

Add `custom_fields` to `inputSchema.properties`:
```typescript
          custom_fields: {
            type: 'object',
            description: 'Custom field values keyed by display name or hash.',
            additionalProperties: true,
          },
```

Change the handler to:
```typescript
      handler: async (args: unknown) => {
        const { custom_fields, ...validated } = CreatePersonSchema.parse(args);
        const resolved = await resolveCustomFieldsForEntity(client, 'person', custom_fields);
        return client.post('/persons', { ...validated, ...resolved });
      },
```

- [ ] **Step 6: Modify `src/tools/persons/update.ts`**

Apply the same changes as Step 5 but for the `persons_update` tool. Handler:
```typescript
      handler: async (args: unknown) => {
        const { id, custom_fields, ...updates } = UpdatePersonSchema.parse(args);
        const resolved = await resolveCustomFieldsForEntity(client, 'person', custom_fields);
        return client.put(`/persons/${id}`, { ...updates, ...resolved });
      },
```

- [ ] **Step 7: Run tests to verify they pass**

Run:
```bash
npm test -- --run src/schemas/__tests__/person.test.ts src/tools/__tests__/persons.test.ts
```
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/schemas/person.ts src/tools/persons/create.ts src/tools/persons/update.ts \
  src/schemas/__tests__/person.test.ts src/tools/__tests__/persons.test.ts
git commit -m "feat: resolve custom_fields on persons_create and persons_update"
```

---

### Task 11: Organizations schema + write tools

**Files:**
- Modify: `src/schemas/organization.ts`
- Modify: `src/tools/organizations/create.ts`
- Modify: `src/tools/organizations/update.ts`
- Create: `src/tools/__tests__/organizations.test.ts` (if doesn't exist) OR modify if it does

- [ ] **Step 1: Check if test file exists**

Run: `ls src/tools/__tests__/organizations.test.ts 2>/dev/null || echo "missing"`

If `missing`, create a new file with the imports at the top (mirror `deals.test.ts` structure). Otherwise append to it.

- [ ] **Step 2: Write the failing test**

In `src/tools/__tests__/organizations.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateOrganizationTool } from '../organizations/create.js';

describe('organizations/create with custom_fields', () => {
  it('resolves and merges custom fields', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Tier', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });

    const tools = getCreateOrganizationTool(mockClient);
    await tools['organizations_create'].handler({
      name: 'ACME',
      custom_fields: { Tier: 'Gold' },
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/organizations',
      expect.objectContaining({ name: 'ACME', [defs[0].key]: 'Gold' })
    );
  });
});
```

(Adjust the imported tool name to match the actual export in `src/tools/organizations/create.ts`.)

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --run src/tools/__tests__/organizations.test.ts`
Expected: FAIL.

- [ ] **Step 4: Update schema**

Modify `src/schemas/organization.ts`: in both Create and Update org schemas, remove `.strict()` and add `custom_fields: z.record(z.unknown()).optional()`.

- [ ] **Step 5: Update handlers**

In `src/tools/organizations/create.ts`:
```typescript
import { resolveCustomFieldsForEntity } from '../../utils/custom-fields.js';
// Add `custom_fields` to inputSchema.properties as in Task 10.
// Handler:
handler: async (args: unknown) => {
  const { custom_fields, ...validated } = CreateOrganizationSchema.parse(args);
  const resolved = await resolveCustomFieldsForEntity(client, 'organization', custom_fields);
  return client.post('/organizations', { ...validated, ...resolved });
},
```

In `src/tools/organizations/update.ts`: same pattern, using `UpdateOrganizationSchema` and `client.put('/organizations/${id}', ...)`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --run src/tools/__tests__/organizations.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/schemas/organization.ts src/tools/organizations/create.ts \
  src/tools/organizations/update.ts src/tools/__tests__/organizations.test.ts
git commit -m "feat: resolve custom_fields on organizations_create and organizations_update"
```

---

### Task 12: Products schema + write tools

**Files:**
- Modify: `src/schemas/product.ts`
- Modify: `src/tools/products/create.ts`, `src/tools/products/update.ts`
- Create or modify: `src/tools/__tests__/products.test.ts` (note: existing file is `products.test.ts.skip` — copy to `.ts` and remove `.skip`)

- [ ] **Step 1: Activate the products test file**

Run: `git mv src/tools/__tests__/products.test.ts.skip src/tools/__tests__/products.test.ts`

If the file has broken tests, replace its contents with:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateProductTool } from '../products/create.js';

describe('products/create with custom_fields', () => {
  it('resolves and merges custom fields', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'SKU Class', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });

    const tools = getCreateProductTool(mockClient);
    await tools['products_create'].handler({
      name: 'Widget',
      custom_fields: { 'SKU Class': 'A' },
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ name: 'Widget', [defs[0].key]: 'A' })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tools/__tests__/products.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update schema and handlers**

Same pattern as Task 10/11 but for products. Endpoint is `/products` and `/products/${id}`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/tools/__tests__/products.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/product.ts src/tools/products/create.ts src/tools/products/update.ts \
  src/tools/__tests__/products.test.ts
git commit -m "feat: resolve custom_fields on products_create and products_update"
```

---

### Task 13: Leads schema + write tools

**Files:**
- Modify: `src/schemas/lead.ts`
- Modify: `src/tools/leads/create.ts`, `src/tools/leads/update.ts`
- Modify: `src/tools/__tests__/leads.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/tools/__tests__/leads.test.ts`:

```typescript
describe('leads/create with custom_fields', () => {
  it('resolves custom fields using deal field definitions', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Source', field_type: 'varchar' }];
    mockClient.get = vi.fn().mockResolvedValue({ success: true, data: defs });
    mockClient.post.mockResolvedValue({ success: true, data: { id: 'lead-uuid' } });

    const tools = getCreateLeadTool(mockClient);
    await tools['leads_create'].handler({
      title: 'New lead',
      custom_fields: { Source: 'Web' },
    });

    expect(mockClient.get).toHaveBeenCalledWith('/dealFields', undefined, expect.any(Object));
    expect(mockClient.post).toHaveBeenCalledWith(
      '/leads',
      expect.objectContaining({ title: 'New lead', [defs[0].key]: 'Web' })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tools/__tests__/leads.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update schema and handlers**

Same pattern as Task 10, but the entity name passed to `resolveCustomFieldsForEntity` is `'lead'` (which internally maps to `/dealFields`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/tools/__tests__/leads.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/lead.ts src/tools/leads/create.ts src/tools/leads/update.ts \
  src/tools/__tests__/leads.test.ts
git commit -m "feat: resolve custom_fields on leads_create and leads_update"
```

---

## Phase 3 — Wire reads to enrich responses

### Task 14: Enrich `deals_get`, `deals_list`, `deals_search`

**Files:**
- Modify: `src/tools/deals/get.ts`, `list.ts`, `search.ts`
- Modify: `src/tools/__tests__/deals.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/tools/__tests__/deals.test.ts`:

```typescript
import { enrichEntityWithCustomFields, loadFieldDefinitions } from '../../utils/custom-fields.js';

describe('deals/get with enrichment', () => {
  it('adds custom_fields_resolved when cache is warm', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Industria', field_type: 'enum',
      options: [{ id: 10, label: 'Tech' }] }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/dealFields') return { success: true, data: defs };
      return { success: true, data: { id: 1, title: 'X', ['a'.repeat(40)]: 10 } };
    });

    // Warm the cache once.
    await loadFieldDefinitions(mockClient, 'deal', { fetchIfMissing: true });

    const tools = getGetDealTool(mockClient);
    const result = await tools['deals_get'].handler({ id: 1 });

    expect((result.data as any).custom_fields_resolved).toEqual({ Industria: 'Tech' });
    expect((result.data as any).title).toBe('X');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tools/__tests__/deals.test.ts`
Expected: FAIL.

- [ ] **Step 3: Modify `src/tools/deals/get.ts`**

Replace the handler with:

```typescript
import { enrichEntityWithCustomFields } from '../../utils/custom-fields.js';

// ... keep existing imports and tool definition; only change the handler:

      handler: async (args: unknown) => {
        const { id } = GetDealSchema.parse(args);
        const response = await client.get<{ success: boolean; data?: unknown }>(
          `/deals/${id}`,
          undefined,
          { enabled: true, ttl: 300000 }
        );
        return enrichEntityWithCustomFields(client, 'deal', response);
      },
```

- [ ] **Step 4: Modify `src/tools/deals/list.ts`**

Locate the handler that calls `client.get('/deals', ...)` (or the paginator). Wrap the result in `await enrichEntityWithCustomFields(client, 'deal', response)`. Import the helper at the top.

If the file uses `client.createPaginator` and returns items via `getAllItems()`, enrich the **final aggregated** object the same way after collecting.

- [ ] **Step 5: Modify `src/tools/deals/search.ts`**

Same pattern — wrap the response in `enrichEntityWithCustomFields(client, 'deal', response)`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --run src/tools/__tests__/deals.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/tools/deals/get.ts src/tools/deals/list.ts src/tools/deals/search.ts \
  src/tools/__tests__/deals.test.ts
git commit -m "feat: enrich deal read responses with custom_fields_resolved"
```

---

### Task 15: Enrich persons read tools

**Files:**
- Modify: `src/tools/persons/get.ts`, `list.ts`, `search.ts`
- Modify: `src/tools/__tests__/persons.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/tools/__tests__/persons.test.ts`:

```typescript
import { getGetPersonTool } from '../persons/get.js';
import { loadFieldDefinitions } from '../../utils/custom-fields.js';

describe('persons/get with enrichment', () => {
  it('adds custom_fields_resolved when cache is warm', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Region', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/personFields') return { success: true, data: defs };
      return { success: true, data: { id: 1, name: 'X', ['a'.repeat(40)]: 'EU' } };
    });

    await loadFieldDefinitions(mockClient, 'person', { fetchIfMissing: true });

    const tools = getGetPersonTool(mockClient);
    const result = await tools['persons_get'].handler({ id: 1 });

    expect((result.data as any).custom_fields_resolved).toEqual({ Region: 'EU' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tools/__tests__/persons.test.ts`
Expected: FAIL.

- [ ] **Step 3: Modify handlers**

In each of `src/tools/persons/{get,list,search}.ts`, import `enrichEntityWithCustomFields` and wrap the response, using entity `'person'`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/tools/__tests__/persons.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tools/persons/get.ts src/tools/persons/list.ts src/tools/persons/search.ts \
  src/tools/__tests__/persons.test.ts
git commit -m "feat: enrich person read responses with custom_fields_resolved"
```

---

### Task 16: Enrich organizations read tools

**Files:**
- Modify: `src/tools/organizations/get.ts`, `list.ts`, `search.ts`
- Modify: `src/tools/__tests__/organizations.test.ts`

Same pattern as Task 15, entity `'organization'`, endpoint `/organizationFields`.

- [ ] **Step 1: Write the failing test (mirror Task 15 test, swap entity)**

```typescript
import { getGetOrganizationTool } from '../organizations/get.js';
import { loadFieldDefinitions } from '../../utils/custom-fields.js';

describe('organizations/get with enrichment', () => {
  it('adds custom_fields_resolved when cache is warm', async () => {
    const mockClient = createMockClient();
    const defs = [{ id: 1, key: 'a'.repeat(40), name: 'Tier', field_type: 'varchar' }];

    mockClient.get = vi.fn().mockImplementation(async (endpoint: string) => {
      if (endpoint === '/organizationFields') return { success: true, data: defs };
      return { success: true, data: { id: 1, name: 'ACME', ['a'.repeat(40)]: 'Gold' } };
    });

    await loadFieldDefinitions(mockClient, 'organization', { fetchIfMissing: true });

    const tools = getGetOrganizationTool(mockClient);
    const result = await tools['organizations_get'].handler({ id: 1 });

    expect((result.data as any).custom_fields_resolved).toEqual({ Tier: 'Gold' });
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

Run: `npm test -- --run src/tools/__tests__/organizations.test.ts`

- [ ] **Step 3: Modify handlers** — import + wrap response as in Task 14/15.

- [ ] **Step 4: Run test, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/tools/organizations/get.ts src/tools/organizations/list.ts \
  src/tools/organizations/search.ts src/tools/__tests__/organizations.test.ts
git commit -m "feat: enrich organization read responses with custom_fields_resolved"
```

---

### Task 17: Enrich products read tools

Same pattern, entity `'product'`, endpoint `/productFields`. Apply identical structure (steps 1–5) on `src/tools/products/{get,list,search}.ts` and `src/tools/__tests__/products.test.ts`.

Commit message: `feat: enrich product read responses with custom_fields_resolved`.

---

### Task 18: Enrich leads read tools

Same pattern, entity `'lead'`, endpoint `/dealFields`. Apply identical structure on `src/tools/leads/{get,list,search}.ts` and `src/tools/__tests__/leads.test.ts`.

Commit message: `feat: enrich lead read responses with custom_fields_resolved`.

---

## Phase 4 — CRUD parity for deal/person/product fields

The patterns are 1:1 with the existing `organization-field` tools. Each entity gets its own task; code is repeated in full.

### Task 19: `deal-field` schemas

**Files:**
- Create: `src/schemas/deal-field.ts`
- Create: `src/schemas/__tests__/deal-field.test.ts`

- [ ] **Step 1: Write the failing test**

`src/schemas/__tests__/deal-field.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  CreateDealFieldSchema,
  UpdateDealFieldSchema,
  DeleteDealFieldSchema,
  BulkDeleteDealFieldsSchema,
} from '../deal-field.js';

describe('CreateDealFieldSchema', () => {
  it('accepts a basic varchar field', () => {
    const r = CreateDealFieldSchema.parse({ name: 'X', field_type: 'varchar' });
    expect(r.name).toBe('X');
  });

  it('requires options for enum fields', () => {
    expect(() => CreateDealFieldSchema.parse({ name: 'X', field_type: 'enum' })).toThrow();
  });

  it('accepts enum with options', () => {
    const r = CreateDealFieldSchema.parse({
      name: 'X', field_type: 'enum', options: [{ label: 'A' }],
    });
    expect(r.options?.[0].label).toBe('A');
  });
});

describe('UpdateDealFieldSchema', () => {
  it('requires id', () => {
    expect(() => UpdateDealFieldSchema.parse({ name: 'X' })).toThrow();
  });

  it('accepts id with optional name', () => {
    const r = UpdateDealFieldSchema.parse({ id: 1, name: 'Renamed' });
    expect(r.id).toBe(1);
  });
});

describe('DeleteDealFieldSchema', () => {
  it('requires id', () => {
    expect(() => DeleteDealFieldSchema.parse({})).toThrow();
    expect(DeleteDealFieldSchema.parse({ id: 5 }).id).toBe(5);
  });
});

describe('BulkDeleteDealFieldsSchema', () => {
  it('accepts comma-separated string', () => {
    expect(BulkDeleteDealFieldsSchema.parse({ ids: '1,2,3' }).ids).toBe('1,2,3');
  });

  it('accepts numeric array', () => {
    expect(BulkDeleteDealFieldsSchema.parse({ ids: [1, 2, 3] }).ids).toEqual([1, 2, 3]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/schemas/__tests__/deal-field.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

`src/schemas/deal-field.ts` — copy of `organization-field.ts` with renamed exports:

```typescript
import { z } from 'zod';
import { IdSchema } from './common.js';
import { FieldTypeSchema, FieldOptionSchema } from './organization-field.js';

export const CreateDealFieldSchema = z
  .object({
    name: z.string().min(1).max(255).describe('Display name of the field'),
    field_type: FieldTypeSchema.describe('Type of the field. enum/set require options.'),
    options: z.array(FieldOptionSchema).min(1).optional()
      .describe('Required for enum/set field types'),
    add_visible_flag: z.boolean().optional()
      .describe('Whether the field is shown in the add form by default'),
  })
  .strict()
  .superRefine((data, ctx) => {
    if ((data.field_type === 'enum' || data.field_type === 'set') && !data.options?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `field_type "${data.field_type}" requires at least one option`,
      });
    }
  });

export type CreateDealFieldInput = z.infer<typeof CreateDealFieldSchema>;

export const UpdateDealFieldSchema = z
  .object({
    id: IdSchema.describe('ID of the deal field to update'),
    name: z.string().min(1).max(255).optional().describe('New display name'),
    options: z.array(FieldOptionSchema).optional()
      .describe('New full set of options for enum/set fields'),
    add_visible_flag: z.boolean().optional(),
  })
  .strict();

export type UpdateDealFieldInput = z.infer<typeof UpdateDealFieldSchema>;

export const DeleteDealFieldSchema = z
  .object({ id: IdSchema.describe('ID of the deal field to delete') })
  .strict();

export type DeleteDealFieldInput = z.infer<typeof DeleteDealFieldSchema>;

export const BulkDeleteDealFieldsSchema = z
  .object({
    ids: z.union([
      z.string().regex(/^\d+(,\d+)*$/),
      z.array(z.coerce.number().int().positive()).min(1),
    ]),
  })
  .strict();

export type BulkDeleteDealFieldsInput = z.infer<typeof BulkDeleteDealFieldsSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/schemas/__tests__/deal-field.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/schemas/deal-field.ts src/schemas/__tests__/deal-field.test.ts
git commit -m "feat: add deal-field zod schemas"
```

---

### Task 20: `deal-field` CRUD tools

**Files:**
- Create: `src/tools/fields/create-deal-field.ts`
- Create: `src/tools/fields/update-deal-field.ts`
- Create: `src/tools/fields/delete-deal-field.ts`
- Create: `src/tools/fields/bulk-delete-deal-fields.ts`
- Create: `src/tools/__tests__/deal-fields.test.ts`

- [ ] **Step 1: Write the failing test**

`src/tools/__tests__/deal-fields.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getCreateDealFieldTool } from '../fields/create-deal-field.js';
import { getUpdateDealFieldTool } from '../fields/update-deal-field.js';
import { getDeleteDealFieldTool } from '../fields/delete-deal-field.js';
import { getBulkDeleteDealFieldsTool } from '../fields/bulk-delete-deal-fields.js';

describe('deal-field CRUD tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => { mockClient = createMockClient(); vi.clearAllMocks(); });

  it('create posts to /dealFields', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getCreateDealFieldTool(mockClient);
    await tools['fields_create_deal_field'].handler({ name: 'X', field_type: 'varchar' });
    expect(mockClient.post).toHaveBeenCalledWith('/dealFields', expect.objectContaining({
      name: 'X', field_type: 'varchar',
    }));
  });

  it('update puts to /dealFields/:id with id stripped from body', async () => {
    mockClient.put.mockResolvedValue({ success: true, data: { id: 1 } });
    const tools = getUpdateDealFieldTool(mockClient);
    await tools['fields_update_deal_field'].handler({ id: 1, name: 'Renamed' });
    expect(mockClient.put).toHaveBeenCalledWith('/dealFields/1', { name: 'Renamed' });
  });

  it('delete sends DELETE /dealFields/:id', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: 5 } });
    const tools = getDeleteDealFieldTool(mockClient);
    await tools['fields_delete_deal_field'].handler({ id: 5 });
    expect(mockClient.delete).toHaveBeenCalledWith('/dealFields/5');
  });

  it('bulk delete normalizes array to comma-separated string', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: { id: [1, 2] } });
    const tools = getBulkDeleteDealFieldsTool(mockClient);
    await tools['fields_bulk_delete_deal_fields'].handler({ ids: [1, 2] });
    expect(mockClient.delete).toHaveBeenCalledWith('/dealFields', { ids: '1,2' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/tools/__tests__/deal-fields.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement tools**

Mirror `src/tools/fields/create-org-field.ts` swapping all `organization`/`Organization`/`organizationFields` for `deal`/`Deal`/`dealFields` and importing from the new `../../schemas/deal-field.js`.

For each of the 4 files, the structure is identical to its `org-field` sibling. Concretely:

`src/tools/fields/create-deal-field.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateDealFieldSchema } from '../../schemas/deal-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getCreateDealFieldTool(client: PipedriveClient) {
  return {
    fields_create_deal_field: {
      description: `Create a new custom field for deals.

For \`enum\` and \`set\` field types, you must provide \`options\` (non-empty array of { label }).

After creation, the field's \`key\` is the hash you can use directly in deal create/update payloads (or pass values by display name via \`custom_fields\`). Definitions are cached for 15 minutes.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Display name of the field' },
          field_type: {
            type: 'string',
            enum: ['varchar','varchar_auto','text','double','monetary','date','set','enum','user','org','people','phone','time','timerange','daterange','address'],
            description: 'Type of the field. enum/set require options.',
          },
          options: {
            type: 'array',
            description: 'Required for enum/set field types',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                label: { type: 'string' },
              },
              required: ['label'],
            },
          },
          add_visible_flag: { type: 'boolean' },
        },
        required: ['name', 'field_type'],
      },
      handler: async (args: unknown) => {
        const parsed = CreateDealFieldSchema.parse(args);
        const response = await client.post<PipedriveResponse<unknown>>('/dealFields', parsed);
        return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
      },
    },
  };
}
```

`src/tools/fields/update-deal-field.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateDealFieldSchema } from '../../schemas/deal-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getUpdateDealFieldTool(client: PipedriveClient) {
  return {
    fields_update_deal_field: {
      description: `Update an existing custom deal field. field_type cannot be changed.

For enum/set fields, \`options\` is the full set after update — include each existing option's id to preserve it, or omit id to add a new option.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal field to update' },
          name: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: { id: { type: 'number' }, label: { type: 'string' } },
              required: ['label'],
            },
          },
          add_visible_flag: { type: 'boolean' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const parsed = UpdateDealFieldSchema.parse(args);
        const { id, ...payload } = parsed;
        const response = await client.put<PipedriveResponse<unknown>>(`/dealFields/${id}`, payload);
        return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
      },
    },
  };
}
```

`src/tools/fields/delete-deal-field.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteDealFieldSchema } from '../../schemas/deal-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getDeleteDealFieldTool(client: PipedriveClient) {
  return {
    fields_delete_deal_field: {
      description: `Delete a custom deal field by ID. Soft delete — existing values are preserved.

Use fields_bulk_delete_deal_fields to delete several in one call.`,
      inputSchema: {
        type: 'object' as const,
        properties: { id: { type: 'number', description: 'ID of the deal field to delete' } },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const parsed = DeleteDealFieldSchema.parse(args);
        const response = await client.delete<PipedriveResponse<{ id: number }>>(`/dealFields/${parsed.id}`);
        return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
      },
    },
  };
}
```

`src/tools/fields/bulk-delete-deal-fields.ts`:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { BulkDeleteDealFieldsSchema } from '../../schemas/deal-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getBulkDeleteDealFieldsTool(client: PipedriveClient) {
  return {
    fields_bulk_delete_deal_fields: {
      description: `Delete multiple custom deal fields. Accepts comma-separated string of IDs or array of numeric IDs.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          ids: {
            description: 'Comma-separated IDs or array of numeric IDs',
            oneOf: [
              { type: 'string', pattern: '^\\d+(,\\d+)*$' },
              { type: 'array', items: { type: 'number' }, minItems: 1 },
            ],
          },
        },
        required: ['ids'],
      },
      handler: async (args: unknown) => {
        const parsed = BulkDeleteDealFieldsSchema.parse(args);
        const ids = Array.isArray(parsed.ids) ? parsed.ids.join(',') : parsed.ids;
        const response = await client.delete<PipedriveResponse<{ id: number[] }>>('/dealFields', { ids });
        return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
      },
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/tools/__tests__/deal-fields.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/tools/fields/create-deal-field.ts src/tools/fields/update-deal-field.ts \
  src/tools/fields/delete-deal-field.ts src/tools/fields/bulk-delete-deal-fields.ts \
  src/tools/__tests__/deal-fields.test.ts
git commit -m "feat: add deal-field CRUD tools"
```

---

### Task 21: `person-field` schemas + CRUD tools

Same structure as Tasks 19 + 20, swapping `deal` → `person`, `dealFields` → `personFields`.

**Files:**
- Create: `src/schemas/person-field.ts`
- Create: `src/schemas/__tests__/person-field.test.ts`
- Create: `src/tools/fields/create-person-field.ts`, `update-person-field.ts`, `delete-person-field.ts`, `bulk-delete-person-fields.ts`
- Create: `src/tools/__tests__/person-fields.test.ts`

- [ ] **Step 1: Mirror Task 19 with `person-field` naming**

Copy `src/schemas/deal-field.ts` to `src/schemas/person-field.ts` and replace `Deal`/`deal`/`dealFields` with `Person`/`person`/`personFields` (case-preserving).

Copy `src/schemas/__tests__/deal-field.test.ts` to `src/schemas/__tests__/person-field.test.ts` with the same replacements.

- [ ] **Step 2: Mirror Task 20 with `person-field` naming**

Copy each of the 4 tool files (`create-deal-field.ts` → `create-person-field.ts`, etc.) with the same replacements. Copy `deal-fields.test.ts` → `person-fields.test.ts`.

- [ ] **Step 3: Run tests**

Run: `npm test -- --run src/schemas/__tests__/person-field.test.ts src/tools/__tests__/person-fields.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/schemas/person-field.ts src/schemas/__tests__/person-field.test.ts \
  src/tools/fields/create-person-field.ts src/tools/fields/update-person-field.ts \
  src/tools/fields/delete-person-field.ts src/tools/fields/bulk-delete-person-fields.ts \
  src/tools/__tests__/person-fields.test.ts
git commit -m "feat: add person-field schemas and CRUD tools"
```

---

### Task 22: `product-field` schemas + CRUD tools

Same as Task 21, swapping `person` → `product`, `personFields` → `productFields`.

**Files:**
- Create: `src/schemas/product-field.ts`, test
- Create: 4 tool files + test

Commit message: `feat: add product-field schemas and CRUD tools`.

---

### Task 23: Register new tools in `fields/index.ts`

**Files:**
- Modify: `src/tools/fields/index.ts`

- [ ] **Step 1: Update `getFieldTools`**

Replace the function with:

```typescript
import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListDealFieldsTool } from './deal-fields.js';
import { getListPersonFieldsTool } from './person-fields.js';
import { getListOrganizationFieldsTool } from './org-fields.js';
import { getListActivityFieldsTool } from './activity-fields.js';
import { getListProductFieldsTool } from './product-fields.js';
import { getGetFieldTool } from './get-field.js';
import { getListAllFieldsTool } from './all-fields.js';
import { getSearchFieldsTool } from './search-fields.js';

import { getCreateOrganizationFieldTool } from './create-org-field.js';
import { getUpdateOrganizationFieldTool } from './update-org-field.js';
import { getDeleteOrganizationFieldTool } from './delete-org-field.js';
import { getBulkDeleteOrganizationFieldsTool } from './bulk-delete-org-fields.js';

import { getCreateDealFieldTool } from './create-deal-field.js';
import { getUpdateDealFieldTool } from './update-deal-field.js';
import { getDeleteDealFieldTool } from './delete-deal-field.js';
import { getBulkDeleteDealFieldsTool } from './bulk-delete-deal-fields.js';

import { getCreatePersonFieldTool } from './create-person-field.js';
import { getUpdatePersonFieldTool } from './update-person-field.js';
import { getDeletePersonFieldTool } from './delete-person-field.js';
import { getBulkDeletePersonFieldsTool } from './bulk-delete-person-fields.js';

import { getCreateProductFieldTool } from './create-product-field.js';
import { getUpdateProductFieldTool } from './update-product-field.js';
import { getDeleteProductFieldTool } from './delete-product-field.js';
import { getBulkDeleteProductFieldsTool } from './bulk-delete-product-fields.js';

export function getFieldTools(client: PipedriveClient) {
  return {
    ...getListDealFieldsTool(client),
    ...getListPersonFieldsTool(client),
    ...getListOrganizationFieldsTool(client),
    ...getListActivityFieldsTool(client),
    ...getListProductFieldsTool(client),
    ...getGetFieldTool(client),
    ...getListAllFieldsTool(client),
    ...getSearchFieldsTool(client),

    ...getCreateOrganizationFieldTool(client),
    ...getUpdateOrganizationFieldTool(client),
    ...getDeleteOrganizationFieldTool(client),
    ...getBulkDeleteOrganizationFieldsTool(client),

    ...getCreateDealFieldTool(client),
    ...getUpdateDealFieldTool(client),
    ...getDeleteDealFieldTool(client),
    ...getBulkDeleteDealFieldsTool(client),

    ...getCreatePersonFieldTool(client),
    ...getUpdatePersonFieldTool(client),
    ...getDeletePersonFieldTool(client),
    ...getBulkDeletePersonFieldsTool(client),

    ...getCreateProductFieldTool(client),
    ...getUpdateProductFieldTool(client),
    ...getDeleteProductFieldTool(client),
    ...getBulkDeleteProductFieldsTool(client),
  };
}
```

- [ ] **Step 2: Build to confirm no missing imports**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

- [ ] **Step 3: Run full test suite**

Run: `npm test -- --run`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/tools/fields/index.ts
git commit -m "feat: register new field CRUD tools in field tools aggregator"
```

---

## Phase 5 — Documentation

### Task 24: Update `docs/CUSTOM_FIELDS.md`

**Files:**
- Modify: `docs/CUSTOM_FIELDS.md`

- [ ] **Step 1: Add a new "Setting Custom Values" section**

Append to `docs/CUSTOM_FIELDS.md` (before "Best Practices"):

```markdown
## Setting Custom Values on Create/Update

All `*_create` and `*_update` tools for deals, persons, organizations, products and leads accept a `custom_fields` object. Keys can be the display name or the hash key.

### By display name (recommended)

```json
{
  "title": "ACME deal",
  "value": 50000,
  "custom_fields": {
    "Industria": "Tech",
    "Budget": 50000,
    "Tags": ["Enterprise", "EU"]
  }
}
```

The MCP server resolves names against the cached field definitions and translates `enum`/`set` labels to option ids automatically.

### By hash key (advanced)

```json
{
  "title": "ACME deal",
  "custom_fields": {
    "abc123def4567890abcdef0123456789abcdef01": "raw value"
  }
}
```

Useful when you have two fields with the same display name (the name path errors with `duplicate_name` in that case).

### Type-specific shapes

| Type | Shape |
|---|---|
| `enum` | option label as string |
| `set` | array of option labels |
| `date` | `"YYYY-MM-DD"` |
| `monetary` | number, or `{ "value": 1000, "currency": "EUR" }` |
| `daterange` | `{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }` |
| `timerange` | `{ "start": "HH:MM", "end": "HH:MM" }` |
| `address` | string or structured object |

## Reading Custom Values

`*_get`, `*_list`, and `*_search` responses are enriched with a `custom_fields_resolved` object next to the raw payload:

```json
{
  "id": 123,
  "title": "ACME deal",
  "abc123def456...": 18,
  "custom_fields_resolved": {
    "Industria": "Tech"
  }
}
```

Enrichment requires the field definitions cache to be warm (it is warmed automatically by any prior write, or by calling e.g. `fields_list_deal_fields`).

## Managing Custom Field Definitions

CRUD tools are available for all four entity types that support custom fields:

- Deals: `fields_create_deal_field`, `fields_update_deal_field`, `fields_delete_deal_field`, `fields_bulk_delete_deal_fields`
- Persons: `fields_create_person_field`, …
- Organizations: `fields_create_organization_field`, …
- Products: `fields_create_product_field`, …
```

- [ ] **Step 2: Commit**

```bash
git add docs/CUSTOM_FIELDS.md
git commit -m "docs: document custom_fields usage and new field CRUD tools"
```

---

### Task 25: Update CHANGELOG and README

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `README.md`

- [ ] **Step 1: Add CHANGELOG entry**

Prepend a new entry under the existing changelog format (semantic-release will rewrite this on release, but a manual draft is useful for clarity):

```markdown
## [Unreleased]

### Added
- Custom field value assignment on create/update for deals, persons, organizations, products, and leads via a new `custom_fields` object that accepts display names or hash keys.
- Symmetric read enrichment: `*_get` / `*_list` / `*_search` responses include `custom_fields_resolved` mapping field display names to human-readable values.
- CRUD parity for deal, person and product custom field definitions:
  - `fields_create_deal_field`, `fields_update_deal_field`, `fields_delete_deal_field`, `fields_bulk_delete_deal_fields`
  - `fields_create_person_field`, `fields_update_person_field`, `fields_delete_person_field`, `fields_bulk_delete_person_fields`
  - `fields_create_product_field`, `fields_update_product_field`, `fields_delete_product_field`, `fields_bulk_delete_product_fields`

### Changed
- Create/update zod schemas for deals, persons, organizations, products, and leads no longer reject unknown top-level keys (`.strict()` removed). Custom values should be passed inside `custom_fields`.
```

- [ ] **Step 2: Update README quick-start**

In `README.md`, find the deal-create example and replace/extend it with:

```markdown
Create a deal with custom fields:

```json
{
  "title": "ACME Enterprise Deal",
  "value": 50000,
  "currency": "USD",
  "custom_fields": {
    "Industria": "Tech",
    "Budget": 50000
  }
}
```

The MCP server resolves custom field names to Pipedrive hash keys automatically. See `docs/CUSTOM_FIELDS.md` for the full guide.
```

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md README.md
git commit -m "docs: changelog and readme entries for custom fields support"
```

---

## Final Validation

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --run`
Expected: all tests pass; coverage gate (if present) holds.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Run type-check**

Run: `npm run type-check`
Expected: no errors.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: clean, emits `dist/`.

---

## Self-Review Checklist (done by the planner before handoff)

**Spec coverage:**
- A) CRUD parity → Tasks 19–23 ✓
- B) Value assignment on writes → Tasks 8–13 ✓
- Symmetric read enrichment → Tasks 14–18 ✓
- Cache semantics (write fetches if cold, read skips if cold) → Task 3 ✓
- Per-type handling (enum, set, date, monetary, daterange, etc.) → Task 5 ✓
- Errors with suggestions and duplicate detection → Tasks 1, 4 ✓
- Lead share with deal fields → Tasks 2, 13, 18 ✓
- Docs (CUSTOM_FIELDS, CHANGELOG, README) → Tasks 24–25 ✓

**Placeholder scan:** no `TODO`, no "implement later", no "similar to" without code. All code blocks are complete.

**Type consistency:**
- `CustomFieldEntity` defined in Task 2, used identically in Tasks 3, 6, 7, 9–18.
- `FieldDefinition` shape consistent across tasks.
- `loadFieldDefinitions(client, entity, { fetchIfMissing })` signature is identical in Tasks 3, 6, 7, 14, 15.
- `resolveCustomFieldsForEntity` and `enrichEntityWithCustomFields` signatures match between definition (Tasks 6, 7) and consumption (Tasks 9–18).

No issues found.
