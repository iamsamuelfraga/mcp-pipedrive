import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetNoteSchema } from '../../schemas/note.js';

export function getGetNoteTool(client: PipedriveClient) {
  return {
    'notes/get': {
      description: `Get detailed information about a specific note.

Returns note content and metadata including creator, timestamps, and associated entities.

Workflow tips:
- Returns full note content (may include HTML)
- Shows all entities the note is attached to
- Includes creator and last editor information
- Shows pinned status for each entity type
- Useful for retrieving note before updating

Common use cases:
- Get note details: { "id": 123 }
- Verify note content before editing
- Check which entities note is attached to
- View note creator and timestamps`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the note to retrieve' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetNoteSchema.parse(args);
        return client.get(
          `/notes/${validated.id}`,
          {},
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },
  };
}
