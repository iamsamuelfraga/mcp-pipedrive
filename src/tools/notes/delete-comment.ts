import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteNoteCommentSchema } from '../../schemas/note.js';

export function getDeleteNoteCommentTool(client: PipedriveClient) {
  return {
    'notes/delete_comment': {
      description: `Delete a comment from a note.

Permanently removes a comment from a note.

Workflow tips:
- This action cannot be undone
- Both note id and comment_id are required
- comment_id is a UUID, not a number
- Use notes/list_comments to find the comment_id
- Deleted comments cannot be recovered

Common use cases:
- Remove comment: { "id": 123, "comment_id": "uuid-here" }
- Clean up inappropriate comments
- Remove duplicate or incorrect comments`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the note (required)' },
          comment_id: { type: 'string', description: 'UUID of the comment to delete (required)' },
        },
        required: ['id', 'comment_id'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteNoteCommentSchema.parse(args);
        const { id, comment_id } = validated;

        return client.delete(`/notes/${id}/comments/${comment_id}`);
      },
    },
  };
}
