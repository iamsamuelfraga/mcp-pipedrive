import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListCallLogsTool } from './list.js';
import { getGetCallLogTool } from './get.js';
import { getCreateCallLogTool } from './create.js';
import { getAttachAudioTool } from './attach-audio.js';
import { getDeleteCallLogTool } from './delete.js';

/**
 * Get all call log-related tools for the MCP server
 *
 * This function aggregates all 5 call log tools into a single object:
 * - List operations: list
 * - CRUD operations: get, create, delete
 * - Audio operations: attach_audio
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all call log tools with their configurations
 */
export function getCallLogTools(client: PipedriveClient) {
  return {
    ...getListCallLogsTool(client),
    ...getGetCallLogTool(client),
    ...getCreateCallLogTool(client),
    ...getAttachAudioTool(client),
    ...getDeleteCallLogTool(client),
  };
}
