import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateWebhookSchema } from '../../schemas/webhook.js';

export function getCreateWebhookTool(client: PipedriveClient) {
  return {
    'webhooks_create': {
      description: `Create a new webhook to receive real-time notifications from Pipedrive.

Creates a webhook that will send HTTP POST requests to your endpoint when specified events occur.

Required fields:
- subscription_url: The HTTPS endpoint that will receive webhook notifications
- event_action: The action that triggers the webhook
- event_object: The object type that triggers the webhook

Webhook triggers (event_action + event_object):
- Event Actions: added, updated, deleted, merged, * (all)
- Event Objects: activity, activityType, deal, note, organization, person, pipeline, product, stage, user, * (all)

Common webhook combinations:
- New deals: { "event_action": "added", "event_object": "deal" }
- Updated persons: { "event_action": "updated", "event_object": "person" }
- Deleted organizations: { "event_action": "deleted", "event_object": "organization" }
- All events: { "event_action": "*", "event_object": "*" }
- All deal events: { "event_action": "*", "event_object": "deal" }

Security:
- Use HTTPS URLs for security
- Optionally add HTTP Basic Auth with http_auth_user and http_auth_password
- Both auth fields must be provided together

Version:
- version: "2.0" (recommended, default) or "1.0" (legacy)
- v2.0 includes more data and better structure

Workflow tips:
1. Set up your endpoint first to handle POST requests
2. Create the webhook with appropriate event filters
3. Test with webhooks/list to verify creation
4. Monitor last_delivery_time and last_http_status for debugging
5. Your endpoint should return 200-299 status code to acknowledge receipt

Example payloads:
- Simple webhook: { "subscription_url": "https://example.com/webhook", "event_action": "added", "event_object": "deal" }
- With auth: { "subscription_url": "https://example.com/webhook", "event_action": "updated", "event_object": "person", "http_auth_user": "user", "http_auth_password": "pass" }
- All events: { "subscription_url": "https://example.com/webhook", "event_action": "*", "event_object": "*", "name": "All Events Webhook" }

Important notes:
- Pipedrive will send a test request immediately after creation
- Your endpoint must be accessible from Pipedrive servers
- Webhooks that repeatedly fail may be automatically disabled
- See Pipedrive documentation for webhook payload structure`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          subscription_url: {
            type: 'string',
            description: 'HTTPS URL endpoint that will receive webhook notifications (required)',
          },
          event_action: {
            type: 'string',
            enum: ['added', 'updated', 'deleted', 'merged', '*'],
            description:
              'Action that triggers the webhook: added, updated, deleted, merged, or * (all) (required)',
          },
          event_object: {
            type: 'string',
            enum: [
              'activity',
              'activityType',
              'deal',
              'note',
              'organization',
              'person',
              'pipeline',
              'product',
              'stage',
              'user',
              '*',
            ],
            description: 'Object type that triggers the webhook (required)',
          },
          user_id: {
            type: 'number',
            description: 'ID of the user this webhook is associated with',
          },
          http_auth_user: {
            type: 'string',
            description: 'HTTP Basic Auth username (must be provided with http_auth_password)',
          },
          http_auth_password: {
            type: 'string',
            description: 'HTTP Basic Auth password (must be provided with http_auth_user)',
          },
          version: {
            type: 'string',
            enum: ['1.0', '2.0'],
            description: 'Webhook version (default: 2.0, recommended)',
          },
          name: {
            type: 'string',
            description: 'Optional name to identify this webhook',
          },
        },
        required: ['subscription_url', 'event_action', 'event_object'],
      },
      handler: async (args: unknown) => {
        const validated = CreateWebhookSchema.parse(args);
        return client.post('/webhooks', validated);
      },
    },
  };
}
