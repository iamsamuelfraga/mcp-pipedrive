import type { PipedriveClient } from '../../pipedrive-client.js';
import { MarkDealAsWonSchema, MarkDealAsLostSchema } from '../../schemas/deal.js';

export function getStatusTools(client: PipedriveClient) {
  return {
    'deals_mark_as_won': {
      description: `Mark a deal as won.

Updates the deal status to "won" and moves it to the appropriate won stage in the pipeline.

Workflow tips:
- Automatically moves deal to won stage
- Updates deal close date to current date
- Triggers won deal notifications and automations
- More convenient than using deals/update with status field
- Use deals/get first to verify the deal details

Common use cases:
- Mark deal as won: { "id": 123 }
- Close successful deals quickly
- Trigger win-based workflows
- Update sales metrics`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to mark as won' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id } = MarkDealAsWonSchema.parse(args);
        return client.put(`/deals/${id}`, { status: 'won' });
      },
    },

    'deals_mark_as_lost': {
      description: `Mark a deal as lost.

Updates the deal status to "lost" and optionally records the reason why the deal was lost.

Workflow tips:
- Automatically moves deal to lost stage
- Lost reason helps track why deals fail
- Triggers lost deal notifications and automations
- Use for pipeline health and loss analysis
- More convenient than using deals/update with status field
- Lost reason is important for improving sales process

Common use cases:
- Mark deal as lost: { "id": 123 }
- Mark with reason: { "id": 123, "lost_reason": "Competitor pricing" }
- Common lost reasons: "No budget", "Chose competitor", "Timing not right", "No response"
- Track loss patterns for improvement`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the deal to mark as lost' },
          lost_reason: { type: 'string', description: 'Reason why the deal was lost' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const { id, lost_reason } = MarkDealAsLostSchema.parse(args);
        const body: { status: string; lost_reason?: string } = { status: 'lost' };
        if (lost_reason) {
          body.lost_reason = lost_reason;
        }
        return client.put(`/deals/${id}`, body);
      },
    },
  };
}
