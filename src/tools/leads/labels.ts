import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  CreateLeadLabelSchema,
  UpdateLeadLabelSchema,
  DeleteLeadLabelSchema,
} from '../../schemas/lead-label.js';

export function getLeadLabelsTool(client: PipedriveClient) {
  return {
    leads_get_labels: {
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

export function getLeadLabelTools(client: PipedriveClient) {
  return {
    lead_labels_create: {
      description: `Create a new lead label.

Required: name + color. Color must be one of: blue, brown, dark-gray, gray, green,
orange, pink, purple, red, yellow.

Common use cases:
- Hot lead: { "name": "Hot", "color": "red" }
- Qualified lead: { "name": "Qualified", "color": "green" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Label display name' },
          color: {
            type: 'string',
            enum: [
              'blue', 'brown', 'dark-gray', 'gray', 'green',
              'orange', 'pink', 'purple', 'red', 'yellow',
            ],
            description: 'Label color',
          },
        },
        required: ['name', 'color'],
      },
      handler: async (args: unknown) => {
        const parsed = CreateLeadLabelSchema.parse(args);
        return client.post('/leadLabels', parsed);
      },
    },

    lead_labels_update: {
      description: `Update an existing lead label.

Provide the label's UUID and any combination of name/color to change.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead label UUID' },
          name: { type: 'string', description: 'New name' },
          color: {
            type: 'string',
            enum: [
              'blue', 'brown', 'dark-gray', 'gray', 'green',
              'orange', 'pink', 'purple', 'red', 'yellow',
            ],
            description: 'New color',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...body } = UpdateLeadLabelSchema.parse(args);
        return client.patch(`/leadLabels/${id}`, body);
      },
    },

    lead_labels_delete: {
      description: `Delete a lead label by UUID.

Existing leads carrying this label will lose it after deletion.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Lead label UUID' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteLeadLabelSchema.parse(args);
        return client.delete(`/leadLabels/${id}`);
      },
    },
  };
}
