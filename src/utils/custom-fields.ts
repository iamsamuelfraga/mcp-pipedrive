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
