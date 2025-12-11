import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Project } from '../../types/pipedrive-api.js';

const UpdateProjectArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
  title: z.string().min(1).optional().describe('Project title'),
  board_id: z.number().optional().describe('Board ID'),
  phase_id: z.number().optional().describe('Phase ID'),
  description: z.string().optional().describe('Project description'),
  status: z.enum(['open', 'completed', 'canceled', 'deleted']).optional().describe('Project status'),
  owner_id: z.number().optional().describe('Owner user ID'),
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  deal_ids: z.array(z.number()).optional().describe('Array of deal IDs'),
  org_id: z.number().optional().describe('Organization ID'),
  person_id: z.number().optional().describe('Person ID'),
  labels: z.array(z.number()).optional().describe('Array of label IDs'),
});

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export function createUpdateProjectTool(client: PipedriveClient) {
  return {
    name: 'projects/update',
    description: 'Update an existing project. Provide the project ID and fields to update.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
        title: { type: 'string', description: 'Project title' },
        board_id: { type: 'number', description: 'Board ID' },
        phase_id: { type: 'number', description: 'Phase ID' },
        description: { type: 'string', description: 'Project description' },
        status: { type: 'string', enum: ['open', 'completed', 'canceled', 'deleted'], description: 'Project status' },
        owner_id: { type: 'number', description: 'Owner user ID' },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        deal_ids: { type: 'array', items: { type: 'number' }, description: 'Array of deal IDs' },
        org_id: { type: 'number', description: 'Organization ID' },
        person_id: { type: 'number', description: 'Person ID' },
        labels: { type: 'array', items: { type: 'number' }, description: 'Array of label IDs' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = UpdateProjectArgsSchema.parse(args);
      const { id, ...updateData } = parsed;

      const response = await client.put<SingleResponse<Project>>(
        `/projects/${id}`,
        updateData
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
