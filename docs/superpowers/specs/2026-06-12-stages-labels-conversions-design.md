# Stages CRUD + Lead Labels CRUD + Lead/Deal Conversions — Design

**Date**: 2026-06-12
**Author**: Samuel Fraga (assisted)
**Status**: Approved
**Scope**: `@iamsamuelfraga/mcp-pipedrive`

## Goal

Close known gaps in the Pipedrive MCP server's API coverage:

1. **Stages CRUD** — currently exposed only as a list nested inside `pipelines_get_stages`. Add standalone CRUD on individual stages so users can create, update, delete and reorder them.
2. **Lead Labels CRUD** — currently only `leads_get_labels` (list). Add create/update/delete so users can manage the label taxonomy from the LLM.
3. **Lead ↔ Deal conversions** — Pipedrive's v2 API exposes asynchronous conversion endpoints in both directions. Expose them so an LLM can convert qualified leads to deals (and the reverse) without manual data migration.

## Non-Goals

- **Deal Labels CRUD** — Pipedrive has no dedicated `/dealLabels` endpoint. Deal labels are stored as options of a deal field of type `enum`/`set`, manageable via the existing `fields_create_deal_field` / `fields_update_deal_field` tools. No new tool needed.
- **Deal restore (unarchive)** — Pipedrive's API does not expose a restore endpoint. Recovery is UI-only within 30 days. Out of scope.
- **Stages reorder as a dedicated tool** — Pipedrive supports reordering via the `order_nr` field on `PATCH /api/v2/stages/{id}`. The standard `stages_update` covers this; no extra tool needed.
- **Bulk operations on stages or lead labels** — Pipedrive's API has no bulk endpoints for these resources.

## Design Overview

Two structural changes to the HTTP client, plus 11 new tools.

### 1. `PipedriveClient` — support API v2

Currently `baseUrl = 'https://api.pipedrive.com/v1'` is hardcoded; every request prepends it to the endpoint path. The new approach: **detect** whether an endpoint is v1 (relative path like `/deals`) or v2 (absolute prefix like `/api/v2/stages`) and route accordingly.

```typescript
private resolveUrl(endpoint: string): string {
  return endpoint.startsWith('/api/v2/')
    ? `https://api.pipedrive.com${endpoint}`
    : `${this.baseUrl}${endpoint}`;
}
```

`request()` and `uploadFile()` both call this helper. **Retro-compatible**: every existing call passes a v1-style relative path and continues to work unchanged.

#### Cache invalidation update

`invalidateCachePattern(endpoint)` currently extracts the resource as `endpoint.split('/')[1]`. For `/api/v2/stages` that returns `"api"` — wrong. Fix by stripping the v2 prefix:

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

The regex tolerates both v1 (`GET:/deals/...`) and v2 (`GET:/api/v2/stages/...`) cache keys for the same resource family. A POST to `/api/v2/stages` invalidates GETs against `/api/v2/stages` and any future GETs against `/stages` if introduced; collisions are negligible since v1 doesn't have a separate `/stages` collection.

### 2. New `patch()` method on `PipedriveClient`

Stages and Lead Labels use **HTTP PATCH** for partial update. The client currently only exposes `get`, `post`, `put`, `delete`. Add `patch()` with the same shape as `put()`:

```typescript
async patch<T>(
  endpoint: string,
  body?: unknown,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const result = await this.request<T>('PATCH', endpoint, body, params);
  this.invalidateCachePattern(endpoint);
  return result;
}
```

Reuses the existing `request()` plumbing (rate limiter, retry, logging, metrics). The mock client (`src/__tests__/mocks/client.mock.ts`) gets a `patch: vi.fn()` entry.

### 3. New tools (11 total)

#### Stages — `src/tools/stages/` (new folder)

| Tool | Method | Endpoint |
|---|---|---|
| `stages_list` | GET | `/api/v2/stages?pipeline_id={id}` (optional filter) |
| `stages_get` | GET | `/api/v2/stages/{id}` |
| `stages_create` | POST | `/api/v2/stages` |
| `stages_update` | PATCH | `/api/v2/stages/{id}` |
| `stages_delete` | DELETE | `/api/v2/stages/{id}` |

The schema lives in a new `src/schemas/stage.ts` with `StageCreate`, `StageUpdate`, etc. Fields: `name`, `pipeline_id`, `order_nr`, `deal_probability`, `is_deal_rot_enabled`, `days_to_rot`.

The existing `pipelines_get_stages` is **kept unchanged** as a discovery convenience (list stages of a specific pipeline via v1). The new `stages_list` is the canonical full-collection access via v2 and supports an optional `pipeline_id` filter. Both coexist; no deprecation.

#### Lead Labels — `src/tools/leads/labels.ts` (new file)

| Tool | Method | Endpoint |
|---|---|---|
| `lead_labels_create` | POST | `/leadLabels` |
| `lead_labels_update` | PATCH | `/leadLabels/{id}` |
| `lead_labels_delete` | DELETE | `/leadLabels/{id}` |

The existing `leads_get_labels` (list) stays. Schema lives in a new `src/schemas/lead-label.ts`. Fields: `name`, `color` (Pipedrive enum: `blue`, `brown`, `dark-gray`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `yellow`).

#### Conversions — `src/tools/leads/convert.ts` and `src/tools/deals/convert.ts` (new files)

| Tool | Method | Endpoint |
|---|---|---|
| `leads_convert_to_deal` | POST | `/api/v2/leads/{id}/convert/deal` |
| `leads_convert_status` | GET | `/api/v2/leads/{id}/convert/status/{conversion_id}` |
| `deals_convert_to_lead` | POST | `/api/v2/deals/{id}/convert/lead` |
| `deals_convert_status` | GET | `/api/v2/deals/{id}/convert/status/{conversion_id}` |

These conversions are **asynchronous**. The POST returns `{ data: { id: conversion_id, status: 'queued' | 'running', ... } }`. The status endpoint accepts that `conversion_id` (extracted by the LLM from the POST response) as a path segment and reports progress + the resulting entity ID once complete (`status: 'completed'` with `deal_id` or `lead_id`).

Tool descriptions explicitly document the two-step flow so the LLM knows to poll. POST tools return the `conversion_id` plainly; status tools return either an in-progress status or the resulting `deal_id` / `lead_id`.

The two POST/status tool pairs share semantics but live in their respective entity folders for discoverability.

## File Structure

**New files:**
- `src/schemas/stage.ts` + tests
- `src/schemas/lead-label.ts` + tests
- `src/tools/stages/{create,get,list,update,delete,index}.ts` + tests
- `src/tools/leads/labels.ts` (3 tools in one file — small file, single concern) + tests
- `src/tools/leads/convert.ts` (2 tools) + tests
- `src/tools/deals/convert.ts` (2 tools) + tests

**Modified files:**
- `src/pipedrive-client.ts` — `resolveUrl()`, `patch()` method, updated `invalidateCachePattern()`
- `src/__tests__/mocks/client.mock.ts` — add `patch: vi.fn()`
- `src/tools/leads/index.ts` — register new labels + convert tools
- `src/tools/deals/index.ts` — register new convert tools
- `src/index.ts` or `src/server.ts` (wherever the tool aggregator lives) — register new stages tool group
- `docs/CUSTOM_FIELDS.md` — no change
- `README.md` and `CHANGELOG.md` — new entries

## Errors / Edge Cases

- **`stages_delete`**: returns 200 with `{ data: { id } }`. The new tool surfaces this directly.
- **Lead → Deal conversion of an already-archived lead**: Pipedrive returns 4xx. The tool descriptions warn against this; no special pre-validation in the MCP.
- **Polling**: the tool descriptions tell the LLM to poll `*_convert_status` "every few seconds" until `status === 'completed'`. We do not implement client-side polling — the LLM (or downstream caller) drives it.
- **PATCH on non-existent stage / lead label**: Pipedrive returns 404. The existing `withRetry` + error handler logic surfaces a clean error message.

## Testing strategy

- Unit tests for the schema validators (one per new schema).
- Tool-level tests with the existing mock client pattern:
  - `stages_create/get/update/delete/list` — verify the right URL and HTTP verb (including PATCH).
  - `lead_labels_create/update/delete` — same pattern.
  - `leads_convert_to_deal` + `leads_convert_status` — verify URL pattern with `{conversion_id}` interpolation; mock responses for queued/completed states.
  - Mirror for the deal → lead direction.
- One regression test on `pipedrive-client.ts` `resolveUrl()` confirming:
  - `/deals` → `https://api.pipedrive.com/v1/deals`
  - `/api/v2/stages` → `https://api.pipedrive.com/api/v2/stages`
- One regression test on the updated `invalidateCachePattern` confirming `/api/v2/stages` invalidates the correct cache entries and does not accidentally invalidate `/v1/...` entries.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| v2 endpoints have a different response envelope than v1 | Pipedrive's v2 also uses `{ success, data, additional_data }`. Verified by inspecting documented response shapes for `/api/v2/stages` and `/api/v2/leads/.../convert/deal`. |
| `invalidateCachePattern` change accidentally invalidates more than intended | The regex `^GET:/(api/v2/)?<resource>` requires a path-segment match. A test pins the behavior. |
| Conversion endpoints may take seconds-to-minutes to complete | Tool descriptions explicitly state the two-step async flow. The LLM is told to poll. |
| `patch` requires updating the mock client; existing tests don't break because nothing uses `mockClient.patch` yet | New tests explicitly use it; old tests are unchanged. |
| Breaking the 959 existing tests when we touch `pipedrive-client.ts` | `resolveUrl()` is a thin extraction; we run the full suite before *and* after the client change as the first task of the plan. |

## Open questions

None — all decisions taken.

## Out of scope (explicit YAGNI)

- Client-side polling helpers for conversion status — the LLM polls.
- Caching of conversion status — short-lived state, not worth caching.
- Bulk stage operations or label operations — not exposed by Pipedrive.
- Migrating `pipelines_get_stages` to v2 internally — it works via v1 and changing it is unrelated to this scope.
