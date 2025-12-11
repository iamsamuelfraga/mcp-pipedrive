import type { PipedriveClient } from '../../pipedrive-client.js';

export function getHealthCheckTool(client: PipedriveClient) {
  return {
    'system/health_check': {
      description: `Check API connectivity and authentication status.

Verifies that the Pipedrive API is accessible and the authentication token is valid by making a test request to GET /users/me.

Returns:
- healthy: Boolean indicating if the API is accessible
- user: Current authenticated user information (if healthy)
- timestamp: Time of the health check
- error: Error details if unhealthy

Cached for 60 seconds to avoid excessive health checks.

Common use cases:
- Verify API token is valid
- Check if Pipedrive API is accessible
- Get basic connection status before performing operations
- Troubleshoot authentication issues`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        try {
          const user = await client.get('/users/me', undefined, {
            enabled: true,
            ttl: 60000, // 60 seconds
          });

          return {
            healthy: true,
            user,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          return {
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          };
        }
      },
    },
  };
}
