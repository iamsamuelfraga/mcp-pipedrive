import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetCurrentUserSchema } from '../../schemas/user.js';

export function getCurrentUserTool(client: PipedriveClient) {
  return {
    'users/get_current': {
      description: `Get information about the current authorized user.

Returns details about the user associated with the API token being used.

Workflow tips:
- No parameters needed
- Useful for checking current user's permissions
- Shows role and access levels
- Cached for 10 minutes

Common use cases:
- Get current user info: {}
- Check own permissions
- Verify API token user`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async (args: unknown) => {
        GetCurrentUserSchema.parse(args);
        return client.get('/users/me', undefined, { enabled: true, ttl: 600000 });
      },
    },
  };
}
