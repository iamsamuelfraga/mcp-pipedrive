import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListPersonsSchema } from '../../schemas/person.js';
import type { Person } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for listing persons with pagination
 */
export function getListPersonsTool(client: PipedriveClient) {
  return {
    name: 'persons/list',
    description: `List all persons with optional filtering and pagination.

Supports filtering by:
- user_id: Filter by owner
- org_id: Filter by organization
- first_char: Filter by first character of name (single letter)
- filter_id: Apply a saved filter

Returns paginated results. Use start/limit for manual pagination.`,
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'number',
          description: 'Pagination start (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Items per page, max 500 (default: 100)',
        },
        user_id: {
          type: 'number',
          description: 'Filter by owner user ID',
        },
        org_id: {
          type: 'number',
          description: 'Filter by organization ID',
        },
        first_char: {
          type: 'string',
          description: 'Filter by first character of name (e.g., "A", "B")',
        },
        filter_id: {
          type: 'number',
          description: 'Filter ID to apply',
        },
        sort: {
          type: 'string',
          description: 'Field to sort by (e.g., "name", "email")',
        },
      },
    } as const,
    handler: async (params: unknown) => {
      const validated = ListPersonsSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {
        start: validated.start,
      };

      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.user_id) queryParams.user_id = validated.user_id;
      if (validated.org_id) queryParams.org_id = validated.org_id;
      if (validated.first_char) queryParams.first_char = validated.first_char;
      if (validated.filter_id) queryParams.filter_id = validated.filter_id;
      if (validated.sort) queryParams.sort = validated.sort;
      if (validated.sort_by) queryParams.sort_by = validated.sort_by;

      const response = await client.get<PipedriveResponse<Person[]>>(
        '/persons',
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
 * Tool for auto-pagination to fetch all persons
 */
export function getListAllPersonsAutoTool(client: PipedriveClient) {
  return {
    name: 'persons/list_all_auto',
    description: `Automatically fetch ALL persons using pagination.

This tool handles pagination automatically and returns all persons matching the filters.
Use this when you need the complete list without managing pagination manually.

Warning: This can return a large dataset if you have many persons.

Supports the same filters as persons/list:
- user_id: Filter by owner
- org_id: Filter by organization
- first_char: Filter by first character of name
- filter_id: Apply a saved filter`,
    inputSchema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'number',
          description: 'Filter by owner user ID',
        },
        org_id: {
          type: 'number',
          description: 'Filter by organization ID',
        },
        first_char: {
          type: 'string',
          description: 'Filter by first character of name (e.g., "A", "B")',
        },
        filter_id: {
          type: 'number',
          description: 'Filter ID to apply',
        },
        sort: {
          type: 'string',
          description: 'Field to sort by (e.g., "name", "email")',
        },
      },
    } as const,
    handler: async (params: unknown) => {
      const validated = z
        .object({
          user_id: z.number().int().positive().optional(),
          org_id: z.number().int().positive().optional(),
          first_char: z.string().length(1).optional(),
          filter_id: z.number().int().positive().optional(),
          sort: z.string().optional(),
        })
        .parse(params);

      const queryParams: Record<string, string | number | boolean> = {};

      if (validated.user_id) queryParams.user_id = validated.user_id;
      if (validated.org_id) queryParams.org_id = validated.org_id;
      if (validated.first_char) queryParams.first_char = validated.first_char;
      if (validated.filter_id) queryParams.filter_id = validated.filter_id;
      if (validated.sort) queryParams.sort = validated.sort;

      const paginator = client.createPaginator<Person>('/persons', queryParams);
      const allPersons = await paginator.fetchAll(100);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: allPersons,
                count: allPersons.length,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  };
}
