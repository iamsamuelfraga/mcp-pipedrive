import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListStagesSchema } from '../../schemas/stage.js';

export function getListStagesTool(client: PipedriveClient) {
  return {
    stages_list: {
      description: `List all pipeline stages across the workspace.

Optionally filter by pipeline_id to scope to a single pipeline. Returns the canonical
stage collection via API v2.

Cached for 5 minutes.

Common use cases:
- List all stages: {}
- List stages of a pipeline: { "pipeline_id": 3 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          pipeline_id: {
            type: 'number',
            description: 'Optional pipeline ID filter',
          },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListStagesSchema.parse(args);
        const params: Record<string, number> = {};
        if (validated.pipeline_id !== undefined) params.pipeline_id = validated.pipeline_id;
        return client.get('/api/v2/stages', params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
