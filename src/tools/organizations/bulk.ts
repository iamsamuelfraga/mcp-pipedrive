import type { PipedriveClient } from '../../pipedrive-client.js';
import { BulkDeleteOrganizationsSchema } from '../../schemas/organization.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for bulk deleting multiple organizations
 */
export function getBulkDeleteOrganizationsTool(client: PipedriveClient) {
  return {
    name: 'organizations/bulk_delete',
    description: `Delete multiple organizations in bulk.

Efficiently deletes multiple organization records in a single operation. This is useful for:
- Data cleanup and maintenance
- Removing duplicate records
- Batch operations after data imports
- CRM hygiene improvements
- GDPR and data retention compliance

WARNING: This action is irreversible. All specified organizations will be permanently deleted,
including:
- Organization data and custom fields
- Associated notes (if configured)
- Follow relationships
- Activity history (may be preserved depending on settings)

Best practices:
1. Always verify the IDs before deletion
2. Consider exporting data as backup
3. Check if organizations have active deals
4. Review person associations
5. Ensure you have proper permissions

The 'ids' parameter should be a comma-separated string of organization IDs.
Example: "123,456,789" will delete organizations with IDs 123, 456, and 789.

Rate limits may apply for very large deletions. Consider batching if deleting
hundreds or thousands of records.`,
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'string',
          description: 'Comma-separated list of organization IDs to delete (e.g., "123,456,789")',
        },
      },
      required: ['ids'],
    } as const,
    handler: async (params: unknown) => {
      const validated = BulkDeleteOrganizationsSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ success: boolean }>>(
        '/organizations',
        { ids: validated.ids }
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
