import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateFilterSchema } from '../../schemas/filter.js';

export function getCreateFilterTool(client: PipedriveClient) {
  return {
    'filters_create': {
      description: `Create a new filter in Pipedrive.

Adds a new filter with conditions. Returns the filter ID upon success.

IMPORTANT LIMITATIONS:
- Only ONE first-level condition group is supported (must be glued with 'AND')
- Only TWO second-level condition groups are supported
- First second-level group must be glued with 'AND'
- Second second-level group must be glued with 'OR'
- Maximum of 16 conditions per filter

Workflow tips:
- Use filters/helpers to discover available field IDs and operators
- Structure: { glue: "and", conditions: [{ glue: "and", conditions: [...] }, { glue: "or", conditions: [...] }] }
- Common operators: =, !=, <, >, <=, >=, LIKE, IN, IS NULL, IS NOT NULL
- Filter types: deals, org, people, products, activities

Example simple filter:
{
  "name": "High value deals",
  "type": "deals",
  "conditions": {
    "glue": "and",
    "conditions": [
      {
        "glue": "and",
        "conditions": [
          {
            "object": "deal",
            "field_id": "value",
            "operator": ">",
            "value": 10000
          }
        ]
      },
      {
        "glue": "or",
        "conditions": [null]
      }
    ]
  }
}`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: {
            type: 'string',
            description: 'Filter name (required)',
          },
          type: {
            type: 'string',
            enum: ['deals', 'org', 'people', 'products', 'activities'],
            description: 'Filter type (required)',
          },
          conditions: {
            type: 'object',
            description: 'Filter conditions structure with glue and conditions array (required)',
          },
        },
        required: ['name', 'type', 'conditions'],
      },
      handler: async (args: unknown) => {
        const validated = CreateFilterSchema.parse(args);
        return client.post('/filters', validated);
      },
    },
  };
}
