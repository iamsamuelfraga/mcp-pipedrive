import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Organization } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

const GetOrganizationArgsSchema = z.object({
  id: z.number().describe('Organization ID'),
});

export function createGetOrganizationTool(client: PipedriveClient) {
  return {
    name: 'organizations_get',
    description: 'Get details of a specific organization by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Organization ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetOrganizationArgsSchema.parse(args);

      const response = await client.get<PipedriveResponse<Organization>>(
        `/organizations/${parsed.id}`,
        {},
        { enabled: true, ttl: 60000 }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
