import type { PipedriveClient } from '../../pipedrive-client.js';
import { FindUsersSchema } from '../../schemas/user.js';

export function getFindUsersTool(client: PipedriveClient) {
  return {
    'users/find': {
      description: `Find users by name or email.

Searches for users within the company by name or email address. Returns matching users with their details.

Workflow tips:
- Faster than filtering users/list results
- Can search by name (default) or email
- Partial matches are supported
- Useful for autocomplete and user lookup
- Cached for 5 minutes

Common use cases:
- Find by name: { "term": "John" }
- Find by email: { "term": "john@example.com", "search_by_email": 1 }
- Quick user lookup for assignments`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          term: { type: 'string', description: 'Search term to find users by name' },
          search_by_email: {
            type: 'number',
            description: 'Whether to search by email address instead of name (0 or 1)',
          },
        },
        required: ['term'],
      },
      handler: async (args: unknown) => {
        const { term, search_by_email } = FindUsersSchema.parse(args);
        const params: { term: string; search_by_email?: number } = { term };

        if (search_by_email !== undefined) {
          params.search_by_email = search_by_email ? 1 : 0;
        }

        return client.get('/users/find', params, { enabled: true, ttl: 300000 });
      },
    },
  };
}
