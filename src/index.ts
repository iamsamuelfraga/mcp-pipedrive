#!/usr/bin/env node
import http from 'node:http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { PipedriveClient } from './pipedrive-client.js';
import { logger } from './utils/logger.js';
import { handleToolError } from './utils/error-handler.js';
import { metricsCollector } from './utils/metrics.js';

// Import all tool functions
import { getDealTools } from './tools/deals/index.js';
import { getPersonTools } from './tools/persons/index.js';
import { getOrganizationTools } from './tools/organizations/index.js';
import { getActivityTools } from './tools/activities/index.js';
import { getFileTools } from './tools/files/index.js';
import { getSearchTools } from './tools/search/index.js';
import { getPipelineTools } from './tools/pipelines/index.js';
import { getNoteTools } from './tools/notes/index.js';
import { getFieldTools } from './tools/fields/index.js';
import { getSystemTools } from './tools/system/index.js';
import { getProductTools } from './tools/products/index.js';
import { getLeadTools } from './tools/leads/index.js';
import { getUserTools } from './tools/users/index.js';
import { getRoleTools } from './tools/roles/index.js';
import { getWebhookTools } from './tools/webhooks/index.js';
import { getFilterTools } from './tools/filters/index.js';
import { getProjectTools } from './tools/projects/index.js';
import { getProjectTemplateTools } from './tools/project-templates/index.js';
import { getGoalTools } from './tools/goals/index.js';
import { getTaskTools } from './tools/tasks/index.js';
import { getActivityTypeTools } from './tools/activity-types/index.js';
import { getCallLogTools } from './tools/call-logs/index.js';
import { getMailboxTools } from './tools/mailbox/index.js';
import { getTeamsTools } from './tools/teams/index.js';
import { getOrganizationRelationshipsTools } from './tools/org-relationships/index.js';
import { getPermissionSetTools } from './tools/permission-sets/index.js';
import { getChannelTools } from './tools/channels/index.js';
import { getMeetingTools } from './tools/meetings/index.js';

// Import resources and prompts
import { setupResources } from './resources/index.js';
import { setupPrompts } from './prompts/index.js';

// Tool type definition
interface Tool {
  name?: string; // Optional since deals tools don't include name in the object
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: readonly string[] | string[];
  };
  handler: (args: unknown) => Promise<unknown>;
}

// ─── Server factory ──────────────────────────────────────────────────────────
// Creates a fully configured MCP Server bound to a specific Pipedrive API token.
// Called once for stdio mode, or once per SSE connection so that each LibreChat
// user can supply their own token through the LibreChat UI.
function createMcpServer(apiToken: string): Server {
  const client = new PipedriveClient(apiToken);
  const READ_ONLY = process.env.PIPEDRIVE_READ_ONLY === 'true';

  const enabledToolsets = process.env.PIPEDRIVE_TOOLSETS
    ? process.env.PIPEDRIVE_TOOLSETS.split(',').map((t) => t.trim())
    : [
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

  function arrayToToolsObject(toolList: Tool[]): Record<string, Tool> {
    return toolList.reduce(
      (acc, tool) => {
        if (tool.name) acc[tool.name] = tool;
        return acc;
      },
      {} as Record<string, Tool>
    );
  }

  const allTools: Record<string, Tool> = {
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

  function isWriteOperation(toolName: string): boolean {
    return (
      toolName.includes('/create') ||
      toolName.includes('_create') ||
      toolName.includes('/update') ||
      toolName.includes('_update') ||
      toolName.includes('/delete') ||
      toolName.includes('_delete') ||
      toolName.includes('/add_') ||
      toolName.includes('_add_') ||
      toolName.includes('/remove_') ||
      toolName.includes('_remove_') ||
      toolName.includes('/upload') ||
      toolName.includes('_upload') ||
      toolName.includes('/duplicate') ||
      toolName.includes('_duplicate') ||
      toolName.includes('/mark_') ||
      toolName.includes('_mark_') ||
      toolName.includes('/attach_') ||
      toolName.includes('_attach_') ||
      toolName.includes('/move_') ||
      toolName.includes('_move_')
    );
  }

  const tools = Object.fromEntries(
    Object.entries(allTools).filter(([name, _tool]) => {
      const toolset = name.split(/[/_]/)[0];
      if (!enabledToolsets.includes(toolset)) {
        logger.debug('Toolset disabled, skipping tool', { tool: name, toolset });
        return false;
      }
      if (READ_ONLY && isWriteOperation(name)) {
        logger.warn('Skipping write operation in read-only mode', { tool: name });
        return false;
      }
      return true;
    })
  );

  const server = new Server(
    { name: 'pipedrive-mcp', version: '0.0.0-development' },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Listing available tools', { count: Object.keys(tools).length });
    return {
      tools: Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    logger.info('Tool called', { tool: name, hasArgs: !!args });

    const startTime = Date.now();
    let success = true;

    try {
      const tool = tools[name];
      if (!tool) throw new Error(`Unknown tool: ${name}`);

      const result = await tool.handler(args || {});
      const duration = Date.now() - startTime;
      logger.info('Tool executed successfully', { tool: name, duration });

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      success = false;
      const duration = Date.now() - startTime;
      logger.error('Tool execution failed', error as Error, { tool: name, duration });
      metricsCollector.recordRequest(name, duration, true);
      return handleToolError(error);
    } finally {
      if (success) {
        const duration = Date.now() - startTime;
        metricsCollector.recordRequest(name, duration, false);
      }
    }
  });

  setupResources(server, client);
  setupPrompts(server);

  return server;
}

// ─── Startup ─────────────────────────────────────────────────────────────────
async function main() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;

  if (PORT) {
    // SSE transport — each connection gets its own Server+PipedriveClient so
    // each LibreChat user's token (passed via x-pipedrive-token header) is isolated.
    const sseTransports = new Map<string, SSEServerTransport>();

    const httpServer = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, x-pipedrive-token'
      );

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/sse') {
        // Token resolution order:
        //   1. x-pipedrive-token header  (LibreChat user credential from UI)
        //   2. Authorization: Bearer ...  (alternative bearer format)
        //   3. PIPEDRIVE_API_TOKEN env    (optional container-level fallback)
        const token =
          (req.headers['x-pipedrive-token'] as string | undefined) ||
          (req.headers['authorization'] as string | undefined)?.replace(/^Bearer\s+/i, '') ||
          process.env.PIPEDRIVE_API_TOKEN;

        if (!token) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error:
                'Pipedrive API token is required. ' +
                'Add your token in the LibreChat UI under Settings → API Keys ' +
                '(key name: PIPEDRIVE_API_TOKEN).',
            })
          );
          return;
        }

        const sessionServer = createMcpServer(token);
        const transport = new SSEServerTransport('/message', res);
        sseTransports.set(transport.sessionId, transport);

        // Keep-alive heartbeat — prevents reverse proxy (nginx) from closing
        // idle SSE connections after its proxy_read_timeout (default 60-90 s).
        // Fires every 20 s; harmless SSE comment lines ": keep-alive\n\n".
        req.socket.setTimeout(0); // disable Node socket-level read timeout
        const keepAliveInterval = setInterval(() => {
          if (!res.destroyed) {
            res.write(': keep-alive\n\n');
          } else {
            clearInterval(keepAliveInterval);
          }
        }, 20_000);

        transport.onclose = () => {
          clearInterval(keepAliveInterval);
          sseTransports.delete(transport.sessionId);
          logger.info('SSE session closed', { sessionId: transport.sessionId });
        };
        req.on('close', () => clearInterval(keepAliveInterval));

        await sessionServer.connect(transport);
        logger.info('SSE session opened', { sessionId: transport.sessionId });
        return;
      }

      if (req.method === 'POST' && req.url?.startsWith('/message')) {
        const sessionId = new URL(req.url, 'http://localhost').searchParams.get('sessionId');
        const transport = sessionId ? sseTransports.get(sessionId) : undefined;
        if (transport) {
          await transport.handlePostMessage(req, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Session not found');
        }
        return;
      }

      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', activeSessions: sseTransports.size }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });

    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info('Pipedrive MCP server started (SSE / LibreChat mode)', {
        port: PORT,
        sseEndpoint: `http://0.0.0.0:${PORT}/sse`,
        healthEndpoint: `http://0.0.0.0:${PORT}/health`,
        tokenSource: process.env.PIPEDRIVE_API_TOKEN
          ? 'env fallback active'
          : 'per-connection header required (LibreChat UI)',
      });
    });
  } else {
    // stdio transport — token must come from env (Claude Desktop / npx)
    const apiToken = process.env.PIPEDRIVE_API_TOKEN;
    if (!apiToken) {
      console.error('Error: PIPEDRIVE_API_TOKEN environment variable is required');
      console.error('');
      console.error('Get your API token from: https://app.pipedrive.com/settings/api');
      console.error('');
      console.error('Set it in your Claude Desktop config:');
      console.error('{');
      console.error('  "mcpServers": {');
      console.error('    "pipedrive": {');
      console.error('      "command": "npx",');
      console.error('      "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"],');
      console.error('      "env": {');
      console.error('        "PIPEDRIVE_API_TOKEN": "your_token_here"');
      console.error('      }');
      console.error('    }');
      console.error('  }');
      console.error('}');
      process.exit(1);
    }

    const server = createMcpServer(apiToken);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Pipedrive MCP server started (stdio)', {
      tokenSource: 'PIPEDRIVE_API_TOKEN env',
    });
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully (SIGINT)...');

  // Log final metrics
  const metrics = metricsCollector.getMetrics();
  logger.info('Final metrics', metrics as unknown as Record<string, unknown>);

  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully (SIGTERM)...');

  // Log final metrics
  const metrics = metricsCollector.getMetrics();
  logger.info('Final metrics', metrics as unknown as Record<string, unknown>);

  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', new Error(String(reason)), {
    promise: String(promise),
  });
  process.exit(1);
});

main().catch((error) => {
  logger.error('Fatal error during startup', error);
  process.exit(1);
});
