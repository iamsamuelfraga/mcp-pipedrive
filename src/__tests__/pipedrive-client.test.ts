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
