import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetStageSchema } from '../../schemas/stage.js';

export function getGetStageTool(client: PipedriveClient) {
  return {
    stages_get: {
      description: `Get a specific stage by ID.

Returns the stage's full configuration: name, pipeline_id, order_nr, probability, rotting settings.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Stage ID' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetStageSchema.parse(args);
        return client.get(`/api/v2/stages/${id}`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
