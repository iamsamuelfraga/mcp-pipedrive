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
