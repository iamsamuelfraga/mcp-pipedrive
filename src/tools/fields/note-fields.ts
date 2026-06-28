import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListNoteFieldsTool(client: PipedriveClient) {
  return {
    fields_list_note_fields: {
      description: `Get all field definitions available for notes.

Read-only — note fields are predefined by Pipedrive and cannot be created, updated, or
deleted via the API.

Cached for 15 minutes as field definitions rarely change.

Common use cases:
- Discover the structure of note objects
- Find field keys for note payloads`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/noteFields', undefined, {
          enabled: true,
          ttl: 900000, // 15 minutes
        });
      },
    },
  };
}
