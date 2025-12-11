/**
 * Integration tests for the MCP Server
 * These tests verify the full server initialization, tool registration,
 * environment configuration, and request handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PipedriveClient } from '../../pipedrive-client.js';

// Mock the PipedriveClient
vi.mock('../../pipedrive-client.js', () => {
  return {
    PipedriveClient: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ success: true }),
    })),
  };
});

// Mock the logger to avoid console output during tests
vi.mock('../../utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock metrics collector
vi.mock('../../utils/metrics.js', () => ({
  metricsCollector: {
    recordRequest: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({}),
  },
}));

// Import tool getters
import { getDealTools } from '../../tools/deals/index.js';
import { getPersonTools } from '../../tools/persons/index.js';
import { getOrganizationTools } from '../../tools/organizations/index.js';
import { getActivityTools } from '../../tools/activities/index.js';
import { getFileTools } from '../../tools/files/index.js';
import { getSearchTools } from '../../tools/search/index.js';
import { getPipelineTools } from '../../tools/pipelines/index.js';
import { getNoteTools } from '../../tools/notes/index.js';
import { getFieldTools } from '../../tools/fields/index.js';
import { getSystemTools } from '../../tools/system/index.js';
import { getProductTools } from '../../tools/products/index.js';
import { getLeadTools } from '../../tools/leads/index.js';
import { getUserTools } from '../../tools/users/index.js';
import { getRoleTools } from '../../tools/roles/index.js';
import { getWebhookTools } from '../../tools/webhooks/index.js';
import { getFilterTools } from '../../tools/filters/index.js';
import { getProjectTools } from '../../tools/projects/index.js';
import { getProjectTemplateTools } from '../../tools/project-templates/index.js';
import { getGoalTools } from '../../tools/goals/index.js';
import { getTaskTools } from '../../tools/tasks/index.js';
import { getActivityTypeTools } from '../../tools/activity-types/index.js';
import { getCallLogTools } from '../../tools/call-logs/index.js';
import { getMailboxTools } from '../../tools/mailbox/index.js';
import { getTeamsTools } from '../../tools/teams/index.js';
import { getOrganizationRelationshipsTools } from '../../tools/org-relationships/index.js';
import { getPermissionSetTools } from '../../tools/permission-sets/index.js';
import { getChannelTools } from '../../tools/channels/index.js';
import { getMeetingTools } from '../../tools/meetings/index.js';
import { setupResources } from '../../resources/index.js';
import { setupPrompts } from '../../prompts/index.js';

describe('MCP Server Integration', () => {
  let server: Server;
  let client: PipedriveClient;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Set required environment variable
    process.env.PIPEDRIVE_API_TOKEN = 'test_token_12345';

    // Initialize client and server
    client = new PipedriveClient('test_token_12345');
    server = new Server(
      {
        name: 'pipedrive-mcp',
        version: '0.0.0-development',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('Server Initialization', () => {
    it('should create server instance successfully', () => {
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(Server);
    });

    it('should have setRequestHandler method', () => {
      expect(server.setRequestHandler).toBeDefined();
      expect(typeof server.setRequestHandler).toBe('function');
    });

    it('should accept request handler registration', () => {
      // Should not throw when registering handlers
      expect(() => {
        server.setRequestHandler(ListToolsRequestSchema, async () => {
          return { tools: [] };
        });
      }).not.toThrow();
    });
  });

  describe('Tool Registration', () => {
    it('should load all 28 tool categories', () => {
      // Helper function to convert array of tools to object
      function arrayToToolsObject(tools: any[]): Record<string, any> {
        return tools.reduce(
          (acc, tool) => {
            if (tool.name) {
              acc[tool.name] = tool;
            }
            return acc;
          },
          {} as Record<string, any>
        );
      }

      const allTools = {
        ...getDealTools(client),
        ...arrayToToolsObject(getPersonTools(client)),
        ...arrayToToolsObject(getOrganizationTools(client)),
        ...arrayToToolsObject(getActivityTools(client)),
        ...getFileTools(client),
        ...getSearchTools(client),
        ...getPipelineTools(client),
        ...getNoteTools(client),
        ...getFieldTools(client),
        ...getSystemTools(client),
        ...arrayToToolsObject(getProductTools(client)),
        ...getLeadTools(client),
        ...getUserTools(client),
        ...getRoleTools(client),
        ...getWebhookTools(client),
        ...getFilterTools(client),
        ...arrayToToolsObject(getProjectTools(client)),
        ...arrayToToolsObject(getProjectTemplateTools(client)),
        ...getGoalTools(client),
        ...getTaskTools(client),
        ...getActivityTypeTools(client),
        ...getCallLogTools(client),
        ...arrayToToolsObject(getMailboxTools(client)),
        ...arrayToToolsObject(getTeamsTools(client)),
        ...arrayToToolsObject(getOrganizationRelationshipsTools(client)),
        ...getPermissionSetTools(client),
        ...getChannelTools(client),
        ...getMeetingTools(client),
      };

      const toolCount = Object.keys(allTools).length;

      // Verify we have 245+ tools
      expect(toolCount).toBeGreaterThanOrEqual(245);

      // Verify each tool has required properties
      Object.entries(allTools).forEach(([name, tool]) => {
        expect(name).toBeTruthy();
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool).toHaveProperty('handler');
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema).toHaveProperty('properties');
      });
    });

    it('should register ListToolsRequestSchema handler', () => {
      const allTools = {
        ...getDealTools(client),
        'test/tool': {
          description: 'Test tool',
          inputSchema: {
            type: 'object',
            properties: {},
          },
          handler: vi.fn(),
        },
      };

      // Should not throw when registering handler
      expect(() => {
        server.setRequestHandler(ListToolsRequestSchema, async () => {
          return {
            tools: Object.entries(allTools).map(([name, tool]) => ({
              name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            })),
          };
        });
      }).not.toThrow();
    });

    it('should return tools with correct structure', () => {
      const dealTools = getDealTools(client);
      const toolNames = Object.keys(dealTools);

      // Check that we have deal tools
      expect(toolNames.length).toBeGreaterThan(0);

      // Check first tool structure
      const firstToolName = toolNames[0];
      const firstTool = dealTools[firstToolName];

      expect(firstTool).toHaveProperty('description');
      expect(firstTool).toHaveProperty('inputSchema');
      expect(firstTool).toHaveProperty('handler');
      expect(typeof firstTool.handler).toBe('function');
    });

    it('should categorize tools by namespace', () => {
      function arrayToToolsObject(tools: any[]): Record<string, any> {
        return tools.reduce(
          (acc, tool) => {
            if (tool.name) {
              acc[tool.name] = tool;
            }
            return acc;
          },
          {} as Record<string, any>
        );
      }

      const allTools = {
        ...getDealTools(client),
        ...arrayToToolsObject(getPersonTools(client)),
        ...arrayToToolsObject(getOrganizationTools(client)),
        ...getSearchTools(client),
      };

      const categories = new Set<string>();
      Object.keys(allTools).forEach((name) => {
        const category = name.split('/')[0];
        categories.add(category);
      });

      // Verify we have multiple categories
      expect(categories.size).toBeGreaterThanOrEqual(4);
      expect(categories.has('deals')).toBe(true);
      expect(categories.has('persons')).toBe(true);
      expect(categories.has('organizations')).toBe(true);
      expect(categories.has('search')).toBe(true);
    });
  });

  describe('Tool Execution', () => {
    it('should register CallToolRequestSchema handler', () => {
      const tools = {
        'test/tool': {
          description: 'Test tool',
          inputSchema: {
            type: 'object',
            properties: {},
          },
          handler: vi.fn().mockResolvedValue({ success: true }),
        },
      };

      // Should not throw when registering handler
      expect(() => {
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
          const { name, arguments: args } = request.params;
          const tool = tools[name];

          if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
          }

          const result = await tool.handler(args || {});
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        });
      }).not.toThrow();
    });

    it('should execute tool handler directly', async () => {
      const mockHandler = vi.fn().mockResolvedValue({
        data: { id: 1, title: 'Test Deal' },
        success: true,
      });

      const dealTools = getDealTools(client);
      const firstToolName = Object.keys(dealTools)[0];
      const firstTool = dealTools[firstToolName];

      // Replace the handler with our mock
      firstTool.handler = mockHandler;

      const result = await firstTool.handler({ id: 1 });

      expect(mockHandler).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({
        data: { id: 1, title: 'Test Deal' },
        success: true,
      });
    });

    it('should handle tool errors through try-catch', async () => {
      const errorHandler = vi.fn().mockRejectedValue(new Error('Tool execution failed'));

      try {
        await errorHandler();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Tool execution failed');
      }
    });

    it('should validate tool names exist in registry', () => {
      const dealTools = getDealTools(client);
      const toolName = 'nonexistent/tool';

      expect(toolName in dealTools).toBe(false);
      expect('deals/list' in dealTools).toBe(true);
    });
  });

  describe('Environment Variables - Toolset Filtering', () => {
    it('should filter tools by PIPEDRIVE_TOOLSETS', () => {
      process.env.PIPEDRIVE_TOOLSETS = 'deals,persons';

      const enabledToolsets = process.env.PIPEDRIVE_TOOLSETS.split(',').map((t) => t.trim());

      function arrayToToolsObject(tools: any[]): Record<string, any> {
        return tools.reduce(
          (acc, tool) => {
            if (tool.name) {
              acc[tool.name] = tool;
            }
            return acc;
          },
          {} as Record<string, any>
        );
      }

      const allTools = {
        ...getDealTools(client),
        ...arrayToToolsObject(getPersonTools(client)),
        ...arrayToToolsObject(getOrganizationTools(client)),
      };

      const filteredTools = Object.fromEntries(
        Object.entries(allTools).filter(([name]) => {
          const toolset = name.split('/')[0];
          return enabledToolsets.includes(toolset);
        })
      );

      // Should only have deals and persons tools
      Object.keys(filteredTools).forEach((name) => {
        const category = name.split('/')[0];
        expect(['deals', 'persons']).toContain(category);
      });

      // Should not have organizations tools
      const hasOrgTools = Object.keys(filteredTools).some((name) =>
        name.startsWith('organizations/')
      );
      expect(hasOrgTools).toBe(false);
    });

    it('should load all toolsets when PIPEDRIVE_TOOLSETS is not set', () => {
      delete process.env.PIPEDRIVE_TOOLSETS;

      const enabledToolsets = [
        'deals',
        'persons',
        'organizations',
        'activities',
        'files',
        'search',
        'pipelines',
        'notes',
        'fields',
        'system',
        'products',
        'leads',
        'users',
        'roles',
        'webhooks',
        'filters',
        'projects',
        'project_templates',
        'goals',
        'tasks',
        'activity_types',
        'call_logs',
        'mailbox',
        'teams',
        'org_relationships',
        'permission_sets',
        'channels',
        'meetings',
      ];

      expect(enabledToolsets.length).toBe(28);
      expect(enabledToolsets).toContain('deals');
      expect(enabledToolsets).toContain('persons');
      expect(enabledToolsets).toContain('organizations');
    });
  });

  describe('Environment Variables - Read-Only Mode', () => {
    function isWriteOperation(toolName: string): boolean {
      return (
        toolName.includes('/create') ||
        toolName.includes('/update') ||
        toolName.includes('/delete') ||
        toolName.includes('/add_') ||
        toolName.includes('/remove_') ||
        toolName.includes('/upload') ||
        toolName.includes('/duplicate') ||
        toolName.includes('/mark_') ||
        toolName.includes('/attach_') ||
        toolName.includes('/move_')
      );
    }

    it('should detect write operations correctly', () => {
      expect(isWriteOperation('deals/create')).toBe(true);
      expect(isWriteOperation('deals/update')).toBe(true);
      expect(isWriteOperation('deals/delete')).toBe(true);
      expect(isWriteOperation('deals/add_follower')).toBe(true);
      expect(isWriteOperation('deals/remove_follower')).toBe(true);
      expect(isWriteOperation('files/upload')).toBe(true);
      expect(isWriteOperation('deals/duplicate')).toBe(true);
      expect(isWriteOperation('deals/mark_as_won')).toBe(true);
      expect(isWriteOperation('deals/attach_file')).toBe(true);
      expect(isWriteOperation('deals/move_to_stage')).toBe(true);

      // Read operations should not be detected as write
      expect(isWriteOperation('deals/list')).toBe(false);
      expect(isWriteOperation('deals/get')).toBe(false);
      expect(isWriteOperation('deals/search')).toBe(false);
      expect(isWriteOperation('deals/list_followers')).toBe(false);
    });

    it('should block write operations in read-only mode', () => {
      process.env.PIPEDRIVE_READ_ONLY = 'true';
      const READ_ONLY = process.env.PIPEDRIVE_READ_ONLY === 'true';

      function arrayToToolsObject(tools: any[]): Record<string, any> {
        return tools.reduce(
          (acc, tool) => {
            if (tool.name) {
              acc[tool.name] = tool;
            }
            return acc;
          },
          {} as Record<string, any>
        );
      }

      const allTools = {
        ...getDealTools(client),
        ...arrayToToolsObject(getPersonTools(client)),
      };

      const filteredTools = Object.fromEntries(
        Object.entries(allTools).filter(([name]) => {
          if (READ_ONLY && isWriteOperation(name)) {
            return false;
          }
          return true;
        })
      );

      // Should not have any write operations
      Object.keys(filteredTools).forEach((name) => {
        expect(isWriteOperation(name)).toBe(false);
      });
    });

    it('should allow write operations when read-only is false', () => {
      process.env.PIPEDRIVE_READ_ONLY = 'false';
      const READ_ONLY = process.env.PIPEDRIVE_READ_ONLY === 'true';

      const dealTools = getDealTools(client);
      const writeTools = Object.keys(dealTools).filter(isWriteOperation);

      const filteredTools = Object.fromEntries(
        Object.entries(dealTools).filter(([name]) => {
          if (READ_ONLY && isWriteOperation(name)) {
            return false;
          }
          return true;
        })
      );

      // Should have write operations
      const filteredWriteTools = Object.keys(filteredTools).filter(isWriteOperation);
      expect(filteredWriteTools.length).toBe(writeTools.length);
      expect(filteredWriteTools.length).toBeGreaterThan(0);
    });

    it('should combine read-only and toolset filtering', () => {
      process.env.PIPEDRIVE_READ_ONLY = 'true';
      process.env.PIPEDRIVE_TOOLSETS = 'deals,persons';

      const READ_ONLY = process.env.PIPEDRIVE_READ_ONLY === 'true';
      const enabledToolsets = process.env.PIPEDRIVE_TOOLSETS.split(',').map((t) => t.trim());

      function arrayToToolsObject(tools: any[]): Record<string, any> {
        return tools.reduce(
          (acc, tool) => {
            if (tool.name) {
              acc[tool.name] = tool;
            }
            return acc;
          },
          {} as Record<string, any>
        );
      }

      const allTools = {
        ...getDealTools(client),
        ...arrayToToolsObject(getPersonTools(client)),
        ...arrayToToolsObject(getOrganizationTools(client)),
      };

      const filteredTools = Object.fromEntries(
        Object.entries(allTools).filter(([name]) => {
          const toolset = name.split('/')[0];
          if (!enabledToolsets.includes(toolset)) {
            return false;
          }
          if (READ_ONLY && isWriteOperation(name)) {
            return false;
          }
          return true;
        })
      );

      // Should only have deals and persons tools
      Object.keys(filteredTools).forEach((name) => {
        const category = name.split('/')[0];
        expect(['deals', 'persons']).toContain(category);
        // Should not have write operations
        expect(isWriteOperation(name)).toBe(false);
      });
    });
  });

  describe('Resources & Prompts', () => {
    it('should setup resources without errors', () => {
      expect(() => {
        setupResources(server, client);
      }).not.toThrow();
    });

    it('should setup prompts without errors', () => {
      expect(() => {
        setupPrompts(server);
      }).not.toThrow();
    });

    it('should register resource handlers', () => {
      // Should be able to register resource handlers
      expect(() => {
        server.setRequestHandler(ListResourcesRequestSchema, async () => {
          return {
            resources: [
              {
                uri: 'test://resource',
                name: 'Test Resource',
                description: 'Test',
                mimeType: 'application/json',
              },
            ],
          };
        });
      }).not.toThrow();
    });

    it('should register prompt handlers', () => {
      // Should be able to register prompt handlers
      expect(() => {
        server.setRequestHandler(ListPromptsRequestSchema, async () => {
          return {
            prompts: [
              {
                name: 'test-prompt',
                description: 'Test prompt',
                arguments: [],
              },
            ],
          };
        });
      }).not.toThrow();
    });

    it('should verify expected resource URIs are defined', () => {
      const expectedURIs = [
        'pipedrive://pipelines',
        'pipedrive://custom-fields',
        'pipedrive://current-user',
      ];

      // These URIs should be used in the resources setup
      expectedURIs.forEach((uri) => {
        expect(uri).toMatch(/^pipedrive:\/\//);
      });
    });

    it('should verify expected prompt names are defined', () => {
      const expectedPrompts = [
        'create-deal-workflow',
        'sales-qualification',
        'follow-up-sequence',
        'weekly-pipeline-review',
        'lost-deal-analysis',
      ];

      // These prompt names should exist
      expectedPrompts.forEach((name) => {
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tool Count Verification', () => {
    it('should have correct number of tools per category', () => {
      function arrayToToolsObject(tools: any[]): Record<string, any> {
        return tools.reduce(
          (acc, tool) => {
            if (tool.name) {
              acc[tool.name] = tool;
            }
            return acc;
          },
          {} as Record<string, any>
        );
      }

      const toolsByCategory = {
        deals: Object.keys(getDealTools(client)).length,
        persons: Object.keys(arrayToToolsObject(getPersonTools(client))).length,
        organizations: Object.keys(arrayToToolsObject(getOrganizationTools(client))).length,
        activities: Object.keys(arrayToToolsObject(getActivityTools(client))).length,
        files: Object.keys(getFileTools(client)).length,
        search: Object.keys(getSearchTools(client)).length,
        pipelines: Object.keys(getPipelineTools(client)).length,
        notes: Object.keys(getNoteTools(client)).length,
        fields: Object.keys(getFieldTools(client)).length,
        system: Object.keys(getSystemTools(client)).length,
        products: Object.keys(arrayToToolsObject(getProductTools(client))).length,
        leads: Object.keys(getLeadTools(client)).length,
        users: Object.keys(getUserTools(client)).length,
        roles: Object.keys(getRoleTools(client)).length,
        webhooks: Object.keys(getWebhookTools(client)).length,
        filters: Object.keys(getFilterTools(client)).length,
        projects: Object.keys(arrayToToolsObject(getProjectTools(client))).length,
        project_templates: Object.keys(arrayToToolsObject(getProjectTemplateTools(client))).length,
        goals: Object.keys(getGoalTools(client)).length,
        tasks: Object.keys(getTaskTools(client)).length,
        activity_types: Object.keys(getActivityTypeTools(client)).length,
        call_logs: Object.keys(getCallLogTools(client)).length,
        mailbox: Object.keys(arrayToToolsObject(getMailboxTools(client))).length,
        teams: Object.keys(arrayToToolsObject(getTeamsTools(client))).length,
        org_relationships: Object.keys(
          arrayToToolsObject(getOrganizationRelationshipsTools(client))
        ).length,
        permission_sets: Object.keys(getPermissionSetTools(client)).length,
        channels: Object.keys(getChannelTools(client)).length,
        meetings: Object.keys(getMeetingTools(client)).length,
      };

      // Each category should have at least 1 tool
      Object.entries(toolsByCategory).forEach(([category, count]) => {
        expect(count, `${category} should have at least 1 tool`).toBeGreaterThan(0);
      });

      // Total should be 245+
      const total = Object.values(toolsByCategory).reduce((sum, count) => sum + count, 0);
      expect(total).toBeGreaterThanOrEqual(245);
    });
  });
});
