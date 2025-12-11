import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateFileSchema } from '../../schemas/file.js';

export function getUpdateFileTool(client: PipedriveClient) {
  return {
    'files_update': {
      description: `Update file metadata (name or description).

Updates a file's name or description. Does not modify the actual file content.

Workflow tips:
- Can update file name (without extension) or description
- Name must not exceed 255 characters
- Description limited to 1000 characters
- At least one field (name or description) should be provided

Common use cases:
- Rename file: { "id": 123, "name": "Updated Contract" }
- Add description: { "id": 123, "description": "Q4 2024 sales contract" }
- Update both: { "id": 123, "name": "Contract V2", "description": "Updated terms" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the file to update' },
          name: { type: 'string', description: 'New name for the file (max 255 chars)' },
          description: { type: 'string', description: 'Description of the file (max 1000 chars)' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = UpdateFileSchema.parse(args);
        const { id, ...updateData } = validated;

        return client.put(`/files/${id}`, updateData);
      },
    },
  };
}
