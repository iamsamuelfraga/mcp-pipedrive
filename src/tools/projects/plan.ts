import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { ProjectPlanItem } from '../../types/pipedrive-api.js';

const GetProjectPlanArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
});

const UpdateProjectPlanActivityArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
  activity_id: z.number().positive().describe('Activity ID'),
  phase_id: z.number().optional().describe('Phase ID'),
  group_id: z.number().optional().describe('Group ID'),
});

const UpdateProjectPlanTaskArgsSchema = z.object({
  id: z.number().positive().describe('Project ID'),
  task_id: z.number().positive().describe('Task ID'),
  phase_id: z.number().optional().describe('Phase ID'),
  group_id: z.number().optional().describe('Group ID'),
});

interface ListResponse<T> {
  success: boolean;
  data: T[];
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export function createGetProjectPlanTool(client: PipedriveClient) {
  return {
    name: 'projects_plan_get',
    description:
      'Get project plan showing all tasks and activities with their phases and groups. Returns plan structure.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
      },
      required: ['id'],
    },
    handler: async (args: unknown) => {
      const parsed = GetProjectPlanArgsSchema.parse(args);

      const response = await client.get<ListResponse<ProjectPlanItem>>(
        `/projects/${parsed.id}/plan`,
        {},
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

export function createUpdateProjectPlanActivityTool(client: PipedriveClient) {
  return {
    name: 'projects_plan_activities_update',
    description:
      'Update an activity phase or group in a project plan. Allows moving activities between phases and groups.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
        activity_id: { type: 'number', description: 'Activity ID' },
        phase_id: { type: 'number', description: 'Phase ID' },
        group_id: { type: 'number', description: 'Group ID' },
      },
      required: ['id', 'activity_id'],
    },
    handler: async (args: unknown) => {
      const parsed = UpdateProjectPlanActivityArgsSchema.parse(args);
      const { id, activity_id, ...updateData } = parsed;

      const response = await client.put<SingleResponse<ProjectPlanItem>>(
        `/projects/${id}/plan/activities/${activity_id}`,
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

export function createUpdateProjectPlanTaskTool(client: PipedriveClient) {
  return {
    name: 'projects_plan_tasks_update',
    description:
      'Update a task phase or group in a project plan. Allows moving tasks between phases and groups.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Project ID' },
        task_id: { type: 'number', description: 'Task ID' },
        phase_id: { type: 'number', description: 'Phase ID' },
        group_id: { type: 'number', description: 'Group ID' },
      },
      required: ['id', 'task_id'],
    },
    handler: async (args: unknown) => {
      const parsed = UpdateProjectPlanTaskArgsSchema.parse(args);
      const { id, task_id, ...updateData } = parsed;

      const response = await client.put<SingleResponse<ProjectPlanItem>>(
        `/projects/${id}/plan/tasks/${task_id}`,
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
