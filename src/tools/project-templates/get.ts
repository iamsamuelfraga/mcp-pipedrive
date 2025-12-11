import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetProjectTemplateSchema } from '../../schemas/project-template.js';
import type { PipedriveResponse } from '../../types/common.js';

export function createGetProjectTemplateTool(client: PipedriveClient) {
  return {
    name: 'project_templates/get',
    description: `Get details of a single project template by ID.

Returns complete information about a project template including its structure,
phases, groups, tasks, and activities.

Workflow tips:
- Templates contain the blueprint for creating standardized projects
- Use this to inspect template details before using it to create a project
- Template structure includes phases, task groups, tasks, and activities
- You can create a project from this template using projects/create

Common use cases:
- View template structure before creating a project
- Inspect phases and tasks included in the template
- Review template configuration
- Validate template before use

Example:
{ "id": 123 }`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the project template to retrieve',
        },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectTemplateSchema.parse(args);

      const response = await client.get<PipedriveResponse<unknown>>(
        `/projectTemplates/${parsed.id}`,
        {},
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
