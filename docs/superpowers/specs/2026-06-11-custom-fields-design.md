# Custom Fields Support — Design

**Date**: 2026-06-11
**Author**: Samuel Fraga (assisted)
**Status**: Approved
**Scope**: `@iamsamuelfraga/mcp-pipedrive`

## Goal

Make the MCP server fully usable for any Pipedrive workspace that uses custom fields. Today the server can discover custom field definitions but cannot:

1. Assign values to custom fields when creating/updating deals, persons, organizations, products, or leads (the zod schemas are `.strict()` and reject hash-keyed properties).
2. Manage custom field definitions for entities other than Organization (only `organization_field` has CRUD; deal/person/product fields don't).

Both gaps block real LLM workflows like "create a deal for client X with industry Tech and budget €50k".

## Non-Goals

- Custom fields for Activities, Notes, or Files — not supported by Pipedrive API.
- Fuzzy auto-correct (typo → silent match). Errors are always explicit.
- Persistent disk cache for field definitions — in-memory 15 min is sufficient.
- A standalone `fields_resolve_name` tool — resolution happens inline inside create/update flows.

## Design Overview

Two coordinated bodies of work:

### A) CRUD for custom field definitions (parity with organization fields)

Add the following MCP tools, mirroring the structure that already exists for organization fields:

| Entity | Tools |
|---|---|
| Deal | `fields_create_deal_field`, `fields_update_deal_field`, `fields_delete_deal_field`, `fields_bulk_delete_deal_fields` |
| Person | `fields_create_person_field`, `fields_update_person_field`, `fields_delete_person_field`, `fields_bulk_delete_person_fields` |
| Product | `fields_create_product_field`, `fields_update_product_field`, `fields_delete_product_field`, `fields_bulk_delete_product_fields` |

Lead does **not** get its own field CRUD tools — Pipedrive leads share the deal field schema.

API endpoints:
- Deal: `POST/PUT/DELETE /dealFields`
- Person: `POST/PUT/DELETE /personFields`
- Product: `POST/PUT/DELETE /productFields`

Each tool invalidates the relevant entry of the field-definitions cache on success (same pattern as `create_organization_field`).

### B) Value assignment + symmetric read on create/update

Allow create/update tools for deals, persons, organizations, products, and leads to accept a `custom_fields` object keyed by **either**:

- the field's display name ("Industria"), case-insensitive, trimmed, or
- the field's hash key ("abc123def456…"), 40-char hex, passed through unresolved.

On read (`*_get`, `*_list`, `*_search`), each entity's response is enriched with a `custom_fields_resolved` object mapping display name → human-friendly value, alongside the raw Pipedrive payload (which is preserved untouched).

## Architecture

### New module: `src/utils/custom-fields.ts`

Public surface:

```ts
// Pipedrive leads share custom field definitions with deals — no separate "leadFields" endpoint.
// The Lead entity resolves against deal definitions internally.
type Entity = 'deal' | 'person' | 'organization' | 'product' | 'lead';

interface ResolveResult {
  // Hash-key → value, ready to merge into the Pipedrive request body.
  resolved: Record<string, unknown>;
}

// Translates { "Industria": "Tech" } → { "abc123def456": 18 } using cached field defs.
// Throws CustomFieldResolutionError on duplicates / not-found / invalid value.
function resolveCustomFieldsForEntity(
  client: PipedriveClient,
  entity: Entity,
  customFields: Record<string, unknown> | undefined
): Promise<ResolveResult>;

// Inverse: given a Pipedrive entity payload, returns { "Industria": "Tech" }
// for every hash-keyed property that maps to a known custom field definition.
function buildResolvedCustomFields(
  client: PipedriveClient,
  entity: Entity,
  rawData: Record<string, unknown>
): Promise<Record<string, unknown>>;

// Per-type validation. Throws CustomFieldValidationError with a clear message.
function validateCustomFieldValue(
  definition: FieldDefinition,
  value: unknown
): void;
```

### Errors

A new error class `CustomFieldResolutionError extends Error` carries:

- `kind`: `'not_found' | 'duplicate_name' | 'invalid_value' | 'invalid_option'`
- `fieldName`: the input the LLM provided
- `suggestions`: up to 3 closest matches by Levenshtein distance (for `not_found`)
- `candidates`: list of hash keys (for `duplicate_name`)

The error is caught at the tool handler boundary and surfaced as MCP error content.

### Cache reuse

`pipedrive-client.ts` already caches field definitions for 15 minutes. The new module reads from that same cache and never bypasses it. Write tools call the existing invalidation method after success.

## Resolution rules (B)

1. Normalize input keys: trim, lowercase. Build an index `lowerName → definition` for the entity.
2. If the input key looks like a 40-char hex hash, pass through unresolved.
3. If multiple definitions share the same lowercased name, raise `duplicate_name` with all candidate hashes — the LLM must disambiguate via hash.
4. If no match, raise `not_found` with top-3 suggestions by Levenshtein distance over display names.
5. Otherwise, validate the value against the definition's `field_type` (see below) and translate to the wire format Pipedrive expects.

## Per-type handling

| `field_type` | LLM-friendly input | Wire format sent to Pipedrive |
|---|---|---|
| `varchar`, `varchar_auto`, `text` | string | string |
| `double` | number | number |
| `monetary` | number OR `{ value, currency }` | number (currency uses entity default) or `{ value, currency }` |
| `date` | `YYYY-MM-DD` (validated) | same |
| `time` | `HH:MM` or `HH:MM:SS` (validated) | same |
| `daterange` | `{ start, end }` (both `YYYY-MM-DD`) | expanded to `<hash>: start` + `<hash>_until: end` |
| `timerange` | `{ start, end }` | same pattern with `_until` |
| `enum` | string label | numeric option id resolved from definition's `options[]` |
| `set` | array of string labels | comma-separated string of numeric option ids (Pipedrive convention) |
| `user`, `org`, `people` | numeric id | numeric id |
| `phone` | string | string |
| `address` | string OR structured `{ value, country, locality, ... }` | same |

Unknown option labels in `enum`/`set` raise `invalid_option` with the list of valid labels.

## Schemas touched (B)

Remove `.strict()` and add `custom_fields: z.record(z.unknown()).optional()` on:

- `CreateDealSchema`, `UpdateDealSchema`
- `CreatePersonSchema`, `UpdatePersonSchema`
- `CreateOrganizationSchema`, `UpdateOrganizationSchema`
- `CreateProductSchema`, `UpdateProductSchema`
- `CreateLeadSchema`, `UpdateLeadSchema`

Tool handlers call `resolveCustomFieldsForEntity` before invoking `client.post/put` and merge the resolved hash-keyed payload into the request body. The `custom_fields` field itself is stripped from the outgoing request.

## Symmetric read enrichment

In get/list/search handlers for the same five entities, wrap the response so that each entity in the payload gains a `custom_fields_resolved` property next to the raw fields. The raw hash-keyed properties are **preserved** (non-destructive).

Example:
```json
{
  "id": 123,
  "title": "Deal X",
  "abc123def456...": 18,
  "custom_fields_resolved": { "Industria": "Tech" }
}
```

Cache behavior differs between write and read paths:

- **Write path (create/update)**: resolution is mandatory. If the cache is cold, we fetch the field definitions once (one HTTP call) and proceed. This is a known, bounded cost on the first write of a 15-min window.
- **Read path (get/list/search)**: enrichment is opportunistic. If the cache is warm, we enrich; if cold, we skip enrichment and return the raw payload only — we never add an HTTP call to a read just for cosmetic naming. Subsequent calls in the same window get enrichment for free.

## Documentation updates

- `docs/CUSTOM_FIELDS.md`: extend with sections "Setting custom values via `custom_fields`" and "Reading custom values via `custom_fields_resolved`".
- `CHANGELOG.md`: entry under next minor version.
- README: add custom_fields usage to the quick-start example for `deals_create`.

## Testing strategy

Unit tests:
- `resolveCustomFieldsForEntity`: exact name, case-insensitive, trimmed, not-found-with-suggestions, duplicate-name-raises, hash passthrough, enum-by-label, set-by-label-array, daterange expansion, monetary number vs object, address string vs object.
- `validateCustomFieldValue`: one test per `field_type`, covering valid and invalid inputs.
- `buildResolvedCustomFields`: round-trip — write with names, read back via enrichment, assert names match.

Integration tests (with mocked Pipedrive client):
- `deals_create` with `custom_fields` of every supported type.
- `deals_update` overwriting a custom field.
- `persons_create` with `custom_fields`.
- `organizations_create` with `custom_fields`.
- Each new CRUD tool (`create/update/delete/bulk_delete` for deal, person, product fields) — happy path + cache invalidation assertion.

Coverage target: maintain the project's existing 100% coverage gate.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Two custom fields with the same display name silently get the wrong value | Hard error `duplicate_name` with candidate hashes; never guess. |
| LLM mistypes a field name and gets opaque Pipedrive error | We validate before calling and return suggestions. |
| Breaking change for consumers parsing strict schemas | Adding an optional `custom_fields` field is additive; removing `.strict()` only affects rejection behavior of *new* properties. Existing callers are unaffected. |
| Enrichment slows down list endpoints | Enrichment uses the in-memory cache; no extra HTTP roundtrips during a list call. Cache miss → skip enrichment for that call (raw still returned). |
| Currency mismatch on monetary fields | If `custom_fields["X"]` is a number and the deal has no currency, Pipedrive defaults apply. Document this; allow `{ value, currency }` explicit form. |

## Open questions

None — all decisions taken in the brainstorming session above.

## Out of scope (for explicit YAGNI)

- Bulk update of custom field values across multiple entities in a single call.
- Custom-field-based filters in `*_list` calls (Pipedrive's existing filter API is unchanged; this would be a separate feature).
- Migration helpers (copy values between fields).
