import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeletePipelineSchema } from '../../schemas/pipeline.js';

export function getDeletePipelineTool(client: PipedriveClient) {
  return {
    'pipelines_delete': {
      description: `Delete a pipeline.

Permanently removes a pipeline and all its stages.

Workflow tips:
- This action cannot be undone
- Deals in this pipeline will need to be moved first
- Consider deactivating instead of deleting
- All stages in the pipeline will be deleted
- Use pipelines_get first to verify

Common use cases:
- Remove pipeline: { "id": 1 }
- Clean up unused pipelines
- Remove test pipelines`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the pipeline to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DeletePipelineSchema.parse(args);
        return client.delete(`/pipelines/${validated.id}`);
      },
    },
  };
}
