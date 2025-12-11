import type { PipedriveClient } from '../../pipedrive-client.js';
import { getUploadFileTool } from './upload.js';
import { getListFilesTool } from './list.js';
import { getGetFileTool } from './get.js';
import { getDownloadFileTool } from './download.js';
import { getUpdateFileTool } from './update.js';
import { getDeleteFileTool } from './delete.js';
import { getRemoteFileTool } from './remote.js';

/**
 * Get all file-related tools for the MCP server
 *
 * This function aggregates all 7 file tools into a single object:
 * - Upload: files_upload
 * - List: files_list
 * - Read: files_get, files_download
 * - Update: files_update
 * - Delete: files_delete
 * - Remote links: files_create_remote_link
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all file tools with their configurations
 */
export function getFileTools(client: PipedriveClient) {
  return {
    ...getUploadFileTool(client),
    ...getListFilesTool(client),
    ...getGetFileTool(client),
    ...getDownloadFileTool(client),
    ...getUpdateFileTool(client),
    ...getDeleteFileTool(client),
    ...getRemoteFileTool(client),
  };
}
