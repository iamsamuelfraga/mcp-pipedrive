import type { PipedriveClient } from '../../pipedrive-client.js';
import { MergePersonsSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for merging two persons
 */
export function getMergePersonsTool(client: PipedriveClient) {
  return {
    name: 'persons/merge',
    description: `Merge two persons into one.

Combines two person records, moving all related data to the primary person:
- All deals are transferred
- All activities are transferred
- All notes are transferred
- All files are transferred
- Email and phone numbers are combined
- Custom field data is merged
- The secondary person is deleted

WARNING: This action is irreversible. The person specified in merge_with_id will be deleted permanently.

Best practices:
1. Review both persons thoroughly before merging
2. Ensure you're merging duplicates, not different people
3. The person with ID 'id' will be kept (primary)
4. The person with 'merge_with_id' will be deleted (secondary)
5. Use persons/get to verify both records first

Use cases:
- Removing duplicate persons
- Consolidating split records
- Data cleanup and maintenance
- CRM hygiene improvements`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the person to keep (primary person)',
        },
        merge_with_id: {
          type: 'number',
          description: 'ID of the person to merge and delete (secondary person)',
        },
      },
      required: ['id', 'merge_with_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = MergePersonsSchema.parse(params);

      const response = await client.put<PipedriveResponse<unknown>>(
        `/persons/${validated.id}/merge`,
        { merge_with_id: validated.merge_with_id }
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
