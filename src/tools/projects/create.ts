import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Project } from '../../types/pipedrive-api.js';

const CreateProjectArgsSchema = z.object({
  title: z.string().min(1).describe('Project title'),
  board_id: z.number().positive().describe('Board ID'),
  phase_id: z.number().positive().describe('Phase ID'),
  description: z.string().optional().describe('Project description'),
  status: z
    .enum(['open', 'completed', 'canceled', 'deleted'])
    .optional()
    .describe('Project status'),
  owner_id: z.number().optional().describe('Owner user ID'),
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  deal_ids: z.array(z.number()).optional().describe('Array of deal IDs'),
  org_id: z.number().optional().describe('Organization ID'),
  person_id: z.number().optional().describe('Person ID'),
  labels: z.array(z.number()).optional().describe('Array of label IDs'),
  template_id: z.number().optional().describe('Template ID'),
});

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export function createCreateProjectTool(client: PipedriveClient) {
  return {
    name: 'projects_create',
    description:
      'Create a new project. Requires title, board_id, and phase_id. Optionally include description, dates, deals, and labels.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Project title' },
        board_id: { type: 'number', description: 'Board ID' },
        phase_id: { type: 'number', description: 'Phase ID' },
        description: { type: 'string', description: 'Project description' },
        status: {
          type: 'string',
          enum: ['open', 'completed', 'canceled', 'deleted'],
          description: 'Project status',
        },
        owner_id: { type: 'number', description: 'Owner user ID' },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        deal_ids: { type: 'array', items: { type: 'number' }, description: 'Array of deal IDs' },
        org_id: { type: 'number', description: 'Organization ID' },
        person_id: { type: 'number', description: 'Person ID' },
        labels: { type: 'array', items: { type: 'number' }, description: 'Array of label IDs' },
        template_id: { type: 'number', description: 'Template ID' },
      },
      required: ['title', 'board_id', 'phase_id'],
    },
    handler: async (args: unknown) => {
      const parsed = CreateProjectArgsSchema.parse(args);

      const response = await client.post<SingleResponse<Project>>('/projects', parsed);

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
