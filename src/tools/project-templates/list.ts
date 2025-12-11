import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetProjectTemplatesSchema } from '../../schemas/project-template.js';

interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  additional_data?: {
    next_cursor?: string;
  };
}

export function createListProjectTemplatesTool(client: PipedriveClient) {
  return {
    name: 'project_templates_list',
    description: `List all project templates with cursor-based pagination.

Project templates are reusable blueprints for creating new projects with
predefined phases, tasks, and activities.

Workflow tips:
- Templates include project structure (phases, groups, tasks, activities)
- Use templates to standardize project creation across your organization
- Templates can be created from existing projects
- Cursor-based pagination for large template lists

Common use cases:
- List all available templates: {}
- Get templates with custom page size: { "limit": 50 }
- Paginate through templates: { "cursor": "abc123", "limit": 100 }

Example:
{ "limit": 100 }`,
    inputSchema: {
      type: 'object',
      properties: {
        cursor: {
          type: 'string',
          description: 'For pagination, the marker representing the first item on the next page',
        },
        limit: {
          type: 'number',
          description: 'Number of items to return per page (default: 100, max: 500)',
          default: 100,
        },
      },
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectTemplatesSchema.parse(args);

      const params: Record<string, string | number> = {
        limit: parsed.limit ?? 100,
      };

      if (parsed.cursor !== undefined) params.cursor = parsed.cursor;

      const response = await client.get<CursorPaginatedResponse<unknown>>(
        '/projectTemplates',
        params,
        { enabled: true, ttl: 300000 } // Cache for 5 minutes
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
