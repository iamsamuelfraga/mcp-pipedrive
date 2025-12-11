import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListNoteCommentsSchema } from '../../schemas/note.js';

export function getListNoteCommentsTool(client: PipedriveClient) {
  return {
    'notes_list_comments': {
      description: `List all comments for a note with pagination options.

Returns a paginated list of comments associated with a specific note.

Workflow tips:
- Use start/limit for pagination (default limit: 100, max: 500)
- Comments are returned in chronological order
- Each comment includes author information and timestamps

Common use cases:
- Get all comments for a note: { "id": 123 }
- Paginated retrieval: { "id": 123, "start": 0, "limit": 50 }
- Review conversation history on a note`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the note to get comments for (required)' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = ListNoteCommentsSchema.parse(args);
        const { id, start, limit } = validated;

        return client.get(
          `/notes/${id}/comments`,
          {
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 60000 } // Cache for 1 minute
        );
      },
    },
  };
}
