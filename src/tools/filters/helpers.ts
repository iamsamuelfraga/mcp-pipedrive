import type { PipedriveClient } from '../../pipedrive-client.js';

export function getFilterHelpersTool(client: PipedriveClient) {
  return {
    'filters_helpers': {
      description: `Get all available filter helpers and field types.

Returns comprehensive information about what conditions and helpers are available for creating/updating filters.

This tool helps you understand:
- What field IDs are available for each object type
- What operators can be used with each field
- Field data types (text, number, date, etc.)
- Available options for enum/select fields
- Helper types for building filter UIs

Workflow tips:
- Use this BEFORE creating or updating filters to know available fields
- Essential for understanding what field_id values to use in conditions
- Shows which operators are valid for each field type
- Results are heavily cached for 15 minutes
- No parameters needed - returns all available helpers

Common use cases:
- Discover available deal fields: {}
- Find person field IDs: {}
- Check valid operators for a field: {}
- Get dropdown options for enum fields: {}`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async (_args: unknown) => {
        return client.get(
          '/filters/helpers',
          {},
          { enabled: true, ttl: 900000 } // Cache for 15 minutes
        );
      },
    },
  };
}
