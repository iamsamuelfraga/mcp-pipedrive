import type { PipedriveClient } from '../../pipedrive-client.js';
import { BulkDeleteDealFieldsSchema } from '../../schemas/deal-field.js';
import type { PipedriveResponse } from '../../types/common.js';

export function getBulkDeleteDealFieldsTool(client: PipedriveClient) {
  return {
    fields_bulk_delete_deal_fields: {
      description: `Delete multiple custom deal fields in a single request.

Accepts either:
- a comma-separated string of field IDs (e.g. \`"123,456,789"\`)
- an array of numeric IDs (e.g. \`[123, 456, 789]\`)

Both shapes are normalized to Pipedrive's expected \`?ids=\` query parameter.`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          ids: {
            description: 'Comma-separated string of field IDs or array of numeric IDs to delete',
            oneOf: [
              { type: 'string', pattern: '^\\d+(,\\d+)*$' },
              { type: 'array', items: { type: 'number' }, minItems: 1 },
            ],
          },
        },
        required: ['ids'],
      },
      handler: async (args: unknown) => {
        const parsed = BulkDeleteDealFieldsSchema.parse(args);
        const ids = Array.isArray(parsed.ids) ? parsed.ids.join(',') : parsed.ids;

        const response = await client.delete<PipedriveResponse<{ id: number[] }>>('/dealFields', {
          ids,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      },
    },
  };
}
