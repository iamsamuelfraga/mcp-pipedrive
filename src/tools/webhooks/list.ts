import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListWebhooksTool(client: PipedriveClient) {
  return {
    'webhooks/list': {
      description: `Get all webhooks configured for the company.

Returns a list of all webhooks that have been created in Pipedrive, including:
- Active and inactive webhooks
- Event triggers (action + object combinations)
- Subscription URLs
- Authentication settings
- Last delivery information

Note: Webhook data is always fetched fresh (no caching) to ensure you see the current state.

Common use cases:
- List all active webhooks: Review current webhook configurations
- Audit webhook endpoints: Check which URLs are receiving notifications
- Debug webhook issues: View last delivery time and HTTP status
- Manage webhooks: Get webhook IDs before updating or deleting

Event combinations explained:
- event_action: added, updated, deleted, merged, or * (all)
- event_object: activity, deal, person, organization, note, pipeline, product, stage, user, or * (all)
- Examples: "added.deal", "updated.person", "deleted.organization", "*.*" (all events)

Webhook fields returned:
- id: Webhook ID
- subscription_url: The URL that receives webhook notifications
- event_action & event_object: The trigger combination
- is_active: Whether the webhook is currently active
- add_time: When the webhook was created
- last_delivery_time: Last successful delivery timestamp
- last_http_status: HTTP status code from last delivery attempt
- version: Webhook API version (1.0 or 2.0)
- name: Optional webhook name`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
      handler: async () => {
        // No caching for webhooks - always get fresh data
        return client.get('/webhooks');
      },
    },
  };
}
