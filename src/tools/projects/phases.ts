import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { ProjectPhase } from '../../types/pipedrive-api.js';

const GetProjectPhasesArgsSchema = z.object({
  board_id: z.number().positive().describe('Board ID'),
});

const GetProjectPhaseArgsSchema = z.object({
  id: z.number().positive().describe('Phase ID'),
});

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export function createGetProjectPhasesTool(client: PipedriveClient) {
  return {
    name: 'projects_phases_list',
    description:
      'Get all active project phases under a specific board. Returns phases ordered by their order number.',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: { type: 'number', description: 'Board ID' },
      },
      required: ['board_id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectPhasesArgsSchema.parse(args);

      const response = await client.get<ListResponse<ProjectPhase>>(
        '/projects/phases',
        { board_id: parsed.board_id },
        { enabled: true, ttl: 600000 } // 10 min cache
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

export function createGetProjectPhaseTool(client: PipedriveClient) {
  return {
    name: 'projects_phases_get',
    description: 'Get details of a specific project phase by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Phase ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectPhaseArgsSchema.parse(args);

      const response = await client.get<SingleResponse<ProjectPhase>>(
        `/projects/phases/${parsed.id}`,
        {},
        { enabled: true, ttl: 600000 } // 10 min cache
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
