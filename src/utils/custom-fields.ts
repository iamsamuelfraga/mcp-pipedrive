import type { PipedriveClient } from '../pipedrive-client.js';
import { CustomFieldResolutionError } from './custom-fields-errors.js';

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

interface PipedriveListResponse<T> {
  success: boolean;
  data: T[] | null;
}

const FIELD_DEFINITIONS_TTL_MS = 900_000; // 15 min, matches existing field tools

// Per-client tracker so the read path knows if the write path has ever
// warmed the cache for this entity. Cleared automatically when the client is GC'd.
const cachePresence = new WeakMap<PipedriveClient, Set<string>>();

/**
 * Loads field definitions for an entity.
 *
 * Two modes:
 * - fetchIfMissing=true (write path): always returns definitions, fetching once if cache cold.
 * - fetchIfMissing=false (read enrichment path): returns undefined if cache cold; never adds an HTTP call.
 *
 * Note: the underlying PipedriveClient cache doesn't expose a "peek" API, so we track
 * per-client which endpoints have been warmed in a WeakMap (auto-GC'd with the client).
 */
export async function loadFieldDefinitions(
  client: PipedriveClient,
  entity: CustomFieldEntity,
  opts: { fetchIfMissing?: boolean } = {}
): Promise<FieldDefinition[] | undefined> {
  const endpoint = getFieldDefinitionsEndpoint(entity);

  if (!opts.fetchIfMissing) {
    if (!cachePresence.get(client)?.has(endpoint)) {
      return undefined;
    }
  }

  const response = await client.get<PipedriveListResponse<FieldDefinition>>(
    endpoint,
    undefined,
    { enabled: true, ttl: FIELD_DEFINITIONS_TTL_MS }
  );

  let set = cachePresence.get(client);
  if (!set) {
    set = new Set();
    cachePresence.set(client, set);
  }
  set.add(endpoint);

  return response.data ?? [];
}

/**
 * Locate a field definition by name (case-insensitive, trimmed) or hash key.
 * - Hash key matching an existing definition: returns that definition.
 * - Hash key not in definitions: returns a synthetic definition with field_type='unknown'
 *   (skips type validation downstream — caller is trusted).
 * - Exact case-insensitive name match: returns the definition.
 * - Multiple name matches: throws CustomFieldResolutionError(duplicate_name) with all hashes.
 * - No match: throws CustomFieldResolutionError(not_found) with up to 3 Levenshtein suggestions.
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
