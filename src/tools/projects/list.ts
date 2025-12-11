import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Project } from '../../types/pipedrive-api.js';

const ListProjectsArgsSchema = z.object({
  cursor: z.string().optional().describe('Pagination cursor'),
  limit: z.number().default(100).describe('Items per page (max 500)'),
  filter_id: z.number().optional().describe('Filter by filter ID'),
  status: z
    .string()
    .optional()
    .describe('Comma-separated statuses (open, completed, canceled, deleted)'),
  phase_id: z.number().optional().describe('Filter by phase ID'),
  include_archived: z.boolean().optional().describe('Include archived projects'),
});

interface CursorPaginatedResponse<T> {
  success: boolean;
  data: T[];
  additional_data?: {
    next_cursor?: string;
  };
}

export function createListProjectsTool(client: PipedriveClient) {
  return {
    name: 'projects_list',
    description:
      'List projects with cursor-based pagination. Returns projects with filtering options by status, phase, and archive state.',
    inputSchema: {
      type: 'object',
      properties: {
        cursor: { type: 'string', description: 'Pagination cursor' },
        limit: { type: 'number', description: 'Items per page (max 500)', default: 100 },
        filter_id: { type: 'number', description: 'Filter by filter ID' },
        status: {
          type: 'string',
          description: 'Comma-separated statuses (open, completed, canceled, deleted)',
        },
        phase_id: { type: 'number', description: 'Filter by phase ID' },
        include_archived: { type: 'boolean', description: 'Include archived projects' },
      },
    },
    handler: async (args: unknown) => {
      const parsed = ListProjectsArgsSchema.parse(args);

      const params: Record<string, string | number | boolean> = {
        limit: parsed.limit,
      };

      if (parsed.cursor !== undefined) params.cursor = parsed.cursor;
      if (parsed.filter_id !== undefined) params.filter_id = parsed.filter_id;
      if (parsed.status !== undefined) params.status = parsed.status;
      if (parsed.phase_id !== undefined) params.phase_id = parsed.phase_id;
      if (parsed.include_archived !== undefined) params.include_archived = parsed.include_archived;

      const response = await client.get<CursorPaginatedResponse<Project>>(
        '/projects',
        params,
        { enabled: true, ttl: 300000 } // 5 min cache
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
