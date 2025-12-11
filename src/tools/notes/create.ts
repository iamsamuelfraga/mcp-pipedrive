import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateNoteSchema } from '../../schemas/note.js';

export function getCreateNoteTool(client: PipedriveClient) {
  return {
    'notes_create': {
      description: `Create a new note and attach it to a deal, person, organization, or lead.

Creates a note with the specified content and associates it with one or more entities.

Workflow tips:
- content is required and supports HTML formatting
- At least one entity should be specified (implicitly via schemas)
- Set pinned flags to pin note to specific entities
- user_id sets the note creator (defaults to authenticated user)
- add_time can be specified for backdating notes
- Content supports rich text and can include formatting

Common use cases:
- Simple note: { "content": "Follow up next week", "deal_id": 123 }
- Pinned note: { "content": "Important info", "person_id": 456, "pinned_to_person_flag": true }
- Multi-entity note: { "content": "Meeting notes", "deal_id": 123, "person_id": 456 }
- Rich text note: { "content": "<b>Action items:</b><ul><li>Send proposal</li></ul>", "deal_id": 789 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          content: {
            type: 'string',
            description: 'Note content (required, supports HTML, max 65000 chars)',
          },
          deal_id: { type: 'number', description: 'ID of the deal to attach to' },
          person_id: { type: 'number', description: 'ID of the person to attach to' },
          org_id: { type: 'number', description: 'ID of the organization to attach to' },
          lead_id: { type: 'number', description: 'ID of the lead to attach to' },
          user_id: { type: 'number', description: 'ID of the user who created the note' },
          add_time: { type: 'string', description: 'Creation time in YYYY-MM-DD HH:MM:SS format' },
          pinned_to_deal_flag: { type: 'boolean', description: 'Pin note to deal' },
          pinned_to_person_flag: { type: 'boolean', description: 'Pin note to person' },
          pinned_to_organization_flag: { type: 'boolean', description: 'Pin note to organization' },
          pinned_to_lead_flag: { type: 'boolean', description: 'Pin note to lead' },
        },
        required: ['content'],
      },
      handler: async (args: unknown) => {
        const validated = CreateNoteSchema.parse(args);
        return client.post('/notes', validated);
      },
    },
  };
}
