import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { PipedriveClient } from '../pipedrive-client.js';

/**
 * Setup MCP Resources for the Pipedrive server
 *
 * Resources provide read-only access to static/dynamic reference data that LLMs can access
 * without calling tools. This includes pipeline configurations, custom field definitions,
 * and current user information.
 *
 * Available resources:
 * - pipedrive://pipelines - All sales pipelines with stages, order, and deal counts
 * - pipedrive://custom-fields - Custom fields across all entity types
 * - pipedrive://current-user - Authenticated user information
 *
 * @param server - The MCP server instance
 * @param client - The PipedriveClient instance to use for API calls
 */
export function setupResources(server: Server, client: PipedriveClient) {
  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'pipedrive://pipelines',
          name: 'Sales Pipelines Configuration',
          description:
            'All sales pipelines with stages, order, and deal counts. Use this to understand pipeline structure before moving deals.',
          mimeType: 'application/json',
        },
        {
          uri: 'pipedrive://custom-fields',
          name: 'Custom Fields Definitions',
          description:
            'All custom fields across all entity types (deals, persons, organizations, activities). Check this before creating/updating records to know available fields.',
          mimeType: 'application/json',
        },
        {
          uri: 'pipedrive://current-user',
          name: 'Current User Info',
          description:
            'Authenticated user information including permissions, timezone, and locale.',
          mimeType: 'application/json',
        },
      ],
    };
  });

  // Read specific resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (uri === 'pipedrive://pipelines') {
      // Fetch all pipelines with caching enabled (10 min TTL)
      const pipelines = await client.get('/pipelines', undefined, {
        enabled: true,
        ttl: 600000,
      });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(pipelines, null, 2),
          },
        ],
      };
    }

    if (uri === 'pipedrive://custom-fields') {
      // Fetch all field types in parallel with caching (15 min TTL)
      const [dealFields, personFields, orgFields, activityFields] = await Promise.all([
        client.get('/dealFields', undefined, { enabled: true, ttl: 900000 }),
        client.get('/personFields', undefined, { enabled: true, ttl: 900000 }),
        client.get('/organizationFields', undefined, { enabled: true, ttl: 900000 }),
        client.get('/activityFields', undefined, { enabled: true, ttl: 900000 }),
      ]);

      // Aggregate all fields by entity type
      const customFields = {
        deals: (dealFields as any).data || [],
        persons: (personFields as any).data || [],
        organizations: (orgFields as any).data || [],
        activities: (activityFields as any).data || [],
      };

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(customFields, null, 2),
          },
        ],
      };
    }

    if (uri === 'pipedrive://current-user') {
      // Fetch current user info with caching (1 min TTL)
      const user = await client.get('/users/me', undefined, {
        enabled: true,
        ttl: 60000,
      });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(user, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  });
}
