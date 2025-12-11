import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteNoteSchema } from '../../schemas/note.js';

export function getDeleteNoteTool(client: PipedriveClient) {
  return {
    'notes/delete': {
      description: `Delete a note from Pipedrive.

Permanently removes a note from all associated entities.

Workflow tips:
- This action cannot be undone
- Note is removed from all associated entities
- Consider using notes/get first to verify the note
- Deleted notes cannot be recovered

Common use cases:
- Remove note: { "id": 123 }
- Clean up old notes
- Remove duplicate or incorrect notes`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the note to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteNoteSchema.parse(args);
        return client.delete(`/notes/${validated.id}`);
      },
    },
  };
}
