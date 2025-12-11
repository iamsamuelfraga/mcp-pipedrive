import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListPipelinesTool(client: PipedriveClient) {
  return {
    'pipelines_list': {
      description: `List all pipelines.

Returns all pipelines in the Pipedrive account, including their stages.

Workflow tips:
- Returns both active and inactive pipelines
- Each pipeline includes its stages
- Use this to get pipeline IDs for deal creation
- Check deal_probability setting to see if probability tracking is enabled
- order_nr indicates the display order in Pipedrive

Common use cases:
- Get all pipelines: {}
- Find pipeline ID for deal creation
- Check available stages in each pipeline
- Verify pipeline configuration`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async () => {
        return client.get(
          '/pipelines',
          {},
          { enabled: true, ttl: 600000 } // Cache for 10 minutes
        );
      },
    },
  };
}
