import type { PipedriveClient } from '../../pipedrive-client.js';
import { BulkDeletePersonsSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for bulk deleting multiple persons
 */
export function getBulkDeletePersonsTool(client: PipedriveClient) {
  return {
    name: 'persons/bulk_delete',
    description: `Delete multiple persons in bulk.

Efficiently deletes multiple person records in a single operation. This is useful for:
- Data cleanup and maintenance
- Removing duplicate records
- Batch operations after data imports
- CRM hygiene improvements
- GDPR and data retention compliance

WARNING: This action is irreversible. All specified persons will be permanently deleted,
including:
- Person data and custom fields
- Associated notes (if configured)
- Follow relationships
- Activity history (may be preserved depending on settings)

Best practices:
1. Always verify the IDs before deletion
2. Consider exporting data as backup
3. Check if persons have active deals
4. Review organization associations
5. Ensure you have proper permissions

The 'ids' parameter should be a comma-separated string of person IDs.
Example: "123,456,789" will delete persons with IDs 123, 456, and 789.

Rate limits may apply for very large deletions. Consider batching if deleting
hundreds or thousands of records.`,
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'string',
          description: 'Comma-separated list of person IDs to delete (e.g., "123,456,789")',
        },
      },
      required: ['ids'],
    } as const,
    handler: async (params: unknown) => {
      const validated = BulkDeletePersonsSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ success: boolean }>>(
        '/persons',
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
