export interface PaginatedResponse<T> {
  data: T[];
  success?: boolean;
  additional_data?: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
      next_start?: number;
    };
  };
}

export class PaginationHelper<T> {
  constructor(
    private fetcher: (start: number, limit: number) => Promise<PaginatedResponse<T>>
  ) {}

  async *iterate(limit: number = 100): AsyncGenerator<T[], void, unknown> {
    let start = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetcher(start, limit);
      const data = response.data || [];

      if (data.length > 0) {
        yield data;
      }

      hasMore = response.additional_data?.pagination?.more_items_in_collection ?? false;
      start = response.additional_data?.pagination?.next_start ?? start + limit;

      if (!hasMore) break;
    }
  }

  async fetchAll(limit: number = 100, maxItems?: number): Promise<T[]> {
    const allItems: T[] = [];

    for await (const items of this.iterate(limit)) {
      allItems.push(...items);

      if (maxItems && allItems.length >= maxItems) {
        return allItems.slice(0, maxItems);
      }
    }

    return allItems;
  }

  async fetchPage(start: number = 0, limit: number = 100): Promise<PaginatedResponse<T>> {
    return this.fetcher(start, limit);
  }
}
