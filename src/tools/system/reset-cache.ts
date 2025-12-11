import type { PipedriveClient } from '../../pipedrive-client.js';

export function getResetCacheTool(client: PipedriveClient) {
  return {
    'system/reset_cache': {
      description: `Clear all cached data from the MCP server.

Removes all entries from the cache, forcing fresh API requests for subsequent operations. This is useful for:
- Debugging cache-related issues
- Forcing refresh of stale data
- Testing without cached responses
- Resetting after bulk data changes

Returns the number of cache entries that were cleared.

CAUTION: This will impact performance temporarily as all subsequent requests will need to fetch fresh data from the Pipedrive API. The cache will repopulate naturally as requests are made.

Response includes:
- message: Confirmation message
- previousSize: Number of cache entries that were cleared
- timestamp: Time when cache was cleared

Common use cases:
- Debug stale or incorrect cached data
- Force refresh after bulk imports or updates
- Test API behavior without cache
- Clear cache after configuration changes`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        const previousSize = client.getCacheStats().size;

        // Clear the cache
        client.clearCache();

        return {
          message: 'Cache cleared successfully',
          previousSize,
          timestamp: new Date().toISOString(),
        };
      },
    },
  };
}
