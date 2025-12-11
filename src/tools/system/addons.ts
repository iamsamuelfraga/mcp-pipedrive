import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListAddonsTool(client: PipedriveClient) {
  return {
    'system_list_addons': {
      description: `Get all add-ons for a single company.

Returns the add-ons (billing subscriptions) configured for your Pipedrive company account.

Add-ons include features like:
- LeadBooster (lead generation tools)
- Prospector (contact database access)
- Smart Docs (document management)
- And other premium features

This is useful for:
- Checking which premium features are enabled
- Understanding account capabilities
- Determining available integrations
- Auditing subscription status

Cached for 24 hours as add-on configuration doesn't change frequently.

Response includes array of add-on codes:
- code: Add-on identifier (e.g., "leadbooster_v2", "prospector", "smart_docs_v2")

Common use cases:
- Check if LeadBooster is available before using lead features
- Verify Smart Docs access for document operations
- List all active premium features
- Audit company subscriptions`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/billing/subscriptions/addons', undefined, {
          enabled: true,
          ttl: 86400000, // 24 hours
        });
      },
    },
  };
}
