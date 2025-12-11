import { logger } from './logger.js';

export class BatchProcessor<TInput, TOutput> {
  private batchSize: number;
  private batchDelay: number;

  constructor(batchSize = 100, batchDelay = 50) {
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  async processBatch(
    items: TInput[],
    processor: (batch: TInput[]) => Promise<TOutput[]>,
    onProgress?: (processed: number, total: number) => void
  ): Promise<TOutput[]> {
    const results: TOutput[] = [];
    const batches = this.chunk(items, this.batchSize);

    logger.info('Processing batches', {
      totalItems: items.length,
      batchCount: batches.length,
      batchSize: this.batchSize,
    });

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.debug('Processing batch', { batchIndex: i + 1, batchSize: batch.length });

      const batchResults = await processor(batch);
      results.push(...batchResults);

      onProgress?.(results.length, items.length);

      // Delay between batches to avoid rate limits
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.batchDelay));
      }
    }

    logger.info('Batch processing completed', {
      totalProcessed: results.length,
    });

    return results;
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
