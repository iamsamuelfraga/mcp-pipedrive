import type { PipedriveClient } from '../../pipedrive-client.js';
import { metricsCollector } from '../../utils/metrics.js';

export function getMetricsTool(client: PipedriveClient) {
  return {
    'system/get_metrics': {
      description: `Get performance metrics for the MCP server.

Returns comprehensive statistics about the server's performance including:
- Request counts and error rates
- Average response times
- Requests and errors by endpoint
- Cache statistics (size, hit rate)
- Rate limiter statistics

Useful for monitoring server health, debugging performance issues, and understanding usage patterns.

Metrics are always fresh (not cached) to provide real-time data.

Response includes:
- requestCount: Total number of API requests made
- errorCount: Total number of failed requests
- totalDuration: Cumulative request duration in milliseconds
- averageDuration: Average request duration in milliseconds
- errorRate: Percentage of requests that failed (0.0 to 1.0)
- requestsByEndpoint: Request count breakdown by endpoint
- errorsByEndpoint: Error count breakdown by endpoint
- cacheStats: Current cache size and statistics
- rateLimiterStats: Rate limiter queue and token information
- timestamp: Current server time

Common use cases:
- Monitor server performance
- Debug slow responses or errors
- Analyze usage patterns
- Check cache effectiveness`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        const metrics = metricsCollector.getMetrics();
        const cacheStats = client.getCacheStats();
        const rateLimiterStats = client.getRateLimiterStats();

        return {
          ...metrics,
          cacheStats,
          rateLimiterStats,
          timestamp: new Date().toISOString(),
        };
      },
    },
  };
}
