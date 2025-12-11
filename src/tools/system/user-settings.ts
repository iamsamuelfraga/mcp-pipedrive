import type { PipedriveClient } from '../../pipedrive-client.js';

export function getUserSettingsTool(client: PipedriveClient) {
  return {
    'system/get_user_settings': {
      description: `List settings of the authorized user.

Returns all configuration settings for the currently authorized Pipedrive user. This includes personal preferences, feature flags, limits, and account-specific configurations.

Common settings include:
- list_limit: Default pagination size (e.g., 100)
- beta_app: Beta features access
- file_upload_destination: Storage location (e.g., "s3")
- callto_link_syntax: Phone call link format
- autofill_deal_expected_close_date: Auto-fill deal dates
- person_duplicate_condition: Duplicate detection rules
- marketplace_team: Marketplace team access
- And many other preferences

This is useful for:
- Understanding user preferences
- Checking feature access
- Debugging user-specific issues
- Auditing account configuration
- Determining default behaviors

Cached for 1 hour as settings don't change frequently.

Response includes key-value pairs of settings:
- Setting name as key
- Setting value as value (boolean, number, or string)

Common use cases:
- Check list_limit before pagination
- Verify beta feature access
- Understand duplicate detection rules
- Get default behaviors for operations`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/userSettings', undefined, {
          enabled: true,
          ttl: 3600000, // 1 hour
        });
      },
    },
  };
}
