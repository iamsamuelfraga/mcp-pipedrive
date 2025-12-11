import type { PipedriveClient } from '../../pipedrive-client.js';
import { MergeOrganizationsSchema } from '../../schemas/organization.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for merging two organizations
 */
export function getMergeOrganizationsTool(client: PipedriveClient) {
  return {
    name: 'organizations_merge',
    description: `Merge two organizations into one.

Combines two organization records, moving all related data to the primary organization:
- All deals are transferred
- All activities are transferred
- All notes are transferred
- All files are transferred
- All persons are transferred
- Custom field data is merged
- The secondary organization is deleted

WARNING: This action is irreversible. The organization specified in merge_with_id will be deleted permanently.

Best practices:
1. Review both organizations thoroughly before merging
2. Ensure you're merging duplicates, not different organizations
3. The organization with ID 'id' will be kept (primary)
4. The organization with 'merge_with_id' will be deleted (secondary)
5. Use organizations/get to verify both records first

Use cases:
- Removing duplicate organizations
- Consolidating split records
- Data cleanup and maintenance
- CRM hygiene improvements`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'ID of the organization to keep (primary organization)',
        },
        merge_with_id: {
          type: 'number',
          description: 'ID of the organization to merge and delete (secondary organization)',
        },
      },
      required: ['id', 'merge_with_id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = MergeOrganizationsSchema.parse(params);

      const response = await client.put<PipedriveResponse<unknown>>(
        `/organizations/${validated.id}/merge`,
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
