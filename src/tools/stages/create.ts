import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateStageSchema } from '../../schemas/stage.js';

export function getCreateStageTool(client: PipedriveClient) {
  return {
    stages_create: {
      description: `Create a new pipeline stage.

Required: name + pipeline_id. Optional: order_nr (position in pipeline), deal_probability
(0-100), is_deal_rot_enabled + days_to_rot for rotting deals.

Common use cases:
- Basic stage: { "name": "Qualified", "pipeline_id": 1 }
- With probability and rot: { "name": "Negotiation", "pipeline_id": 1, "deal_probability": 75, "is_deal_rot_enabled": true, "days_to_rot": 30 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Display name (required)' },
          pipeline_id: { type: 'number', description: 'Pipeline this stage belongs to (required)' },
          order_nr: { type: 'number', description: 'Position in the pipeline' },
          deal_probability: { type: 'number', description: 'Default deal win probability 0-100' },
          is_deal_rot_enabled: {
            type: 'boolean',
            description: 'Whether deals can rot in this stage',
          },
          days_to_rot: {
            type: 'number',
            description: 'Days before a deal rots (requires is_deal_rot_enabled)',
          },
        },
        required: ['name', 'pipeline_id'],
      },
      handler: async (args: unknown) => {
        const validated = CreateStageSchema.parse(args);
        return client.post('/api/v2/stages', validated);
      },
    },
  };
}
