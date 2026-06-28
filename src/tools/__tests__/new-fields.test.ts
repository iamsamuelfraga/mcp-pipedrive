import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockClient } from '../../__tests__/mocks/client.mock.js';
import { getListLeadFieldsTool } from '../fields/lead-fields.js';
import { getListNoteFieldsTool } from '../fields/note-fields.js';
import { getProjectFieldTools } from '../fields/project-fields.js';

describe('lead & note fields (read-only)', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('lead fields list GETs /leadFields with cache', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [] });
    const tools = getListLeadFieldsTool(mockClient);
    await tools['fields_list_lead_fields'].handler({});
    expect(mockClient.get).toHaveBeenCalledWith(
      '/leadFields',
      undefined,
      expect.objectContaining({ enabled: true })
    );
  });

  it('note fields list GETs /noteFields with cache', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [] });
    const tools = getListNoteFieldsTool(mockClient);
    await tools['fields_list_note_fields'].handler({});
    expect(mockClient.get).toHaveBeenCalledWith(
      '/noteFields',
      undefined,
      expect.objectContaining({ enabled: true })
    );
  });
});

describe('project fields CRUD (API v2)', () => {
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  it('list GETs /api/v2/projectFields', async () => {
    mockClient.get.mockResolvedValue({ success: true, data: [] });
    const tools = getProjectFieldTools(mockClient);
    await tools['fields_list_project_fields'].handler({});
    expect(mockClient.get).toHaveBeenCalledWith(
      '/api/v2/projectFields',
      undefined,
      expect.objectContaining({ enabled: true })
    );
  });

  it('create posts to /api/v2/projectFields', async () => {
    mockClient.post.mockResolvedValue({ success: true, data: { field_code: 'abc' } });
    const tools = getProjectFieldTools(mockClient);
    await tools['fields_create_project_field'].handler({ name: 'Budget', field_type: 'monetary' });
    expect(mockClient.post).toHaveBeenCalledWith(
      '/api/v2/projectFields',
      expect.objectContaining({ name: 'Budget', field_type: 'monetary' })
    );
  });

  it('create rejects enum field without options', async () => {
    const tools = getProjectFieldTools(mockClient);
    await expect(
      tools['fields_create_project_field'].handler({ name: 'Stage', field_type: 'enum' })
    ).rejects.toThrow();
  });

  it('update patches /api/v2/projectFields/{field_code} with field_code stripped', async () => {
    mockClient.patch.mockResolvedValue({ success: true, data: { field_code: 'abc' } });
    const tools = getProjectFieldTools(mockClient);
    await tools['fields_update_project_field'].handler({ field_code: 'abc', name: 'Renamed' });
    expect(mockClient.patch).toHaveBeenCalledWith('/api/v2/projectFields/abc', { name: 'Renamed' });
  });

  it('delete sends DELETE /api/v2/projectFields/{field_code}', async () => {
    mockClient.delete.mockResolvedValue({ success: true, data: {} });
    const tools = getProjectFieldTools(mockClient);
    await tools['fields_delete_project_field'].handler({ field_code: 'abc' });
    expect(mockClient.delete).toHaveBeenCalledWith('/api/v2/projectFields/abc');
  });
});
