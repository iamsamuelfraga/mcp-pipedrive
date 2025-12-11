import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { createCreateProjectTool } from '../projects/create.js';
import { createGetProjectPlanTool } from '../projects/plan.js';

describe('Projects Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('projects/create', () => {
    it('should create a project with required fields', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          title: 'New Project',
          board_id: 1,
          phase_id: 1,
          status: 'open',
          creator_id: 1,
          add_time: '2025-12-10 10:00:00',
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tool = createCreateProjectTool(mockClient);
      const projectData = {
        title: 'New Project',
        board_id: 1,
        phase_id: 1,
      };

      const result = await tool.handler(projectData);

      expect(mockClient.post).toHaveBeenCalledWith('/projects', projectData);
      expect(result.content[0].text).toContain('New Project');
    });

    it('should create a project with full details', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          title: 'Complex Project',
          board_id: 1,
          phase_id: 2,
          description: 'A detailed project',
          status: 'open',
          owner_id: 5,
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          deal_ids: [10, 20, 30],
          org_id: 100,
          person_id: 200,
          labels: [1, 2],
          template_id: 5,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tool = createCreateProjectTool(mockClient);
      const projectData = {
        title: 'Complex Project',
        board_id: 1,
        phase_id: 2,
        description: 'A detailed project',
        status: 'open' as const,
        owner_id: 5,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        deal_ids: [10, 20, 30],
        org_id: 100,
        person_id: 200,
        labels: [1, 2],
        template_id: 5,
      };

      const result = await tool.handler(projectData);

      expect(mockClient.post).toHaveBeenCalledWith('/projects', projectData);
      expect(result.content[0].text).toContain('Complex Project');
      expect(result.content[0].text).toContain('A detailed project');
    });

    it('should validate required fields', async () => {
      const tool = createCreateProjectTool(mockClient);

      await expect(tool.handler({ title: 'Test' })).rejects.toThrow();
      await expect(tool.handler({ board_id: 1 })).rejects.toThrow();
      await expect(tool.handler({ phase_id: 1 })).rejects.toThrow();
      await expect(tool.handler({ title: 'Test', board_id: 1 })).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate status enum', async () => {
      const tool = createCreateProjectTool(mockClient);

      await expect(
        tool.handler({
          title: 'Test',
          board_id: 1,
          phase_id: 1,
          status: 'invalid_status',
        })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate positive IDs', async () => {
      const tool = createCreateProjectTool(mockClient);

      await expect(
        tool.handler({
          title: 'Test',
          board_id: -1,
          phase_id: 1,
        })
      ).rejects.toThrow();

      await expect(
        tool.handler({
          title: 'Test',
          board_id: 1,
          phase_id: 0,
        })
      ).rejects.toThrow();
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('projects/plan/get', () => {
    it('should get project plan', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          title: 'Project Plan',
          board_id: 1,
          phase_id: 1,
          tasks_count: 10,
          activities_count: 5,
          done_tasks_count: 3,
          done_activities_count: 2,
          planned_activities: [
            {
              id: 101,
              subject: 'Kickoff Meeting',
              type: 'meeting',
              due_date: '2025-12-15',
            },
          ],
          planned_tasks: [
            {
              id: 201,
              description: 'Complete documentation',
              due_date: '2025-12-20',
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const tool = createGetProjectPlanTool(mockClient);
      const result = await tool.handler({ id: 1 });

      expect(mockClient.get).toHaveBeenCalledWith('/projects/1/plan', undefined);
      expect(result.content[0].text).toContain('Project Plan');
      expect(result.content[0].text).toContain('Kickoff Meeting');
    });

    it('should validate required id', async () => {
      const tool = createGetProjectPlanTool(mockClient);

      await expect(tool.handler({})).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should validate positive id', async () => {
      const tool = createGetProjectPlanTool(mockClient);

      await expect(tool.handler({ id: -1 })).rejects.toThrow();
      await expect(tool.handler({ id: 0 })).rejects.toThrow();
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });
});
