import type { PipedriveClient } from '../../pipedrive-client.js';
import { AddNoteCommentSchema } from '../../schemas/note.js';

export function getAddNoteCommentTool(client: PipedriveClient) {
  return {
    'notes_add_comment': {
      description: `Add a new comment to a note.

Creates a comment on an existing note, allowing for threaded discussions.

Workflow tips:
- content is required
- Comments are added by the authenticated user
- Use this to create conversations around notes
- Comments help track discussions and decisions

Common use cases:
- Add feedback: { "id": 123, "content": "Agreed, let's proceed with this approach" }
- Ask questions: { "id": 456, "content": "Can we clarify the timeline?" }
- Provide updates: { "id": 789, "content": "Completed this action item" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the note to add comment to (required)' },
          content: { type: 'string', description: 'Content of the comment (required)' },
        },
        required: ['id', 'content'],
      },
      handler: async (args: unknown) => {
        const validated = AddNoteCommentSchema.parse(args);
        const { id, content } = validated;

        return client.post(`/notes/${id}/comments`, { content });
      },
    },
  };
}
