import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  GetRoleSettingsSchema,
  AddRoleSettingSchema,
  UpdateRoleSettingSchema,
  DeleteRoleSettingSchema,
} from '../../schemas/role.js';

export function getRoleSettingsTools(client: PipedriveClient) {
  return {
    'roles/get_role_settings': {
      description: `Get role settings.

Returns all settings configured for a specific role.

Workflow tips:
- Shows all role-specific configurations
- Includes visibility and permission settings
- Useful for understanding role capabilities
- Cached for 15 minutes

Common use cases:
- Get role settings: { "id": 123 }
- Audit role configuration`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetRoleSettingsSchema.parse(args);
        return client.get(`/roles/${id}/settings`, undefined, { enabled: true, ttl: 900000 });
      },
    },

    'roles/add_role_setting': {
      description: `Add or update a role setting.

Creates or updates a setting for a role. Requires admin permissions.

Workflow tips:
- Setting key should follow Pipedrive conventions
- Value can be string, number, or boolean
- Creates new setting or updates existing one
- Changes affect all users with this role

Common use cases:
- Add setting: { "id": 123, "setting_key": "visibility", "value": "shared" }
- Enable feature: { "id": 123, "setting_key": "can_export_data", "value": true }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          setting_key: { type: 'string', description: 'Key of the setting' },
          value: {
            description: 'Value of the setting (string, number, or boolean)'
          },
        },
        required: ['id', 'setting_key', 'value'],
      },
      handler: async (args: unknown) => {
        const { id, setting_key, value } = AddRoleSettingSchema.parse(args);
        return client.post(`/roles/${id}/settings`, { setting_key, value });
      },
    },

    'roles/update_role_setting': {
      description: `Update a role setting.

Updates an existing setting for a role. Requires admin permissions.

Workflow tips:
- Setting must already exist
- Use roles/get_role_settings to see current settings
- Changes affect all users with this role
- Value type should match original setting

Common use cases:
- Update setting: { "id": 123, "setting_key": "visibility", "value": "private" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          setting_key: { type: 'string', description: 'Key of the setting' },
          value: {
            description: 'New value of the setting (string, number, or boolean)'
          },
        },
        required: ['id', 'setting_key', 'value'],
      },
      handler: async (args: unknown) => {
        const { id, setting_key, value } = UpdateRoleSettingSchema.parse(args);
        return client.put(`/roles/${id}/settings/${setting_key}`, { value });
      },
    },

    'roles/delete_role_setting': {
      description: `Delete a role setting.

Removes a setting from a role. Requires admin permissions.

Workflow tips:
- Reverts to default value if available
- Use roles/get_role_settings to see current settings
- Changes affect all users with this role

Common use cases:
- Remove setting: { "id": 123, "setting_key": "custom_permission" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the role' },
          setting_key: { type: 'string', description: 'Key of the setting to delete' },
        },
        required: ['id', 'setting_key'],
      },
      handler: async (args: unknown) => {
        const { id, setting_key } = DeleteRoleSettingSchema.parse(args);
        return client.delete(`/roles/${id}/settings/${setting_key}`);
      },
    },
  };
}
