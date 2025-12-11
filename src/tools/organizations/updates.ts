import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  GetOrganizationChangelogSchema,
  GetOrganizationFlowSchema,
} from '../../schemas/organization.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing organization field value updates (changelog)
 */
export function getListOrganizationChangelogTool(client: PipedriveClient) {
  return {
    name: 'organizations_list_field_updates',
    description: `List updates about organization field values (changelog).

Returns a chronological list of changes made to organization fields. This is useful for:
- Auditing field changes
- Tracking data modifications
- Understanding update history
- Compliance and reporting

The changelog shows:
- Which fields were changed
- Old and new values
- Who made the change
- When the change occurred

Uses cursor-based pagination for efficient navigation through large change histories.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Organization ID',
        },
        cursor: {
          type: 'string',
          description: 'Cursor for pagination',
        },
        limit: {
          type: 'number',
          description: 'Number of items to return (max 500)',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetOrganizationChangelogSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {};
      if (validated.cursor) queryParams.cursor = validated.cursor;
      if (validated.limit) queryParams.limit = validated.limit;

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/organizations/${validated.id}/changelog`,
        queryParams,
        { enabled: true, ttl: 60000 } // Cache for 1 minute
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

/**
 * Tool for listing organization updates (flow/activity stream)
 */
export function getListOrganizationFlowTool(client: PipedriveClient) {
  return {
    name: 'organizations_list_updates',
    description: `List updates about an organization (activity stream).

Returns a comprehensive timeline of all activities and changes related to an organization:
- Field changes and updates
- Activities (calls, meetings, emails)
- Notes added
- Deals created or updated
- Files attached
- Followers added
- Other related events

This provides a complete audit trail and activity history for the organization.

Parameters:
- all_changes: Set to show all field changes (not just recent)
- items: Filter which types of items to include in the stream

Useful for:
- Getting a complete overview of interactions
- Understanding organization engagement history
- Tracking relationship development
- Account management and customer success`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Organization ID',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Number of items to return (max 500)',
        },
        all_changes: {
          type: 'string',
          description: 'Whether to show all field changes',
        },
        items: {
          type: 'string',
          description: 'Types of items to include in the flow',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetOrganizationFlowSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        start: validated.start ?? 0,
      };

      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.all_changes) queryParams.all_changes = validated.all_changes;
      if (validated.items) queryParams.items = validated.items;

      const response = await client.get<PipedriveResponse<unknown[]>>(
        `/organizations/${validated.id}/flow`,
        queryParams,
        { enabled: true, ttl: 60000 } // Cache for 1 minute
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
