import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteStageSchema } from '../../schemas/stage.js';

export function getDeleteStageTool(client: PipedriveClient) {
  return {
    stages_delete: {
      description: `Delete a stage by ID.

This is a soft delete. Existing deals in the stage are NOT cascaded — they remain pointing
to the deleted stage's ID until they are moved.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Stage ID to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteStageSchema.parse(args);
        return client.delete(`/api/v2/stages/${id}`);
      },
    },
  };
}
