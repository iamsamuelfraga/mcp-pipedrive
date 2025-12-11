import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockClient } from './mocks/client.mock.js';
import { getUploadFileTool } from '../files/upload.js';
import { getRemoteFileTool } from '../files/remote.js';
import { promises as fs } from 'fs';

// Mock fs module
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('Files Tools', () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    mockClient = createMockClient();
    vi.clearAllMocks();
  });

  describe('files/upload', () => {
    it('should upload file to deal', async () => {
      const mockFileBuffer = Buffer.from('test file content');
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'test.pdf',
          file_type: 'pdf',
          file_size: 1024,
          deal_id: 123,
          add_time: '2025-12-10 10:00:00',
        },
      };

      (fs.readFile as any).mockResolvedValue(mockFileBuffer);
      mockClient.uploadFile.mockResolvedValue(mockResponse);

      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      const result = await tool.handler({
        file_path: '/path/to/test.pdf',
        deal_id: 123,
      });

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/test.pdf');
      expect(mockClient.uploadFile).toHaveBeenCalledWith('/files', mockFileBuffer, 'test.pdf', {
        deal_id: 123,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should upload file to person', async () => {
      const mockFileBuffer = Buffer.from('image data');
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          name: 'photo.jpg',
          file_type: 'jpg',
          file_size: 2048,
          person_id: 456,
        },
      };

      (fs.readFile as any).mockResolvedValue(mockFileBuffer);
      mockClient.uploadFile.mockResolvedValue(mockResponse);

      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      await tool.handler({
        file_path: '/path/to/photo.jpg',
        person_id: 456,
      });

      expect(mockClient.uploadFile).toHaveBeenCalledWith('/files', mockFileBuffer, 'photo.jpg', {
        person_id: 456,
      });
    });

    it('should upload file to multiple entities', async () => {
      const mockFileBuffer = Buffer.from('document');
      const mockResponse = {
        success: true,
        data: {
          id: 3,
          name: 'contract.docx',
          deal_id: 123,
          person_id: 456,
          org_id: 789,
        },
      };

      (fs.readFile as any).mockResolvedValue(mockFileBuffer);
      mockClient.uploadFile.mockResolvedValue(mockResponse);

      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      await tool.handler({
        file_path: '/path/to/contract.docx',
        deal_id: 123,
        person_id: 456,
        org_id: 789,
      });

      expect(mockClient.uploadFile).toHaveBeenCalledWith(
        '/files',
        mockFileBuffer,
        'contract.docx',
        {
          deal_id: 123,
          person_id: 456,
          org_id: 789,
        }
      );
    });

    it('should extract filename from path', async () => {
      const mockFileBuffer = Buffer.from('content');
      const mockResponse = {
        success: true,
        data: { id: 4, name: 'document.pdf' },
      };

      (fs.readFile as any).mockResolvedValue(mockFileBuffer);
      mockClient.uploadFile.mockResolvedValue(mockResponse);

      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      await tool.handler({
        file_path: '/very/long/path/to/document.pdf',
        deal_id: 123,
      });

      expect(mockClient.uploadFile).toHaveBeenCalledWith(
        '/files',
        mockFileBuffer,
        'document.pdf',
        expect.any(Object)
      );
    });

    it('should validate required file_path', async () => {
      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      await expect(tool.handler({ deal_id: 123 })).rejects.toThrow();
      expect(fs.readFile).not.toHaveBeenCalled();
      expect(mockClient.uploadFile).not.toHaveBeenCalled();
    });

    it('should require at least one entity association', async () => {
      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      await expect(tool.handler({ file_path: '/path/to/file.pdf' })).rejects.toThrow();
      expect(mockClient.uploadFile).not.toHaveBeenCalled();
    });

    it('should handle file read errors', async () => {
      (fs.readFile as any).mockRejectedValue(new Error('File not found'));

      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      await expect(tool.handler({ file_path: '/nonexistent.pdf', deal_id: 123 })).rejects.toThrow(
        'File not found'
      );
      expect(mockClient.uploadFile).not.toHaveBeenCalled();
    });

    it('should handle upload API errors', async () => {
      const mockFileBuffer = Buffer.from('content');
      (fs.readFile as any).mockResolvedValue(mockFileBuffer);
      mockClient.uploadFile.mockRejectedValue(new Error('API Error: Upload failed'));

      const tools = getUploadFileTool(mockClient);
      const tool = tools['files/upload'];

      await expect(tool.handler({ file_path: '/path/to/file.pdf', deal_id: 123 })).rejects.toThrow(
        'API Error: Upload failed'
      );
    });
  });

  describe('files/create_remote_link', () => {
    it('should create remote file link', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          name: 'Remote Document',
          remote_location: 'googledrive',
          remote_id: 'abc123',
          deal_id: 123,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getRemoteFileTool(mockClient);
      const tool = tools['files/create_remote_link'];

      const result = await tool.handler({
        item_type: 'deal',
        item_id: 123,
        remote_location: 'googledrive',
        remote_id: 'abc123',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/files/remote', {
        item_type: 'deal',
        item_id: 123,
        remote_location: 'googledrive',
        remote_id: 'abc123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should create remote link with title', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 2,
          name: 'Custom Title',
          remote_location: 'dropbox',
          remote_id: 'xyz789',
          person_id: 456,
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const tools = getRemoteFileTool(mockClient);
      const tool = tools['files/create_remote_link'];

      await tool.handler({
        item_type: 'person',
        item_id: 456,
        remote_location: 'dropbox',
        remote_id: 'xyz789',
        title: 'Custom Title',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/files/remote', {
        item_type: 'person',
        item_id: 456,
        remote_location: 'dropbox',
        remote_id: 'xyz789',
        title: 'Custom Title',
      });
    });

    it('should validate required fields', async () => {
      const tools = getRemoteFileTool(mockClient);
      const tool = tools['files/create_remote_link'];

      await expect(tool.handler({ item_type: 'deal' })).rejects.toThrow();

      await expect(tool.handler({ item_type: 'deal', item_id: 123 })).rejects.toThrow();

      await expect(
        tool.handler({
          item_type: 'deal',
          item_id: 123,
          remote_location: 'googledrive',
        })
      ).rejects.toThrow();

      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate item_type enum', async () => {
      const tools = getRemoteFileTool(mockClient);
      const tool = tools['files/create_remote_link'];

      await expect(
        tool.handler({
          item_type: 'invalid_type',
          item_id: 123,
          remote_location: 'googledrive',
          remote_id: 'abc123',
        })
      ).rejects.toThrow();

      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should validate remote_location enum', async () => {
      const tools = getRemoteFileTool(mockClient);
      const tool = tools['files/create_remote_link'];

      await expect(
        tool.handler({
          item_type: 'deal',
          item_id: 123,
          remote_location: 'invalid_location',
          remote_id: 'abc123',
        })
      ).rejects.toThrow();

      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should support all item types', async () => {
      const itemTypes = ['deal', 'person', 'organization', 'activity', 'product'];

      for (const itemType of itemTypes) {
        const mockResponse = {
          success: true,
          data: {
            id: Math.random(),
            item_type: itemType,
          },
        };

        mockClient.post.mockResolvedValue(mockResponse);

        const tools = getCreateRemoteFileLinkTool(mockClient);
        const tool = tools['files/create_remote_link'];

        await tool.handler({
          item_type: itemType,
          item_id: 123,
          remote_location: 'googledrive',
          remote_id: 'abc123',
        });

        expect(mockClient.post).toHaveBeenCalledWith(
          '/files/remote',
          expect.objectContaining({ item_type: itemType })
        );
      }
    });

    it('should support all remote locations', async () => {
      const remoteLocations = ['googledrive', 'dropbox', 'onedrive', 'box', 'sharepoint'];

      for (const location of remoteLocations) {
        const mockResponse = {
          success: true,
          data: {
            id: Math.random(),
            remote_location: location,
          },
        };

        mockClient.post.mockResolvedValue(mockResponse);

        const tools = getCreateRemoteFileLinkTool(mockClient);
        const tool = tools['files/create_remote_link'];

        await tool.handler({
          item_type: 'deal',
          item_id: 123,
          remote_location: location,
          remote_id: 'abc123',
        });

        expect(mockClient.post).toHaveBeenCalledWith(
          '/files/remote',
          expect.objectContaining({ remote_location: location })
        );
      }
    });
  });
});
