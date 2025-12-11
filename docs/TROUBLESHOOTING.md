# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Pipedrive MCP server.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Installation Issues](#installation-issues)
- [Authentication Issues](#authentication-issues)
- [Rate Limiting Problems](#rate-limiting-problems)
- [Tool Not Available](#tool-not-available)
- [Validation Errors](#validation-errors)
- [Connection Issues](#connection-issues)
- [Performance Issues](#performance-issues)
- [Data Issues](#data-issues)
- [Logging and Debugging](#logging-and-debugging)
- [Common Error Messages](#common-error-messages)
- [Getting Help](#getting-help)

## Quick Diagnostics

### Step 1: Check Server Status

**Ask Claude:**
```
Check Pipedrive MCP server health.
```

This runs the `system/health` tool and verifies:
- API connectivity
- Authentication status
- Rate limiter status
- Cache statistics

### Step 2: Check Your Configuration

**macOS:**
```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```powershell
type %APPDATA%\Claude\claude_desktop_config.json
```

Verify:
- ✅ MCP server name is correct
- ✅ Command is `npx` or `node`
- ✅ Args are correct
- ✅ API token is set

### Step 3: Check Logs

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```powershell
Get-Content $env:APPDATA\Claude\Logs\mcp*.log -Tail 50 -Wait
```

## Installation Issues

### NPX Command Not Found

**Error:**
```
Command not found: npx
```

**Solution:**

1. Install Node.js (includes npx):
   ```bash
   # macOS (using Homebrew)
   brew install node

   # Windows (using installer)
   # Download from https://nodejs.org
   ```

2. Verify installation:
   ```bash
   node --version
   npx --version
   ```

3. Restart Claude Desktop

### Package Installation Fails

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solution:**

**Option 1: Use npx (recommended)**
```json
{
  "command": "npx",
  "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"]
}
```

**Option 2: Fix npm permissions**
```bash
# macOS/Linux
sudo chown -R $USER /usr/local/lib/node_modules
```

**Option 3: Use a different installation location**
```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install -g @iamsamuelfraga/mcp-pipedrive
```

### Wrong Node Version

**Error:**
```
Error: The engine "node" is incompatible with this module.
Expected version ">=18". Got "16.x.x"
```

**Solution:**

1. Update Node.js to version 18 or higher
2. Use nvm (Node Version Manager):
   ```bash
   # Install nvm first, then:
   nvm install 18
   nvm use 18
   ```

### Module Not Found

**Error:**
```
Cannot find module '@iamsamuelfraga/mcp-pipedrive'
```

**Solution:**

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Reinstall:
   ```bash
   npm uninstall -g @iamsamuelfraga/mcp-pipedrive
   npm install -g @iamsamuelfraga/mcp-pipedrive
   ```

3. Or use npx (no installation needed):
   ```json
   {
     "command": "npx",
     "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"]
   }
   ```

## Authentication Issues

### Invalid API Token

**Error:**
```
Error: Unauthorized (401)
Invalid or missing API token
```

**Solution:**

1. Verify your token:
   - Go to https://app.pipedrive.com/settings/api
   - Copy your API token
   - Check it's exactly as shown (no spaces/newlines)

2. Update config:
   ```json
   {
     "env": {
       "PIPEDRIVE_API_TOKEN": "your_exact_token_here"
     }
   }
   ```

3. Restart Claude Desktop

### Token Not Found

**Error:**
```
Error: PIPEDRIVE_API_TOKEN environment variable is required
```

**Solution:**

Ensure `env` block is present in config:
```json
{
  "mcpServers": {
    "pipedrive": {
      "command": "npx",
      "args": ["-y", "@iamsamuelfraga/mcp-pipedrive"],
      "env": {
        "PIPEDRIVE_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Token Permissions

**Error:**
```
Error: Forbidden (403)
Insufficient permissions
```

**Solution:**

1. Check token permissions in Pipedrive
2. Ensure token has access to required resources
3. For admin operations, use an admin token
4. Some operations require specific permissions:
   - User management: Admin access
   - Webhook management: Admin access
   - Field management: May require admin access

### Token Expired/Revoked

**Error:**
```
Error: Unauthorized (401)
Token may have been revoked
```

**Solution:**

1. Generate a new API token in Pipedrive
2. Update your config with the new token
3. Restart Claude Desktop

## Rate Limiting Problems

### Rate Limit Exceeded

**Error:**
```
Error: Too Many Requests (429)
Rate limit exceeded
```

**Solution:**

**Immediate:**
- Wait 60 seconds and try again
- The server automatically retries after 5 seconds

**Long-term:**
1. Reduce request frequency
2. Enable caching (enabled by default)
3. Batch operations instead of individual requests
4. Use list endpoints with pagination

### Understanding Rate Limits

Pipedrive's rate limits:
- **Default**: 100 requests per 2 seconds per user
- **Burst**: Short bursts allowed
- **Per-token**: Each API token has its own limit

MCP Server limits:
- **Default**: 10 requests/second
- **Burst**: 100 token reservoir
- **Refill**: 100 tokens per minute

### Checking Rate Limit Status

**Ask Claude:**
```
Show me system metrics including rate limiter status.
```

Look for:
- `QUEUED`: Requests waiting
- `RUNNING`: Active requests
- `EXECUTING`: Currently executing

## Tool Not Available

### Tool Not Listed

**Problem:** Claude says "I don't have access to that tool"

**Solution:**

1. **Check toolset filtering:**
   ```json
   {
     "env": {
       "PIPEDRIVE_TOOLSETS": "deals,persons,organizations,activities"
     }
   }
   ```
   Remove this line or add the needed category.

2. **Check read-only mode:**
   ```json
   {
     "env": {
       "PIPEDRIVE_READ_ONLY": "true"
     }
   }
   ```
   This disables all write operations. Remove or set to "false".

3. **Restart Claude Desktop** after config changes

4. **Verify tools are loaded:**
   ```
   List all available Pipedrive tools.
   ```

### Tool Category Disabled

**Error:**
```
Tool 'files/upload' not available
```

**Solution:**

Check `PIPEDRIVE_TOOLSETS` includes the category:
```json
{
  "env": {
    "PIPEDRIVE_TOOLSETS": "deals,persons,organizations,activities,files,search,pipelines,notes,fields,system"
  }
}
```

### Read-Only Mode Blocking

**Error:**
```
Skipping write operation in read-only mode
```

**Solution:**

1. Check config:
   ```json
   {
     "env": {
       "PIPEDRIVE_READ_ONLY": "false"
     }
   }
   ```

2. Or remove the line entirely (defaults to false)

3. Restart Claude Desktop

## Validation Errors

### Invalid Input Schema

**Error:**
```
Validation error: Expected number, received string
```

**Solution:**

Check the field type:
- **Numbers**: Use `123` not `"123"`
- **Strings**: Use `"text"` with quotes
- **Dates**: Use `"2025-12-10"` format
- **Booleans**: Use `true/false` not `"true"/"false"`

### Required Field Missing

**Error:**
```
Validation error: Required field 'title' is missing
```

**Solution:**

Include all required fields:
```
Create a deal with title "New Deal"
```

Check tool schema for required fields:
```
What are the required fields for creating a deal?
```

### Invalid Field Value

**Error:**
```
Validation error: Value must be non-negative
```

**Solution:**

Follow field constraints:
- **value**: Must be >= 0
- **probability**: Must be 0-100
- **title**: 1-255 characters
- **email**: Valid email format
- **date**: YYYY-MM-DD format

### Invalid Currency Code

**Error:**
```
Validation error: Currency must be a 3-letter code
```

**Solution:**

Use ISO 4217 currency codes:
- ✅ `USD`, `EUR`, `GBP`
- ❌ `$`, `Dollar`, `usd`

Check available currencies:
```
Show me available currencies in Pipedrive.
```

### Invalid Enum Value

**Error:**
```
Validation error: Status must be one of: open, won, lost
```

**Solution:**

Use exact values from enum:
```
deals/update: {
  id: 123,
  status: "won"
}
```

Not: `"closed"`, `"Win"`, `"WON"`

## Connection Issues

### Cannot Connect to Pipedrive

**Error:**
```
Error: ENOTFOUND api.pipedrive.com
```

**Solution:**

1. **Check internet connection**
   ```bash
   ping api.pipedrive.com
   ```

2. **Check firewall/proxy settings**
   - Ensure HTTPS traffic is allowed
   - Configure proxy if needed

3. **Check Pipedrive status**
   - Visit https://status.pipedrive.com

### SSL/TLS Errors

**Error:**
```
Error: unable to verify the first certificate
```

**Solution:**

1. **Update Node.js** to latest version
2. **Update CA certificates**:
   ```bash
   npm config set cafile /path/to/ca-bundle.crt
   ```

3. **Check system time** is correct

### Timeout Errors

**Error:**
```
Error: Request timeout after 30000ms
```

**Solution:**

1. Check internet connection speed
2. Try again (may be temporary Pipedrive issue)
3. Check Pipedrive status page
4. Reduce request batch size

## Performance Issues

### Slow Response Times

**Problem:** Tools are taking a long time to respond

**Solutions:**

1. **Enable caching** (should be on by default)

2. **Check metrics:**
   ```
   Show me performance metrics.
   ```

3. **Look for:**
   - High average response time
   - Low cache hit rate
   - Many queued requests

4. **Optimize usage:**
   - Use cached resources instead of API calls
   - Batch similar requests
   - Use filters to reduce result sizes

### High Memory Usage

**Problem:** MCP server consuming too much memory

**Solutions:**

1. **Check cache size:**
   ```
   Show me cache statistics.
   ```

2. **Clear cache:**
   ```
   Clear the cache.
   ```
   Uses `system/reset-cache` tool

3. **Restart server:**
   - Restart Claude Desktop

### Request Queue Building Up

**Problem:** Many requests queued, slow processing

**Solutions:**

1. **Check rate limits** (see Rate Limiting section)

2. **Reduce concurrent requests:**
   - Avoid bulk operations when possible
   - Space out requests

3. **Use pagination:**
   ```
   deals/list: {
     start: 0,
     limit: 50
   }
   ```

## Data Issues

### Entity Not Found

**Error:**
```
Error: Deal with ID 12345 not found
```

**Solution:**

1. **Verify ID is correct**
   ```
   Search for deals containing "Acme"
   ```

2. **Check entity wasn't deleted**
   ```
   deals/list: {
     status: "deleted"
   }
   ```

3. **Check permissions** - you may not have access

### Duplicate Entities Created

**Problem:** Multiple persons/organizations created for same entity

**Solution:**

**Prevention:**
1. Always search before creating:
   ```
   persons/search: { term: "john@example.com" }
   ```

2. Use exact match for emails:
   ```
   search/persons: {
     term: "john@example.com",
     exact_match: true
   }
   ```

**Cleanup:**
1. Find duplicates:
   ```
   Find all persons with email containing "john@example.com"
   ```

2. Merge or delete duplicates in Pipedrive UI

### Missing Custom Field Values

**Problem:** Custom fields not showing values

**Solution:**

1. **Check field exists:**
   ```
   Show me all custom fields for deals.
   ```

2. **Verify field key is correct**
   - Field keys are hash values like `abc123def456`
   - Use field names, Claude maps to keys

3. **Check field permissions**
   - Some fields may be hidden based on visibility

### Incorrect Field Values

**Problem:** Values not updating correctly

**Solution:**

1. **For dropdowns, use option IDs:**
   ```
   Show me options for the Industry field.
   ```

2. **Check field type:**
   - Text fields: Use strings
   - Number fields: Use numbers
   - Date fields: Use YYYY-MM-DD format

3. **Verify field is editable:**
   ```
   Get details for field ID 12345
   ```
   Check `edit_flag: true`

## Logging and Debugging

### Enable Debug Logging

Add to config:
```json
{
  "env": {
    "PIPEDRIVE_API_TOKEN": "your_token",
    "LOG_LEVEL": "debug"
  }
}
```

Restart Claude Desktop.

### Log Levels

- `error`: Only errors
- `warn`: Warnings and errors
- `info`: General information (default)
- `debug`: Detailed debugging information

### Reading Logs

**macOS:**
```bash
# Follow logs in real-time
tail -f ~/Library/Logs/Claude/mcp*.log

# Search for errors
grep -i error ~/Library/Logs/Claude/mcp*.log

# Last 100 lines
tail -100 ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```powershell
# Follow logs
Get-Content $env:APPDATA\Claude\Logs\mcp*.log -Tail 50 -Wait

# Search for errors
Select-String -Path "$env:APPDATA\Claude\Logs\mcp*.log" -Pattern "error"
```

### What to Look For in Logs

**Good startup:**
```
[info] Pipedrive MCP server started
[info] toolCount: 94
[info] enabledToolsets: [deals, persons, organizations, activities]
[info] readOnly: false
```

**Authentication success:**
```
[debug] API request successful
[debug] status: 200
```

**Cache hits:**
```
[debug] Cache hit: /pipelines
```

**Rate limiting:**
```
[warn] Rate limit hit, will retry
[debug] Retry after: 5000ms
```

## Common Error Messages

### "Unknown tool: X"

**Cause:** Tool doesn't exist or is filtered out

**Fix:**
1. Check tool name spelling
2. Check `PIPEDRIVE_TOOLSETS` config
3. Check read-only mode for write tools

### "Field 'X' is required"

**Cause:** Missing required field in create/update

**Fix:** Include all required fields
```
Create deal with title "New Deal"
```

### "Invalid date format"

**Cause:** Date not in YYYY-MM-DD format

**Fix:** Use ISO format
- ✅ `2025-12-10`
- ❌ `12/10/2025`
- ❌ `Dec 10, 2025`

### "Cache evicted oldest entry"

**Cause:** Cache is full (500 items max)

**Not an error** - normal operation. Old items are automatically removed.

### "Request failed after retries"

**Cause:** API request failed 3 times

**Fix:**
1. Check internet connection
2. Check Pipedrive status
3. Verify API token is valid
4. Try again later

### "Rate limit reservoir depleted"

**Cause:** Too many requests in short time

**Fix:**
1. Wait 60 seconds
2. Reduce request frequency
3. Use caching more effectively

## Getting Help

### Before Asking for Help

1. **Check this guide** for your specific issue
2. **Review logs** with debug logging enabled
3. **Try basic diagnostics:**
   ```
   Check system health
   Show me metrics
   ```

### Collecting Debug Information

When reporting issues, include:

1. **Error message** (exact text)
2. **What you were trying to do**
3. **Relevant logs** (with debug logging on)
4. **Configuration** (with token redacted)
5. **Environment:**
   ```bash
   node --version
   npm --version
   npx @iamsamuelfraga/mcp-pipedrive --version
   ```

### Where to Get Help

1. **Documentation:**
   - [README.md](../README.md)
   - [WORKFLOWS.md](./WORKFLOWS.md)
   - [CUSTOM_FIELDS.md](./CUSTOM_FIELDS.md)

2. **GitHub Issues:**
   - Search existing: https://github.com/iamsamuelfraga/mcp-pipedrive/issues
   - Create new issue with debug info

3. **GitHub Discussions:**
   - Q&A: https://github.com/iamsamuelfraga/mcp-pipedrive/discussions

4. **Pipedrive Support:**
   - For Pipedrive API issues
   - https://support.pipedrive.com

### Creating a Good Issue Report

**Template:**

```markdown
## Description
Brief description of the issue.

## Steps to Reproduce
1. Configure server with...
2. Ask Claude to...
3. See error...

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Error Message
```
Exact error message here
```

## Environment
- Node version: X.X.X
- Package version: X.X.X
- OS: macOS/Windows
- Claude Desktop version: X.X.X

## Logs
```
Relevant log entries (with debug logging)
```

## Config (redacted)
```json
{
  "env": {
    "PIPEDRIVE_API_TOKEN": "[REDACTED]",
    ...
  }
}
```
```

## Still Having Issues?

If this guide doesn't solve your problem:

1. Enable debug logging
2. Collect the information listed above
3. Open an issue on GitHub
4. Include all debug information

We're here to help!
