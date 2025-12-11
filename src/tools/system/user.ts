import type { PipedriveClient } from '../../pipedrive-client.js';

export function getCurrentUserTool(client: PipedriveClient) {
  return {
    'system/get_current_user': {
      description: `Get information about the currently authenticated user.

Returns complete details about the user associated with the API token, including:
- User ID, name, and email
- Account permissions and role
- Default currency and language
- Timezone and locale settings
- Company information
- Account limits and features

This is useful for understanding the context and permissions of the current API session.

Cached for 60 seconds as user information rarely changes during a session.

Response includes:
- id: User ID
- name: Full name
- email: Email address
- role_id: User's role ID
- timezone: User's timezone (e.g., "America/New_York")
- locale: User's locale (e.g., "en_US")
- default_currency: Default currency code
- is_admin: Whether user is an admin
- activated: Whether account is activated
- company_id: Company ID
- company_name: Company name

Common use cases:
- Get user context for operations
- Check user permissions
- Retrieve timezone for date/time operations
- Get default currency for monetary fields`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/users/me', undefined, {
          enabled: true,
          ttl: 60000, // 60 seconds
        });
      },
    },
  };
}
