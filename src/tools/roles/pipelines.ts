import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  ListRolePipelinesSchema,
  UpdateRolePipelinesSchema,
} from '../../schemas/role.js';

export function getRolePipelinesTools(client: PipedriveClient) {
  return {
    'roles/list_role_pipelines': {
      description: `List pipeline visibility for a role.

Returns all pipelines and their visibility status for a specific role. For more information on pipeline visibility, please refer to the Visibility groups article.

Workflow tips:
- Shows which pipelines are visible/hidden for the role
- Use visible parameter to filter only visible pipelines
- Useful for managing pipeline access by role
- Cached for 15 minutes

Common use cases:
- List all pipelines for role: { "id": 123 }
- List only visible pipelines: { "id": 123, "visible": true }
- Audit pipeline visibility settings`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          visible: { type: 'boolean', description: 'Whether to fetch only visible pipelines' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, visible } = ListRolePipelinesSchema.parse(args);
        const params = visible !== undefined ? { visible } : undefined;
        return client.get(`/roles/${id}/pipelines`, params, { enabled: true, ttl: 900000 });
      },
    },

    'roles/update_role_pipelines': {
      description: `Update pipeline visibility for a role.

Updates the specified pipelines to be visible and/or hidden for a specific role. For more information on pipeline visibility, please refer to the Visibility groups article.

Workflow tips:
- Use object with pipeline IDs as keys and 1/0 as values
- 1 = visible, 0 = hidden
- Requires admin permissions
- Changes affect all users with this role
- Use roles/list_role_pipelines to see current visibility

Common use cases:
- Make pipelines visible: { "id": 123, "visible_pipeline_ids": { "1": 1, "2": 1 } }
- Hide specific pipelines: { "id": 123, "visible_pipeline_ids": { "3": 0 } }
- Mix visibility: { "id": 123, "visible_pipeline_ids": { "1": 1, "2": 0 } }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          visible_pipeline_ids: {
            type: 'object',
            description: 'Object where keys are pipeline IDs and values are 1 (visible) or 0 (hidden)',
            additionalProperties: { type: 'number' },
          },
        },
        required: ['id', 'visible_pipeline_ids'],
      },
      handler: async (args: unknown) => {
        const { id, visible_pipeline_ids } = UpdateRolePipelinesSchema.parse(args);
        return client.put(`/roles/${id}/pipelines`, { visible_pipeline_ids });
      },
    },
  };
}
