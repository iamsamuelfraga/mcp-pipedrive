import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateFilterSchema } from '../../schemas/filter.js';

export function getUpdateFilterTool(client: PipedriveClient) {
  return {
    'filters_update': {
      description: `Update an existing filter in Pipedrive.

Updates a filter's name and/or conditions. Only provide fields you want to change.

IMPORTANT LIMITATIONS:
- Only ONE first-level condition group is supported (must be glued with 'AND')
- Only TWO second-level condition groups are supported
- First second-level group must be glued with 'AND'
- Second second-level group must be glued with 'OR'
- Maximum of 16 conditions per filter

Workflow tips:
- Use filters/get to see current filter configuration before updating
- Use filters/helpers to discover available field IDs and operators
- Can update name only, conditions only, or both
- Common operators: =, !=, <, >, <=, >=, LIKE, IN, IS NULL, IS NOT NULL

Common use cases:
- Rename filter: { "id": 123, "name": "New Name" }
- Update conditions: { "id": 123, "conditions": {...} }
- Update both: { "id": 123, "name": "Updated", "conditions": {...} }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the filter to update (required)',
          },
          name: {
            type: 'string',
            description: 'New filter name (optional)',
          },
          conditions: {
            type: 'object',
            description: 'New filter conditions structure (optional)',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = UpdateFilterSchema.parse(args);
        const { id, ...updateData } = validated;

        return client.put(`/filters/${id}`, updateData);
      },
    },
  };
}
