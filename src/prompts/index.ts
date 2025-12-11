import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Setup MCP Prompts for the Pipedrive server
 *
 * Prompts provide guided workflows for common Pipedrive operations.
 * They are templates that help users execute multi-step processes
 * with proper context and instructions.
 *
 * Available prompts:
 * - create-deal-workflow - Guide through creating a complete deal with contact and activity
 * - sales-qualification - Run BANT qualification checklist on a deal
 * - follow-up-sequence - Create a sequence of follow-up activities
 * - weekly-pipeline-review - Generate weekly pipeline report
 * - lost-deal-analysis - Analyze lost deals for patterns
 *
 * @param server - The MCP server instance
 */
export function setupPrompts(server: Server) {
  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'create-deal-workflow',
          description: 'Guide through creating a complete deal with person and initial activity',
          arguments: [
            { name: 'dealTitle', description: 'Title of the deal', required: true },
            { name: 'personName', description: 'Name of the contact person', required: true },
            { name: 'personEmail', description: 'Email of the contact', required: false },
          ],
        },
        {
          name: 'sales-qualification',
          description: 'Run BANT qualification checklist on a deal',
          arguments: [{ name: 'dealId', description: 'ID of the deal to qualify', required: true }],
        },
        {
          name: 'follow-up-sequence',
          description: 'Create a sequence of follow-up activities',
          arguments: [
            { name: 'dealId', description: 'ID of the deal to follow up on', required: true },
            {
              name: 'days',
              description: 'Number of days to spread activities over (default: 7)',
              required: false,
            },
          ],
        },
        {
          name: 'weekly-pipeline-review',
          description: 'Generate weekly pipeline report',
          arguments: [],
        },
        {
          name: 'lost-deal-analysis',
          description: 'Analyze lost deals for patterns',
          arguments: [
            {
              name: 'startDate',
              description: 'Start date in YYYY-MM-DD format',
              required: true,
            },
            {
              name: 'endDate',
              description: 'End date in YYYY-MM-DD format',
              required: true,
            },
          ],
        },
      ],
    };
  });

  // Get specific prompt
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'create-deal-workflow') {
      const personEmail = args?.personEmail ? ` (${args.personEmail})` : '';
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create a new deal workflow:
1. Create or find person: ${args?.personName}${personEmail}
2. Create deal: "${args?.dealTitle}" linked to this person
3. Add initial follow-up activity for tomorrow

Please execute these steps and provide a summary.`,
            },
          },
        ],
      };
    }

    if (name === 'sales-qualification') {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Run sales qualification (BANT) for deal #${args?.dealId}:

1. Get deal details
2. Check qualification criteria:
   - Budget: Does the prospect have budget allocated?
   - Authority: Are we talking to the decision maker?
   - Need: Is there a clear business need?
   - Timeline: Is there a defined purchase timeline?

3. Update deal with qualification notes
4. Recommend next action based on qualification

Please analyze and provide qualification report.`,
            },
          },
        ],
      };
    }

    if (name === 'follow-up-sequence') {
      const days = args?.days || 7;
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create follow-up activity sequence for deal #${args?.dealId} over ${days} days:

1. Get deal and person details
2. Create activities:
   - Day 1: Email follow-up
   - Day 3: Phone call
   - Day 7: Final check-in

3. Link all activities to deal and person
4. Provide activity schedule summary

Please create the sequence.`,
            },
          },
        ],
      };
    }

    if (name === 'weekly-pipeline-review') {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Generate weekly pipeline review report:

1. Get all open deals grouped by stage
2. Calculate metrics:
   - Total deal value by stage
   - Number of deals won/lost this week
   - Deals approaching close date
   - Stale deals (no activity in 7+ days)

3. Provide recommendations for each stage
4. Format as markdown report

Please generate the report.`,
            },
          },
        ],
      };
    }

    if (name === 'lost-deal-analysis') {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Analyze lost deals from ${args?.startDate} to ${args?.endDate}:

1. Get all deals lost in date range
2. Group by lost_reason
3. Calculate:
   - Total value lost
   - Most common lost reasons
   - Average deal size lost
   - Lost deals by stage

4. Provide insights and recommendations
5. Format as analysis report

Please analyze and report findings.`,
            },
          },
        ],
      };
    }

    throw new Error(`Unknown prompt: ${name}`);
  });
}
