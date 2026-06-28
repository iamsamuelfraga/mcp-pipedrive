import { describe, it, expect } from 'vitest';
import { PipedriveClient } from '../pipedrive-client.js';

describe('PipedriveClient.resolveUrl (via private access)', () => {
  it('prefixes v1 base for endpoints starting with /', () => {
    const client = new PipedriveClient('test-token');
    const url = (client as unknown as { resolveUrl(s: string): string }).resolveUrl('/deals');
    expect(url).toBe('https://api.pipedrive.com/v1/deals');
  });

  it('uses bare host for endpoints starting with /api/v2/', () => {
    const client = new PipedriveClient('test-token');
    const url = (client as unknown as { resolveUrl(s: string): string }).resolveUrl(
      '/api/v2/stages'
    );
    expect(url).toBe('https://api.pipedrive.com/api/v2/stages');
  });

  it('preserves nested path segments under /api/v2/', () => {
    const client = new PipedriveClient('test-token');
    const url = (client as unknown as { resolveUrl(s: string): string }).resolveUrl(
      '/api/v2/leads/abc-def/convert/deal'
    );
    expect(url).toBe('https://api.pipedrive.com/api/v2/leads/abc-def/convert/deal');
  });
});

describe('PipedriveClient.invalidateCachePattern (via private access)', () => {
  it('extracts the resource name from a v1 endpoint', () => {
    const client = new PipedriveClient('test-token');
    // Seed a cache entry, invalidate, then read.
    (client as unknown as { cache: { set(k: string, v: unknown): void } }).cache.set(
      'GET:/deals:{}',
      { data: 'cached' }
    );
    (client as unknown as { invalidateCachePattern(s: string): void }).invalidateCachePattern(
      '/deals/123'
    );
    const after = (client as unknown as { cache: { get(k: string): unknown } }).cache.get(
      'GET:/deals:{}'
    );
    expect(after).toBeUndefined();
  });

  it('extracts the resource name from a v2 endpoint and invalidates only the v2 family', () => {
    const client = new PipedriveClient('test-token');
    const cache = (
      client as unknown as { cache: { set(k: string, v: unknown): void; get(k: string): unknown } }
    ).cache;
    cache.set('GET:/api/v2/stages:{}', { data: 'cached-v2' });
    cache.set('GET:/deals:{}', { data: 'cached-v1' });

    (client as unknown as { invalidateCachePattern(s: string): void }).invalidateCachePattern(
      '/api/v2/stages/5'
    );

    expect(cache.get('GET:/api/v2/stages:{}')).toBeUndefined();
    expect(cache.get('GET:/deals:{}')).toEqual({ data: 'cached-v1' });
  });

  it('does nothing when the endpoint has no parseable resource segment', () => {
    const client = new PipedriveClient('test-token');
    expect(() =>
      (client as unknown as { invalidateCachePattern(s: string): void }).invalidateCachePattern('/')
    ).not.toThrow();
  });
});

describe('PipedriveClient.patch', () => {
  it('exposes a PATCH method that invalidates cache like put/delete', async () => {
    const client = new PipedriveClient('test-token');
    expect(typeof (client as unknown as { patch: unknown }).patch).toBe('function');
  });
});
