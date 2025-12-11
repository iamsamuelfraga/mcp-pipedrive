export interface Metrics {
  requestCount: number;
  errorCount: number;
  totalDuration: number;
  averageDuration: number;
  errorRate: number;
  requestsByEndpoint: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
}

export class MetricsCollector {
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    totalDuration: 0,
    requestsByEndpoint: new Map<string, number>(),
    errorsByEndpoint: new Map<string, number>(),
  };

  recordRequest(endpoint: string, duration: number, error: boolean = false): void {
    this.metrics.requestCount++;
    this.metrics.totalDuration += duration;

    const count = this.metrics.requestsByEndpoint.get(endpoint) || 0;
    this.metrics.requestsByEndpoint.set(endpoint, count + 1);

    if (error) {
      this.metrics.errorCount++;
      const errorCount = this.metrics.errorsByEndpoint.get(endpoint) || 0;
      this.metrics.errorsByEndpoint.set(endpoint, errorCount + 1);
    }
  }

  getMetrics(): Metrics {
    return {
      requestCount: this.metrics.requestCount,
      errorCount: this.metrics.errorCount,
      totalDuration: this.metrics.totalDuration,
      averageDuration:
        this.metrics.requestCount > 0
          ? this.metrics.totalDuration / this.metrics.requestCount
          : 0,
      errorRate:
        this.metrics.requestCount > 0
          ? this.metrics.errorCount / this.metrics.requestCount
          : 0,
      requestsByEndpoint: Object.fromEntries(this.metrics.requestsByEndpoint),
      errorsByEndpoint: Object.fromEntries(this.metrics.errorsByEndpoint),
    };
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalDuration: 0,
      requestsByEndpoint: new Map(),
      errorsByEndpoint: new Map(),
    };
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();
