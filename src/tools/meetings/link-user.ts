import type { PipedriveClient } from '../../pipedrive-client.js';
import { LinkUserProviderSchema } from '../../schemas/meeting.js';

export function getLinkUserProviderTool(client: PipedriveClient) {
  return {
    'meetings/link_user_provider': {
      description: `Link a user with the installed video call integration.

Creates a connection between a Pipedrive user and a video calling app provider. This must be called after a user installs the video calling app so that the user's information is sent to Pipedrive.

Required fields:
- user_provider_id: UUID linking the user to the integration
- user_id: ID of the Pipedrive user
- company_id: ID of the company
- marketplace_client_id: Marketplace client identifier

Workflow tips:
- This endpoint is typically called by video calling providers
- The link allows the user to access video calling features within Pipedrive
- All four parameters are required for successful linking
- Returns success message when link is created

Common use cases:
- Initial setup: { "user_provider_id": "1e3943c9-6395-462b-b432-1f252c017f3d", "user_id": 123, "company_id": 456, "marketplace_client_id": "57da5c3c55a82bb4" }
- Enable video calling features for a new user
- Connect user account after OAuth flow`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          user_provider_id: {
            type: 'string',
            description: 'Unique identifier linking a user to the installed integration (UUID format)'
          },
          user_id: {
            type: 'number',
            description: 'ID of the user to link'
          },
          company_id: {
            type: 'number',
            description: 'ID of the company'
          },
          marketplace_client_id: {
            type: 'string',
            description: 'Marketplace client identifier for the integration'
          },
        },
        required: ['user_provider_id', 'user_id', 'company_id', 'marketplace_client_id'],
      },
      handler: async (args: unknown) => {
        const data = LinkUserProviderSchema.parse(args);
        return client.post('/meetings/userProviderLinks', data);
      },
    },
  };
}
