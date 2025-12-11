import type { PipedriveClient } from '../../pipedrive-client.js';

export function getLeadSourcesTool(client: PipedriveClient) {
  return {
    'leads_get_sources': {
      description: `Get all lead sources (where leads came from).

Returns all lead sources available in Pipedrive. Lead sources indicate where your leads originated.

Lead sources are pre-defined and cannot be modified. All leads created through the Pipedrive API
will automatically have lead source "API" assigned.

Available lead sources:
- Manually created
- Deal
- Web forms
- Prospector
- Leadbooster (includes Chatbot leads)
- Live chat
- Import
- Website visitors
- Workflow automation
- API

Workflow tips:
- Lead sources are fixed and cannot be edited
- This list may expand as new sources are added
- Results are heavily cached (24 hours) as sources rarely change
- Use for reference and reporting purposes

Common use cases:
- List all sources: {}
- Get source information for reports
- Display available sources to users`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async () => {
        return client.get(
          '/leadSources',
          {},
          { enabled: true, ttl: 86400000 } // Cache for 24 hours (sources are fixed)
        );
      },
    },
  };
}
