import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateNoteCommentSchema } from '../../schemas/note.js';

export function getUpdateNoteCommentTool(client: PipedriveClient) {
  return {
    'notes/update_comment': {
      description: `Update an existing comment on a note.

Modifies the content of a specific comment on a note.

Workflow tips:
- Both note id and comment_id are required
- comment_id is a UUID, not a number
- Only the content can be updated
- Use notes/list_comments to find the comment_id

Common use cases:
- Fix typos: { "id": 123, "comment_id": "uuid-here", "content": "Corrected text" }
- Add details: { "id": 456, "comment_id": "uuid-here", "content": "Updated with more info" }
- Clarify response: { "id": 789, "comment_id": "uuid-here", "content": "Revised answer" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the note (required)' },
          comment_id: { type: 'string', description: 'UUID of the comment to update (required)' },
          content: { type: 'string', description: 'New content of the comment (required)' },
        },
        required: ['id', 'comment_id', 'content'],
      },
      handler: async (args: unknown) => {
        const validated = UpdateNoteCommentSchema.parse(args);
        const { id, comment_id, content } = validated;

        return client.put(`/notes/${id}/comments/${comment_id}`, { content });
      },
    },
  };
}
