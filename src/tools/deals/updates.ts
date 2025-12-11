import type { PipedriveClient } from '../../pipedrive-client.js';
import { GetDealSchema } from '../../schemas/deal.js';

export function getUpdateTools(client: PipedriveClient) {
  return {
    'deals/list_field_updates': {
      description: `List updates about deal field values (changelog).

Returns the complete changelog of a deal, showing all field value changes over time.

Workflow tips:
- See who changed what and when
- Useful for audit trails and compliance
- Shows old and new values for each field
- Includes timestamp and user information
- Cached for 5 minutes

Common use cases:
- View full changelog: { "id": 123 }
- Audit field changes for compliance
- Track who updated deal value or stage
- Understand deal modification history`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetDealSchema.parse(args);
        return client.get(`/deals/${id}/changelog`, undefined, { enabled: true, ttl: 300000 });
      },
    },

    'deals/list_updates': {
      description: `List updates about a deal (flow).

Returns a chronological list of all updates and activities related to a deal, including field changes, notes, emails, and other events.

Workflow tips:
- Shows complete activity feed for a deal
- Includes field updates, notes, emails, and activities
- Chronologically ordered
- More comprehensive than changelog
- Cached for 5 minutes

Common use cases:
- View deal activity feed: { "id": 123 }
- See all interactions and changes
- Track deal progression timeline
- Review communication history`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetDealSchema.parse(args);
        return client.get(`/deals/${id}/flow`, undefined, { enabled: true, ttl: 300000 });
      },
    },

    'deals/list_participant_updates': {
      description: `List updates about participants of a deal.

Returns the changelog of participants added to or removed from a deal.

Workflow tips:
- Track when participants were added/removed
- See who made participant changes
- Useful for team collaboration tracking
- Shows participant modification history
- Cached for 5 minutes

Common use cases:
- View participant history: { "id": 123 }
- Track team involvement over time
- Audit participant changes
- Understand collaboration patterns`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = GetDealSchema.parse(args);
        return client.get(`/deals/${id}/participantsChangelog`, undefined, { enabled: true, ttl: 300000 });
      },
    },
  };
}
