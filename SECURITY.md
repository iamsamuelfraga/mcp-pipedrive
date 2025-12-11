# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of the Pipedrive MCP Server seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Public Disclose

**Please do not open a public GitHub issue for security vulnerabilities.** Public disclosure can put the entire community at risk.

### 2. Report Privately

Send a detailed report to:

**Email**: [Your security contact email - update this]

Or use GitHub's private security advisory feature:

1. Go to the [Security tab](https://github.com/iamsamuelfraga/mcp-pipedrive/security)
2. Click "Report a vulnerability"
3. Fill out the form with details

### 3. Include in Your Report

To help us assess and fix the vulnerability quickly, please include:

- **Description**: Clear explanation of the vulnerability
- **Impact**: What could an attacker achieve?
- **Steps to reproduce**: Detailed reproduction steps
- **Affected versions**: Which versions are affected?
- **Suggested fix**: If you have ideas for fixing it
- **Your environment**: Node version, OS, etc.

### Example Report

```
Subject: [SECURITY] API Token Exposure in Logs

Description:
The server logs API tokens in plain text when debug logging is enabled,
potentially exposing credentials in log files.

Impact:
An attacker with access to log files could steal API tokens and gain
unauthorized access to Pipedrive accounts.

Steps to Reproduce:
1. Enable LOG_LEVEL=debug
2. Start the server
3. Trigger any API call
4. Check logs - API token is visible in request headers

Affected Versions:
All versions up to 1.2.3

Suggested Fix:
Redact API tokens in logger.ts before writing to logs.

Environment:
- Node.js: 18.17.0
- OS: macOS 14.0
- Package version: 1.2.3
```

## Response Timeline

We will respond to security reports according to the following timeline:

- **24 hours**: Acknowledge receipt of your report
- **72 hours**: Provide initial assessment and severity rating
- **7 days**: Provide a fix timeline or mitigation steps
- **30 days**: Release a patch (for critical vulnerabilities, much sooner)

## Security Best Practices

### For Users

#### 1. Protect Your API Token

**Never commit API tokens to version control:**

```bash
# WRONG - Don't do this
git commit -m "add config" claude_desktop_config.json

# RIGHT - Use environment variables
# Add to .gitignore:
echo "claude_desktop_config.json" >> .gitignore
```

**Use environment variables or secure secret management:**

- Store tokens in environment variables
- Use a password manager for token storage
- Rotate tokens regularly (every 90 days recommended)
- Use separate tokens for development and production

#### 2. Principle of Least Privilege

Grant Pipedrive API tokens only the minimum permissions needed:

1. In Pipedrive, go to Settings > Personal Preferences > API
2. Create separate tokens for different use cases
3. Regularly audit token usage
4. Revoke unused tokens immediately

#### 3. Enable Read-Only Mode When Appropriate

For exploratory use or when you don't need write access:

```json
{
  "env": {
    "PIPEDRIVE_API_TOKEN": "your_token",
    "PIPEDRIVE_READ_ONLY": "true"
  }
}
```

#### 4. Monitor for Suspicious Activity

- Check Pipedrive audit logs regularly
- Monitor for unexpected API usage
- Set up alerts for unusual patterns
- Review connected applications periodically

#### 5. Keep Software Updated

```bash
# Check for updates regularly
npm outdated -g @iamsamuelfraga/mcp-pipedrive

# Update to latest version
npm update -g @iamsamuelfraga/mcp-pipedrive
```

#### 6. Secure Your Development Environment

- Use encrypted file systems
- Enable file system access controls
- Don't share development machines
- Use secure network connections

### For Contributors

#### 1. Code Security

- Never log sensitive data (tokens, passwords, PII)
- Validate all inputs with Zod schemas
- Sanitize user inputs before API calls
- Use parameterized queries/requests
- Avoid eval() and similar dynamic code execution

#### 2. Dependency Security

```bash
# Audit dependencies regularly
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Check for outdated packages
npm outdated
```

#### 3. Secrets in Tests

```typescript
// WRONG - Hardcoded secrets
const token = 'abc123';

// RIGHT - Use environment variables or mocks
const token = process.env.PIPEDRIVE_API_TOKEN || 'mock_token_for_tests';
```

#### 4. Secure Communication

- Only use HTTPS for API calls
- Verify SSL certificates
- Don't disable certificate validation
- Use TLS 1.2 or higher

## Known Security Considerations

### 1. API Token Storage

The MCP server receives the API token through environment variables configured in Claude Desktop. The token is:

- Stored in memory only (never persisted to disk by this server)
- Not logged (even in debug mode)
- Not transmitted except to Pipedrive API over HTTPS
- Cleared when the process terminates

**User Responsibility**: The token is stored in Claude Desktop's config file. Users should:
- Protect this file with appropriate file permissions (chmod 600)
- Encrypt their file system
- Not share their config file

### 2. Rate Limiting

The server implements rate limiting to prevent abuse:

- 10 requests/second default
- Burst capacity of 100 requests
- Automatic retry with backoff

This protects against accidental DDoS of your Pipedrive account.

### 3. Input Validation

All tool inputs are validated with Zod schemas:

- Type checking
- Range validation
- Format verification
- Required field enforcement

This prevents injection attacks and malformed requests.

### 4. Error Information Disclosure

Errors are sanitized before being returned to prevent information leakage:

- API tokens are never included in errors
- Internal paths are not exposed
- Stack traces are limited in production
- PII is redacted

### 5. Dependency Vulnerabilities

We use automated tools to detect dependency vulnerabilities:

- GitHub Dependabot alerts
- npm audit in CI/CD
- Regular dependency updates

## Security Features

### 1. HTTPS Only

All API communication uses HTTPS:

```typescript
// Enforced in PipedriveClient
const API_BASE = 'https://api.pipedrive.com/v1';
```

### 2. Input Sanitization

All inputs are validated before being sent to Pipedrive:

```typescript
const validated = CreateDealSchema.parse(args);
// Zod throws on invalid input, preventing injection
```

### 3. Rate Limiting

Prevents abuse and protects your API quota:

```typescript
const limiter = new RateLimiter({
  minTime: 100,        // 10 req/s
  maxConcurrent: 5,
  reservoir: 100,
});
```

### 4. Error Handling

Sensitive information is never exposed in errors:

```typescript
// API tokens and internal details are redacted
return handleToolError(error);
```

### 5. Read-Only Mode

Prevent accidental modifications:

```typescript
if (READ_ONLY && isWriteOperation(toolName)) {
  throw new Error('Write operations disabled in read-only mode');
}
```

## Vulnerability Disclosure Policy

When we fix a security vulnerability:

1. **Patch Released**: Fix is deployed in a new version
2. **Security Advisory**: Published on GitHub Security Advisories
3. **Notification**: Users notified through GitHub releases
4. **Credit**: Reporter credited (if desired) in advisory

## Security Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

<!-- This section will be populated with contributors who report valid security issues -->

*No vulnerabilities have been reported yet.*

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [Pipedrive API Security](https://pipedrive.readme.io/docs/core-api-concepts-authentication)

## Questions?

For security-related questions that are not vulnerabilities:

- Open a GitHub Discussion
- Tag with `security` label
- Contact maintainers

Thank you for helping keep Pipedrive MCP Server secure!
