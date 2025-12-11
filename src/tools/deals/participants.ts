import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  AddDealParticipantSchema,
  RemoveDealParticipantSchema,
  GetDealParticipantsSchema,
} from '../../schemas/deal.js';

export function getParticipantTools(client: PipedriveClient) {
  return {
    'deals/add_participant': {
      description: `Add a participant (person) to a deal.

Participants are persons who are involved in the deal beyond the primary contact.

Workflow tips:
- Use persons/search to find person IDs
- Person must exist in Pipedrive
- Deal can have multiple participants
- Different from the main person_id on the deal

Common use cases:
- Add decision maker: { "id": 123, "person_id": 456 }
- Add influencer: { "id": 789, "person_id": 101 }
- Add stakeholder: { "id": 234, "person_id": 567 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          person_id: { type: 'number', description: 'ID of the person to add as a participant' },
        },
        required: ['id', 'person_id'],
      },
      handler: async (args: unknown) => {
        const { id, person_id } = AddDealParticipantSchema.parse(args);
        return client.post(`/deals/${id}/participants`, { person_id });
      },
    },

    'deals/remove_participant': {
      description: `Remove a participant from a deal.

Removes a person from the deal's participants list.

Workflow tips:
- Use deals/list_participants to get participant IDs first
- deal_participant_id is NOT the same as person_id
- Cannot remove the primary person (person_id)

Common use cases:
- Remove participant: { "id": 123, "deal_participant_id": 456 }
- Workflow: list participants, then remove by deal_participant_id`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          deal_participant_id: {
            type: 'number',
            description: 'ID of the deal participant to remove',
          },
        },
        required: ['id', 'deal_participant_id'],
      },
      handler: async (args: unknown) => {
        const { id, deal_participant_id } = RemoveDealParticipantSchema.parse(args);
        return client.delete(`/deals/${id}/participants/${deal_participant_id}`);
      },
    },

    'deals/list_participants': {
      description: `List all participants of a deal.

Returns all persons participating in this deal.

Workflow tips:
- Shows person details for each participant
- Includes deal_participant_id needed for removal
- Paginated for deals with many participants
- Cached for 5 minutes

Common use cases:
- View all participants: { "id": 123 }
- Paginated list: { "id": 123, "start": 0, "limit": 50 }
- Before removing: list to get deal_participant_id`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, start, limit } = GetDealParticipantsSchema.parse(args);
        return client.get(
          `/deals/${id}/participants`,
          { start: start ?? 0, limit: limit ?? 100 },
          { enabled: true, ttl: 300000 }
        );
      },
    },
  };
}
