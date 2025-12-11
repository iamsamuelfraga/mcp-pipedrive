import type { PipedriveClient } from '../../pipedrive-client.js';

export function getUserConnectionsTool(client: PipedriveClient) {
  return {
    'system/get_user_connections': {
      description: `Get all user connections for the authorized user.

Returns data about all external service connections (integrations) for the currently authorized user. This shows which third-party services the user has connected to their Pipedrive account.

Common connections include:
- Google (Gmail, Calendar, Drive)
- Microsoft (Outlook, Office 365)
- Video calling services
- Email providers
- Calendar services
- And other integrations

This is useful for:
- Checking which services are connected
- Verifying integration status
- Debugging connection issues
- Auditing user integrations

Response includes:
- Service name as key (e.g., "google")
- Connection ID as value (e.g., "awesomeid-123-4567890")

Common use cases:
- Check if Google is connected before using Gmail features
- Verify email integration status
- List all user integrations
- Troubleshoot sync issues`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/userConnections');
      },
    },
  };
}
