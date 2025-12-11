import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteWebhookSchema } from '../../schemas/webhook.js';

export function getDeleteWebhookTool(client: PipedriveClient) {
  return {
    'webhooks/delete': {
      description: `Delete a webhook by its ID.

Permanently removes a webhook from Pipedrive. Once deleted, the webhook will no longer send notifications to the subscription URL.

When to delete webhooks:
- The endpoint URL is no longer valid or in use
- You want to stop receiving notifications for specific events
- You're cleaning up test/development webhooks
- The integration using the webhook has been decommissioned
- The webhook is failing consistently and needs to be recreated

Workflow:
1. Use webhooks/list to get the ID of the webhook you want to delete
2. Call webhooks/delete with the webhook ID
3. Confirm deletion was successful

Important notes:
- This action is permanent and cannot be undone
- Deleting a webhook will immediately stop all notifications
- You can recreate a webhook with the same settings later if needed
- Use webhooks/list after deletion to verify it was removed

Example:
- Delete webhook: { "id": 123 }

Best practices:
- Always verify the webhook ID before deletion
- Document which webhooks are deleted and why
- Consider disabling temporarily instead if you might need it again
- Keep track of webhook configurations for recreating if needed`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'number',
            description: 'ID of the webhook to delete (required)',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteWebhookSchema.parse(args);
        return client.delete(`/webhooks/${validated.id}`);
      },
    },
  };
}
