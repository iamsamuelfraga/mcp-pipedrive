import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreatePipelineSchema } from '../../schemas/pipeline.js';

export function getCreatePipelineTool(client: PipedriveClient) {
  return {
    'pipelines_create': {
      description: `Create a new pipeline.

Creates a new pipeline with the specified name and configuration.

Workflow tips:
- Only name is required
- Set order_nr to control display order (lower numbers first)
- active=false to create inactive pipeline
- deal_probability=true enables probability tracking (default)
- New pipelines start with no stages - add stages separately

Common use cases:
- Simple pipeline: { "name": "Sales Pipeline" }
- Inactive pipeline: { "name": "Archive", "active": false }
- Ordered pipeline: { "name": "Q1 Pipeline", "order_nr": 1 }
- Full config: { "name": "Enterprise Sales", "order_nr": 2, "active": true, "deal_probability": true }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Pipeline name (required, max 255 chars)' },
          order_nr: { type: 'number', description: 'Order number for display' },
          active: { type: 'boolean', description: 'Whether pipeline is active', default: true },
          deal_probability: {
            type: 'boolean',
            description: 'Enable deal probability tracking',
            default: true,
          },
        },
        required: ['name'],
      },
      handler: async (args: unknown) => {
        const validated = CreatePipelineSchema.parse(args);
        return client.post('/pipelines', validated);
      },
    },
  };
}
