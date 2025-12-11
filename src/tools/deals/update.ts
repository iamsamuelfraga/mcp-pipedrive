import type { PipedriveClient } from '../../pipedrive-client.js';
import { UpdateDealSchema, MoveDealStageSchema } from '../../schemas/deal.js';

export function getUpdateDealTools(client: PipedriveClient) {
  return {
    'deals/update': {
      description: `Update an existing deal.

Updates one or more fields of an existing deal. Only provide fields you want to change.

Workflow tips:
- Only specify fields you want to update
- Use deals/get first to see current values
- Use deals/move_to_stage for simple stage changes
- To mark as won/lost, update status field

Common use cases:
- Update value: { "id": 123, "value": 7500 }
- Change title: { "id": 123, "title": "Updated Deal Name" }
- Mark as won: { "id": 123, "status": "won" }
- Update multiple fields: { "id": 123, "value": 10000, "expected_close_date": "2024-12-31", "probability": 75 }
- Move to new stage: { "id": 123, "stage_id": 5 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to update' },
          title: { type: 'string', description: 'Deal title' },
          value: { type: 'number', description: 'Deal value' },
          currency: { type: 'string', description: '3-letter currency code' },
          user_id: { type: 'number', description: 'ID of the user who will own this deal' },
          person_id: { type: 'number', description: 'ID of the person' },
          org_id: { type: 'number', description: 'ID of the organization' },
          pipeline_id: { type: 'number', description: 'ID of the pipeline' },
          stage_id: { type: 'number', description: 'ID of the stage' },
          status: {
            type: 'string',
            enum: ['open', 'won', 'lost'],
            description: 'Deal status',
          },
          expected_close_date: {
            type: 'string',
            description: 'Expected close date in YYYY-MM-DD format',
          },
          probability: { type: 'number', description: 'Deal success probability (0-100)' },
          lost_reason: { type: 'string', description: 'Reason why the deal was lost' },
          visible_to: {
            type: 'string',
            enum: ['1', '3', '5', '7'],
            description: 'Visibility setting',
          },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, ...updates } = UpdateDealSchema.parse(args);
        return client.put(`/deals/${id}`, updates);
      },
    },

    'deals/move_to_stage': {
      description: `Move a deal to a different stage in the pipeline.

Convenience tool to move a deal to another stage. Use this instead of deals/update when only changing stages.

Workflow tips:
- Use pipelines/list to get available stages
- Moving stages may trigger automations in Pipedrive
- Stage must be in the same pipeline or specify pipeline_id

Common use cases:
- Move to next stage: { "id": 123, "stage_id": 5 }
- Move to won/lost stage: { "id": 123, "stage_id": 10 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to move' },
          stage_id: { type: 'number', description: 'ID of the stage to move the deal to' },
        },
        required: ['id', 'stage_id'],
      },
      handler: async (args: unknown) => {
        const { id, stage_id } = MoveDealStageSchema.parse(args);
        return client.put(`/deals/${id}`, { stage_id });
      },
    },
  };
}
