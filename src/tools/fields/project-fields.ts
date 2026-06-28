import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  CreateProjectFieldSchema,
  UpdateProjectFieldSchema,
  DeleteProjectFieldSchema,
} from '../../schemas/project-field.js';

const FIELD_TYPE_ENUM = [
  'varchar',
  'varchar_auto',
  'text',
  'double',
  'monetary',
  'date',
  'set',
  'enum',
  'user',
  'org',
  'people',
  'phone',
  'time',
  'timerange',
  'daterange',
  'address',
];

const OPTIONS_SCHEMA = {
  type: 'array' as const,
  description: 'Required for `enum` and `set` field types',
  items: {
    type: 'object' as const,
    properties: {
      id: { type: 'number', description: 'Existing option ID (when updating)' },
      label: { type: 'string', description: 'Visible label of the option' },
    },
    required: ['label'],
  },
};

/**
 * Project field tools (API v2: `/api/v2/projectFields`). Project fields are
 * identified by a string `field_code`.
 */
export function getProjectFieldTools(client: PipedriveClient) {
  return {
    fields_list_project_fields: {
      description: `Get all field definitions for projects, including custom fields (API v2).

Returns field codes, types and options. Cached for 15 minutes.

Common use cases:
- Discover project custom fields and their field codes
- Check field types before creating/updating projects`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/api/v2/projectFields', undefined, {
          enabled: true,
          ttl: 900000, // 15 minutes
        });
      },
    },

    fields_create_project_field: {
      description: `Create a new custom field for projects (API v2).

For \`enum\` and \`set\` field types you must provide \`options\` (a non-empty array of
\`{ label }\` objects). The created field's \`field_code\` is what you use to update or
delete it later.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Display name of the field' },
          field_type: {
            type: 'string',
            enum: FIELD_TYPE_ENUM,
            description: 'Type of the field. `enum`/`set` require `options`.',
          },
          options: OPTIONS_SCHEMA,
        },
        required: ['name', 'field_type'],
      },
      handler: async (args: unknown) => {
        const parsed = CreateProjectFieldSchema.parse(args);
        return client.post('/api/v2/projectFields', parsed);
      },
    },

    fields_update_project_field: {
      description: `Update an existing project field (API v2).

Provide the \`field_code\` and any of name / options. Field type cannot be changed.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          field_code: { type: 'string', description: 'Field code of the project field to update' },
          name: { type: 'string', description: 'New display name of the field' },
          options: OPTIONS_SCHEMA,
        },
        required: ['field_code'],
      },
      handler: async (args: unknown) => {
        const { field_code, ...body } = UpdateProjectFieldSchema.parse(args);
        return client.patch(`/api/v2/projectFields/${field_code}`, body);
      },
    },

    fields_delete_project_field: {
      description: `Delete a project field by its field code (API v2).`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          field_code: { type: 'string', description: 'Field code of the project field to delete' },
        },
        required: ['field_code'],
      },
      handler: async (args: unknown) => {
        const { field_code } = DeleteProjectFieldSchema.parse(args);
        return client.delete(`/api/v2/projectFields/${field_code}`);
      },
    },
  };
}
