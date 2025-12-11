import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPipelineSchema } from '../../schemas/pipeline.js';

export function getGetPipelineTool(client: PipedriveClient) {
  return {
    'pipelines_get': {
      description: `Get detailed information about a specific pipeline.

Returns pipeline details including all its stages and deal statistics.

Workflow tips:
- Returns pipeline configuration and all stages
- Includes deal totals and conversion statistics
- Use totals_convert_currency to convert deal values to specific currency
- Shows stage order and probabilities
- Includes rotten deal settings per stage

Common use cases:
- Get pipeline details: { "id": 1 }
- Get pipeline with USD totals: { "id": 1, "totals_convert_currency": "USD" }
- Check stage configuration
- Analyze pipeline performance`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the pipeline to retrieve' },
          totals_convert_currency: {
            type: 'string',
            description: '3-letter currency code to convert totals to (e.g., USD, EUR)',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetPipelineSchema.parse(args);
        const { id, ...params } = validated;

        return client.get(
          `/pipelines/${id}`,
          params,
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },
  };
}
