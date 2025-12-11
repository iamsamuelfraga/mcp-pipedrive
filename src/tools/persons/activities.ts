import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetPersonActivitiesSchema } from '../../schemas/person.js';
import type { Activity } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing activities for a person
 */
export function getListPersonActivitiesTool(client: PipedriveClient) {
  return {
    name: 'persons_list_activities',
    description: `List all activities associated with a specific person.

Returns all activities (calls, meetings, tasks, etc.) linked to the person, including:
- Activity details (type, subject, description)
- Due date and time
- Completion status
- Owner/assignee information
- Related deal/organization

Filters:
- done: Filter by completion status (true=completed, false=pending)

Supports pagination for large result sets.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Items per page, max 500 (default: 100)',
        },
        done: {
          type: 'boolean',
          description: 'Filter by completion status (true=completed, false=pending)',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = GetPersonActivitiesSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {};

      if (validated.start !== undefined) queryParams.start = validated.start;
      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.done !== undefined) queryParams.done = validated.done;

      const response = await client.get<PipedriveResponse<Activity[]>>(
        `/persons/${validated.id}/activities`,
        queryParams,
        { enabled: true, ttl: 30000 } // Cache for 30 seconds
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
