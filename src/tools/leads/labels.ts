import type { PipedriveClient } from '../../pipedrive-client.js';

export function getLeadLabelsTool(client: PipedriveClient) {
  return {
    'leads/get_labels': {
      description: `Get all lead labels (tags/categories).

Returns details of all lead labels available in your Pipedrive account.
Lead labels are used to categorize and organize leads.

Workflow tips:
- This endpoint does not support pagination (all labels returned)
- Labels have UUIDs as identifiers
- Use label UUIDs when creating/updating leads
- Labels have name and color properties
- Results are heavily cached (24 hours) as labels change infrequently

Common use cases:
- List all labels: {}
- Get label IDs for lead creation
- Display available labels to users

Response format:
- Returns array of label objects with: id (UUID), name, color, add_time, update_time`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async () => {
        return client.get(
          '/leadLabels',
          {},
          { enabled: true, ttl: 86400000 } // Cache for 24 hours (labels rarely change)
        );
      },
    },
  };
}
