import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateStageSchema } from '../../schemas/stage.js';

export function getUpdateStageTool(client: PipedriveClient) {
  return {
    stages_update: {
      description: `Update an existing stage.

Provide only the fields you want to change. To reorder stages within a pipeline, update
the order_nr field.

Common use cases:
- Rename: { "id": 5, "name": "Closed Won" }
- Reorder: { "id": 5, "order_nr": 0 }
- Adjust rot rules: { "id": 5, "is_deal_rot_enabled": true, "days_to_rot": 14 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'Stage ID to update' },
          name: { type: 'string', description: 'New display name' },
          pipeline_id: { type: 'number', description: 'Move stage to a different pipeline' },
          order_nr: { type: 'number', description: 'New position in the pipeline' },
          deal_probability: { type: 'number', description: 'Default deal win probability 0-100' },
          is_deal_rot_enabled: { type: 'boolean' },
          days_to_rot: { type: 'number' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...body } = UpdateStageSchema.parse(args);
        return client.patch(`/api/v2/stages/${id}`, body);
      },
    },
  };
}
