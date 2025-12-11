import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetOrganizationsCollectionSchema } from '../../schemas/organization.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for getting all organizations using collection endpoint
 */
export function getOrganizationsCollectionTool(client: PipedriveClient) {
  return {
    name: 'organizations/get_collection',
    description: `Get all organizations using the collection endpoint.

This endpoint provides an alternative way to fetch organizations with different capabilities:
- Cursor-based pagination (more efficient for large datasets)
- Date range filtering (since/until)
- Optimized for data synchronization
- Better performance for large-scale operations

Key differences from organizations/list:
- Uses cursor pagination instead of offset/limit
- Supports date-based filtering for incremental sync
- More efficient for fetching large volumes
- Better for ETL and data integration scenarios

Parameters:
- cursor: Pagination cursor from previous response
- limit: Items per page (default: 100, max: 500)
- since: Start date (YYYY-MM-DD) - get organizations modified since this date
- until: End date (YYYY-MM-DD) - get organizations modified until this date
- owner_id: Filter by owner user ID
- first_char: Filter by first character of name

Use cases:
- Initial data synchronization
- Incremental updates (using since parameter)
- Large-scale data exports
- Integration with external systems
- ETL pipelines
- Backup and archival

The cursor-based approach is more reliable than offset pagination for
datasets that change frequently, as it maintains consistency even when
records are added or deleted during pagination.`,
    inputSchema: {
      type: 'object',
      properties: {
        cursor: {
          type: 'string',
          description: 'Cursor for pagination (from previous response)',
        },
        limit: {
          type: 'number',
          description: 'Number of items to return (default: 100, max: 500)',
        },
        since: {
          type: 'string',
          description: 'Start date for filtering (YYYY-MM-DD format)',
        },
        until: {
          type: 'string',
          description: 'End date for filtering (YYYY-MM-DD format)',
        },
        owner_id: {
          type: 'number',
          description: 'Filter by owner user ID',
        },
        first_char: {
          type: 'string',
          description: 'Filter by first character of name (single letter)',
        },
      },
    } as const,
    handler: async (params: unknown) => {
      const validated = GetOrganizationsCollectionSchema.parse(params);

      const queryParams: Record<string, string | number | boolean> = {};

      if (validated.cursor) queryParams.cursor = validated.cursor;
      if (validated.limit) queryParams.limit = validated.limit;
      if (validated.since) queryParams.since = validated.since;
      if (validated.until) queryParams.until = validated.until;
      if (validated.owner_id) queryParams.owner_id = validated.owner_id;
      if (validated.first_char) queryParams.first_char = validated.first_char;

      const response = await client.get<PipedriveResponse<unknown[]>>(
        '/organizations/collection',
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
