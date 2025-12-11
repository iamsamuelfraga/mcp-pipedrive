import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteFileSchema } from '../../schemas/file.js';

export function getDeleteFileTool(client: PipedriveClient) {
  return {
    'files_delete': {
      description: `Delete a file from Pipedrive.

Permanently removes a file and its associations with entities.

Workflow tips:
- Deleting a file removes it from all associated entities
- This action cannot be undone
- Consider using files_get first to verify the file
- Deleted files may still appear in lists if include_deleted_files=true

Common use cases:
- Remove file: { "id": 123 }
- Clean up old attachments
- Remove duplicate files`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the file to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteFileSchema.parse(args);
        return client.delete(`/files/${validated.id}`);
      },
    },
  };
}
