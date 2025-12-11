import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateNoteSchema } from '../../schemas/note.js';

export function getUpdateNoteTool(client: PipedriveClient) {
  return {
    'notes_update': {
      description: `Update an existing note.

Updates note content, entity associations, or pinned status.

Workflow tips:
- All fields except id are optional
- Can update content (supports HTML)
- Can change entity associations
- Can pin/unpin to specific entities
- Content supports rich text formatting
- At least one field should be updated

Common use cases:
- Update content: { "id": 123, "content": "Updated information" }
- Pin to deal: { "id": 123, "pinned_to_deal_flag": true }
- Change association: { "id": 123, "person_id": 456 }
- Update and pin: { "id": 123, "content": "New content", "pinned_to_person_flag": true }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the note to update' },
          content: {
            type: 'string',
            description: 'New note content (supports HTML, max 65000 chars)',
          },
          deal_id: { type: 'number', description: 'New deal ID to attach to' },
          person_id: { type: 'number', description: 'New person ID to attach to' },
          org_id: { type: 'number', description: 'New organization ID to attach to' },
          lead_id: { type: 'number', description: 'New lead ID to attach to' },
          pinned_to_deal_flag: { type: 'boolean', description: 'Pin/unpin note to deal' },
          pinned_to_person_flag: { type: 'boolean', description: 'Pin/unpin note to person' },
          pinned_to_organization_flag: {
            type: 'boolean',
            description: 'Pin/unpin note to organization',
          },
          pinned_to_lead_flag: { type: 'boolean', description: 'Pin/unpin note to lead' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = UpdateNoteSchema.parse(args);
        const { id, ...updateData } = validated;

        return client.put(`/notes/${id}`, updateData);
      },
    },
  };
}
