import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdatePipelineSchema } from '../../schemas/pipeline.js';

export function getUpdatePipelineTool(client: PipedriveClient) {
  return {
    'pipelines_update': {
      description: `Update an existing pipeline.

Updates pipeline configuration including name, order, active status, and probability tracking.

Workflow tips:
- All fields except id are optional
- Use order_nr to reorder pipelines
- Set active=false to deactivate pipeline
- Changing deal_probability affects all stages
- At least one field should be updated

Common use cases:
- Rename pipeline: { "id": 1, "name": "New Sales Pipeline" }
- Deactivate pipeline: { "id": 1, "active": false }
- Reorder pipeline: { "id": 1, "order_nr": 5 }
- Update multiple fields: { "id": 1, "name": "Updated", "active": true, "order_nr": 1 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the pipeline to update' },
          name: { type: 'string', description: 'New pipeline name (max 255 chars)' },
          order_nr: { type: 'number', description: 'New order number' },
          active: { type: 'boolean', description: 'Whether pipeline is active' },
          deal_probability: { type: 'boolean', description: 'Enable/disable probability tracking' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = UpdatePipelineSchema.parse(args);
        const { id, ...updateData } = validated;

        return client.put(`/pipelines/${id}`, updateData);
      },
    },
  };
}
