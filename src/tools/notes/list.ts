import type { PipedriveClient } from '../../pipedrive-client.js';
import { ListNotesSchema } from '../../schemas/note.js';

export function getListNotesTool(client: PipedriveClient) {
  return {
    'notes_list': {
      description: `List notes with pagination and filtering options.

Returns a paginated list of notes. Use filters to narrow results by associated entity.

Workflow tips:
- Filter by entity to get notes for specific deals, persons, organizations, or leads
- Filter by user_id to get notes by specific user
- Use pinned flags to filter pinned notes
- Sort by add_time, update_time, or content
- Use start/limit for pagination (default limit: 100, max: 500)

Common use cases:
- List all notes for a deal: { "deal_id": 123 }
- List all notes for a person: { "person_id": 456 }
- List pinned notes: { "deal_id": 123, "pinned_to_deal_flag": true }
- List notes by user: { "user_id": 789 }
- Recent notes first: { "sort": "add_time", "sort_by": "desc" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          deal_id: { type: 'number', description: 'Filter by deal ID' },
          person_id: { type: 'number', description: 'Filter by person ID' },
          org_id: { type: 'number', description: 'Filter by organization ID' },
          lead_id: { type: 'number', description: 'Filter by lead ID' },
          user_id: { type: 'number', description: 'Filter by user (creator) ID' },
          sort: {
            type: 'string',
            description: 'Field to sort by (e.g., add_time, update_time, content)',
          },
          sort_by: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort direction',
          },
          pinned_to_deal_flag: { type: 'boolean', description: 'Filter notes pinned to deals' },
          pinned_to_person_flag: { type: 'boolean', description: 'Filter notes pinned to persons' },
          pinned_to_organization_flag: {
            type: 'boolean',
            description: 'Filter notes pinned to organizations',
          },
          pinned_to_lead_flag: { type: 'boolean', description: 'Filter notes pinned to leads' },
          start: { type: 'number', description: 'Pagination start', default: 0 },
          limit: { type: 'number', description: 'Number of items to return', default: 100 },
        },
      },
      handler: async (args: unknown) => {
        const validated = ListNotesSchema.parse(args);
        const { start, limit, ...filters } = validated;

        return client.get(
          '/notes',
          {
            ...filters,
            start: start ?? 0,
            limit: limit ?? 100,
          },
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },
  };
}
