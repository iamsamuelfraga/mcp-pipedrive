import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeleteUserProviderLinkSchema } from '../../schemas/meeting.js';

export function getDeleteUserProviderLinkTool(client: PipedriveClient) {
  return {
    'meetings/delete_user_provider_link': {
      description: `Delete the link between a user and the installed video call integration.

Removes the connection between a Pipedrive user and a video calling app provider. After deletion, the user will no longer have access to the video calling integration features.

Required fields:
- id: UUID of the link to delete

Workflow tips:
- Use this when a user uninstalls the video calling app
- The ID is the same user_provider_id used when creating the link
- Deletion is immediate and cannot be undone
- User must re-link if they want to use the integration again

Common use cases:
- Remove integration: { "id": "1e3943c9-6395-462b-b432-1f252c017f3d" }
- User uninstalls app
- Disable video calling features for a user
- Clean up after removing user access`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description:
              'Unique identifier linking a user to the installed integration (UUID format)',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = DeleteUserProviderLinkSchema.parse(args);
        return client.delete(`/meetings/userProviderLinks/${id}`);
      },
    },
  };
}
