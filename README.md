# Pipedrive MCP Server

[![npm version](https://img.shields.io/npm/v/@iamsamuelfraga/mcp-pipedrive.svg)](https://www.npmjs.com/package/@iamsamuelfraga/mcp-pipedrive)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

> The most complete and robust Pipedrive MCP implementation for Claude

A production-ready [Model Context Protocol](https://modelcontextprotocol.io) server that provides Claude with comprehensive access to the Pipedrive CRM API. This server enables seamless automation of sales workflows, deal management, contact organization, and activity tracking through natural language conversations.

## Features

- **100+ Tools Across 10 Categories** - Complete coverage of Pipedrive's core functionality
- **Advanced Rate Limiting** - 10 requests/second with burst capacity up to 100 requests
- **Multi-Level Caching** - 5-15 minute TTL for frequently accessed data
- **Retry Logic** - Exponential backoff for failed requests (429, 500, 502, 503, 504)
- **Comprehensive Error Handling** - Detailed error messages with actionable suggestions
- **Full TypeScript Support** - Type-safe schemas and interfaces throughout
- **Zod Validation** - Runtime validation for all inputs with helpful error messages
- **MCP Resources** - Read-only access to pipelines, custom fields, and user info
- **MCP Prompts** - 5 guided workflows for common operations
- **Performance Metrics** - Built-in tracking for request duration and success rates
- **Read-Only Mode** - Optional safety mode that blocks all write operations
- **Toolset Filtering** - Enable/disable specific tool categories as needed

## Tool Categories

| Category | Tools | Description |
|----------|-------|-------------|
| **Deals** | 23 | Complete deal lifecycle management including creation, updates, stage movement, participants, products, and files |
| **Persons** | 12 | Contact management with custom fields, activities, deals, files, and follower management |
| **Organizations** | 12 | Company/organization management with relationships to persons, deals, and activities |
| **Activities** | 8 | Task, call, and meeting scheduling with due dates and completion tracking |
| **Files** | 7 | File upload, download, management, and remote file linking |
| **Search** | 6 | Universal search and entity-specific search across deals, persons, organizations, and products |
| **Pipelines** | 8 | Pipeline and stage management, including stage conversion statistics |
| **Notes** | 5 | Note creation and management for deals, persons, and organizations |
| **Fields** | 8 | Custom field discovery and metadata for all entity types |
| **System** | 5 | Health checks, metrics, user info, currencies, and cache management |

## Installation

### Global Installation

```bash
npm install -g @iamsamuelfraga/mcp-pipedrive
```

### Using npx (No Installation Required)

```bash
npx -y @iamsamuelfraga/mcp-pipedrive
```

## Configuration

### Prerequisites

1. Get your Pipedrive API token from [Settings > API](https://app.pipedrive.com/settings/api)
2. Have Claude Desktop installed

### Claude Desktop Setup

#### macOS

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "npx",
      "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

#### Windows

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "npx",
      "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PIPEDRIVE_API_TOKEN` | Yes | - | Your Pipedrive API token |
| `PIPEDRIVE_READ_ONLY` | No | `false` | Enable read-only mode (blocks all write operations) |
| `PIPEDRIVE_TOOLSETS` | No | `deals,persons,organizations,activities` | Comma-separated list of enabled tool categories |
| `LOG_LEVEL` | No | `info` | Logging level (`debug`, `info`, `warn`, `error`) |

### Advanced Configuration Examples

#### Read-Only Mode

Perfect for exploratory use or when you want to prevent accidental modifications:

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "npx",
      "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_token",
        "PIPEDRIVE_READ_ONLY": "true"
      }
    }
  }
}
```

#### Filtered Toolsets

Only enable specific tool categories:

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "npx",
      "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_token",
        "PIPEDRIVE_TOOLSETS": "deals,persons,search"
      }
    }
  }
}
```

#### Debug Logging

Enable verbose logging for troubleshooting:

```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "npx",
      "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_token",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Usage Examples

### Example 1: Creating a Deal with Contact

```
Claude, create a new deal for "Enterprise Software License" worth $50,000.
The contact is John Smith (john@acme.com). Set the expected close date
to the end of next month and add a follow-up call for tomorrow.
```

Claude will:
1. Search for or create the person "John Smith"
2. Create the deal linked to this person
3. Schedule a call activity for tomorrow
4. Provide a summary with IDs and next steps

### Example 2: Searching for Contacts

```
Find all contacts at Acme Corporation and show me their recent deals.
```

Claude will:
1. Search organizations for "Acme Corporation"
2. Get all persons associated with that organization
3. Retrieve deals for each person
4. Present organized results with totals

### Example 3: Managing Activities

```
Show me all overdue activities for my open deals and reschedule them
to next week.
```

Claude will:
1. List all activities with `done=false` and past due dates
2. Filter for activities linked to open deals
3. Update each activity with new dates next week
4. Provide a summary of rescheduled items

### Example 4: Using Custom Fields

```
Before creating this deal, show me what custom fields are available
for deals and explain what each one means.
```

Claude will:
1. Access the `pipedrive://custom-fields` resource
2. Extract deal-specific custom fields
3. Display field names, types, and options
4. Explain how to use them in deal creation

### Example 5: Pipeline Management

```
Generate a pipeline report showing deal counts and total values for
each stage in my sales pipeline.
```

Claude will:
1. Use the `pipedrive://pipelines` resource
2. Get deal summaries grouped by stage
3. Calculate totals and percentages
4. Format as a readable report

### Example 6: Weekly Review Workflow

```
Run the weekly pipeline review prompt.
```

Claude will:
1. Execute the `weekly-pipeline-review` prompt
2. Gather all open deals by stage
3. Calculate metrics (won/lost, approaching close, stale deals)
4. Generate actionable recommendations

## Architecture

### Core Components

- **PipedriveClient** - HTTP client with rate limiting, caching, and retry logic
- **Rate Limiter** - Bottleneck-based limiter (10 req/s, burst capacity)
- **Cache Layer** - TTL-based cache with LRU eviction (500 item max)
- **Retry Handler** - Exponential backoff for transient failures
- **Metrics Collector** - Request tracking and performance monitoring
- **Error Handler** - Standardized error formatting with context

### Tool Structure

Each tool follows a consistent pattern:

1. **Zod Schema** - Input validation with descriptive errors
2. **Description** - Detailed usage instructions for the LLM
3. **Handler** - Async function that calls PipedriveClient

### Resources

Three MCP resources provide read-only reference data:

- `pipedrive://pipelines` - All pipelines with stages and deal counts
- `pipedrive://custom-fields` - Custom field definitions for all entities
- `pipedrive://current-user` - Authenticated user info and permissions

### Prompts

Five guided workflows for common operations:

- `create-deal-workflow` - Complete deal creation with person and activity
- `sales-qualification` - BANT qualification checklist
- `follow-up-sequence` - Multi-day activity sequence
- `weekly-pipeline-review` - Pipeline health report
- `lost-deal-analysis` - Lost deal pattern analysis

## Performance

### Rate Limiting

- **Default**: 10 requests/second (100ms between requests)
- **Burst**: 100 token reservoir that refills every minute
- **Auto-retry**: 429 errors automatically retry after 5 seconds

### Caching Strategy

| Data Type | TTL | Reason |
|-----------|-----|--------|
| Pipelines | 10 min | Pipeline structures change infrequently |
| Custom Fields | 15 min | Field definitions are relatively static |
| User Info | 1 min | User data may change during session |
| List Requests | 5 min | Default for paginated results |

### Metrics

The server tracks:
- Total requests and success rate
- Average response time
- Error rate by type
- Cache hit rate
- Rate limit events

Access metrics with the `system/metrics` tool.

## API Reference

This MCP server implements the Pipedrive REST API v1. For detailed API documentation, see:

- [Pipedrive API Reference](https://developers.pipedrive.com/docs/api/v1)
- [Pipedrive API Changelog](https://developers.pipedrive.com/changelog)
- [Rate Limits](https://pipedrive.readme.io/docs/core-api-concepts-rate-limiting)

## Advanced Usage

### Custom Field Discovery

Before creating or updating entities, check available custom fields:

```javascript
// Access via MCP resource
pipedrive://custom-fields

// Or use field tools
fields/deal-fields
fields/person-fields
fields/org-fields
fields/activity-fields
```

### Error Handling

All tools return structured errors with:
- Error type (validation, authentication, rate limit, etc.)
- Detailed message
- Suggested actions
- Original API error (if applicable)

### Workflow Automation

Chain multiple tools together for complex workflows:

1. **Lead Qualification**
   - Search for person
   - Get their deals and activities
   - Create qualification note
   - Update deal stage

2. **Deal Pipeline Movement**
   - Get deal details
   - Check custom field requirements
   - Update custom fields
   - Move to next stage
   - Create next activity

3. **Reporting**
   - List deals by stage
   - Get deal summaries
   - Calculate metrics
   - Format as markdown

## Troubleshooting

See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common issues and solutions.

Quick fixes:
- **Authentication errors**: Verify your API token at https://app.pipedrive.com/settings/api
- **Rate limiting**: Reduce request frequency or enable caching
- **Validation errors**: Check tool input schema and required fields
- **Not seeing tools in Claude**: Restart Claude Desktop after config changes

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/iamsamuelfraga/mcp-pipedrive.git
cd mcp-pipedrive

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run with auto-reload during development
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## Security

Please see [SECURITY.md](./SECURITY.md) for our security policy and how to report vulnerabilities.

**Important**: Never commit your API token to version control. Always use environment variables.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Credits

Inspired by [mcp-holded](https://github.com/ivo-toby/mcp-holded) - an excellent MCP server implementation for Holded CRM.

## Support

- **Issues**: [GitHub Issues](https://github.com/iamsamuelfraga/mcp-pipedrive/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iamsamuelfraga/mcp-pipedrive/discussions)
- **Documentation**: [docs/](./docs/)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

## Roadmap

- [ ] Webhook support for real-time updates
- [ ] Bulk operations for mass updates
- [ ] Advanced filtering with complex queries
- [ ] Export/import functionality
- [ ] Integration with other CRMs
- [ ] GraphQL support

---

Made with dedication by [Samuel Fraga](https://github.com/iamsamuelfraga)
