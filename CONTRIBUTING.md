# Contributing to Pipedrive MCP Server

Thank you for your interest in contributing to the Pipedrive MCP Server! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Adding New Tools](#adding-new-tools)
- [Documentation](#documentation)

## Code of Conduct

This project follows a Code of Conduct that all contributors are expected to adhere to. Please be respectful, inclusive, and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your feature or bugfix
4. **Make your changes** with tests and documentation
5. **Submit a pull request** with a clear description

## Development Setup

### Prerequisites

- Node.js >= 18
- npm or yarn
- Git
- A Pipedrive account with API access

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mcp-pipedrive.git
cd mcp-pipedrive

# Install dependencies
npm install

# Create a .env file for local development
cp .env.example .env
# Add your PIPEDRIVE_API_TOKEN to .env

# Build the project
npm run build

# Run tests
npm test
```

### Running Locally

For development, you can run the server locally with auto-reload:

```bash
# Start in development mode with watch
npm run dev
```

To test with Claude Desktop, update your config to point to the local build:

```json
{
  "mcpServers": {
    "pipedrive-dev": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-pipedrive/dist/index.js"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_token",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Project Structure

```
mcp-pipedrive/
├── src/
│   ├── index.ts              # Main entry point and MCP server setup
│   ├── pipedrive-client.ts   # HTTP client with rate limiting and caching
│   ├── schemas/              # Zod validation schemas
│   │   ├── common.ts         # Shared schemas (IDs, dates, etc.)
│   │   ├── deal.ts           # Deal-specific schemas
│   │   ├── person.ts         # Person-specific schemas
│   │   └── ...
│   ├── tools/                # MCP tool implementations
│   │   ├── deals/            # Deal management tools
│   │   ├── persons/          # Person management tools
│   │   ├── organizations/    # Organization tools
│   │   ├── activities/       # Activity tools
│   │   ├── files/            # File management tools
│   │   ├── search/           # Search tools
│   │   ├── pipelines/        # Pipeline tools
│   │   ├── notes/            # Note tools
│   │   ├── fields/           # Custom field discovery
│   │   └── system/           # System utilities
│   ├── resources/            # MCP resources
│   ├── prompts/              # MCP guided prompts
│   ├── utils/                # Utility modules
│   │   ├── cache.ts          # TTL cache implementation
│   │   ├── rate-limiter.ts   # Rate limiting
│   │   ├── retry.ts          # Retry logic
│   │   ├── error-handler.ts  # Error formatting
│   │   ├── metrics.ts        # Performance tracking
│   │   └── logger.ts         # Winston logger
│   └── types/                # TypeScript type definitions
├── docs/                     # Documentation
├── tests/                    # Test files
└── package.json
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Keep commits atomic and focused

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:ui

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### 4. Commit Your Changes

Follow the [commit message format](#commit-message-format).

```bash
git add .
git commit -m "feat: add new deal summary tool"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Formatting

We use Prettier for code formatting:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

Prettier runs automatically on commit via husky.

### Linting

We use ESLint with TypeScript support:

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `rate-limiter.ts`)
- **Classes**: `PascalCase` (e.g., `PipedriveClient`)
- **Functions**: `camelCase` (e.g., `getDealTools`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_TOKEN`)
- **Interfaces**: `PascalCase` (e.g., `CacheOptions`)
- **Types**: `PascalCase` (e.g., `DealStatus`)

### Error Handling

- Always use try-catch for async operations
- Throw descriptive errors
- Use custom error types when appropriate
- Log errors with context

```typescript
try {
  const result = await client.get('/deals');
  return result;
} catch (error) {
  logger.error('Failed to fetch deals', error as Error, { context: 'additional info' });
  throw new Error(`Failed to fetch deals: ${(error as Error).message}`);
}
```

## Testing Requirements

### Test Coverage

- Aim for >80% code coverage
- All new tools must have tests
- All new schemas must have validation tests
- Test both success and error cases

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ToolName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should handle valid input', async () => {
    // Arrange
    const input = { id: 123 };

    // Act
    const result = await toolHandler(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(123);
  });

  it('should reject invalid input', async () => {
    // Arrange
    const input = { id: 'invalid' };

    // Act & Assert
    await expect(toolHandler(input)).rejects.toThrow('ID must be a number');
  });
});
```

### Running Specific Tests

```bash
# Run specific file
npm test -- rate-limiter.test.ts

# Run tests matching pattern
npm test -- --grep "schema validation"

# Run in watch mode
npm test -- --watch
```

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD changes

### Examples

```
feat(deals): add deal summary tool

Implement a new tool for retrieving deal summaries with
aggregated statistics by stage.

Closes #123
```

```
fix(cache): prevent memory leak in TTL cache

The cache was not properly evicting expired entries,
causing memory growth over time.

Fixes #456
```

```
docs(readme): update installation instructions

Add instructions for Windows users and clarify
environment variable setup.
```

### Semantic Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and releases. Commit messages determine the version bump:

- `fix:` → Patch version (1.0.X)
- `feat:` → Minor version (1.X.0)
- `BREAKING CHANGE:` → Major version (X.0.0)

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Check code coverage: `npm run test:coverage`
3. Run linter: `npm run lint`
4. Format code: `npm run format`
5. Update documentation if needed
6. Add tests for new features
7. Update CHANGELOG.md if doing manual releases

### PR Title

Use the same format as commit messages:

```
feat(deals): add bulk deal update tool
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe the tests you ran and how to reproduce.

## Checklist
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Related Issues
Closes #(issue number)
```

### Review Process

1. At least one maintainer must review and approve
2. All CI checks must pass
3. No unresolved comments
4. Up to date with main branch

## Adding New Tools

### 1. Create Schema

Create or update schema in `src/schemas/`:

```typescript
// src/schemas/example.ts
import { z } from 'zod';
import { IdSchema } from './common.js';

export const ExampleSchema = z.object({
  id: IdSchema.describe('Entity ID'),
  name: z.string().min(1).describe('Entity name'),
}).strict();

export type ExampleInput = z.infer<typeof ExampleSchema>;
```

### 2. Create Tool Implementation

Create tool file in appropriate directory under `src/tools/`:

```typescript
// src/tools/category/example.ts
import type { PipedriveClient } from '../../pipedrive-client.js';
import { ExampleSchema } from '../../schemas/example.js';

export function getExampleTool(client: PipedriveClient) {
  return {
    name: 'category/example',
    description: `Detailed description of what this tool does.

Include usage examples and tips for the LLM.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'number', description: 'Entity ID' },
        name: { type: 'string', description: 'Entity name' },
      },
      required: ['id', 'name'],
    },
    handler: async (args: unknown) => {
      const validated = ExampleSchema.parse(args);
      return client.get(`/endpoint/${validated.id}`);
    },
  };
}
```

### 3. Register Tool

Add to category index file:

```typescript
// src/tools/category/index.ts
import { getExampleTool } from './example.js';

export function getCategoryTools(client: PipedriveClient) {
  return [
    getExampleTool(client),
    // ... other tools
  ];
}
```

### 4. Add Tests

```typescript
// src/tools/category/__tests__/example.test.ts
import { describe, it, expect } from 'vitest';
import { ExampleSchema } from '../../../schemas/example.js';

describe('ExampleSchema', () => {
  it('should validate correct input', () => {
    const input = { id: 123, name: 'Test' };
    expect(() => ExampleSchema.parse(input)).not.toThrow();
  });

  it('should reject invalid input', () => {
    const input = { id: 'invalid' };
    expect(() => ExampleSchema.parse(input)).toThrow();
  });
});
```

### 5. Update Documentation

Add tool to README.md tool count and update relevant documentation.

## Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Document edge cases
- Keep documentation up to date with code changes
- Use proper markdown formatting

### Documentation Files

- **README.md** - Main documentation
- **CONTRIBUTING.md** - This file
- **SECURITY.md** - Security policy
- **docs/WORKFLOWS.md** - Common workflow examples
- **docs/CUSTOM_FIELDS.md** - Custom field usage
- **docs/TROUBLESHOOTING.md** - Troubleshooting guide

### JSDoc Comments

Use JSDoc for TypeScript documentation:

```typescript
/**
 * Fetches a deal from Pipedrive by ID
 *
 * @param dealId - The ID of the deal to fetch
 * @returns Promise resolving to the deal object
 * @throws {Error} If the deal is not found or API request fails
 *
 * @example
 * ```typescript
 * const deal = await getDeal(123);
 * console.log(deal.title);
 * ```
 */
async function getDeal(dealId: number): Promise<Deal> {
  // Implementation
}
```

## Questions?

If you have questions:

1. Check existing documentation
2. Search existing issues
3. Ask in GitHub Discussions
4. Open a new issue with the "question" label

Thank you for contributing to Pipedrive MCP Server!
