import type { PipedriveClient } from '../../pipedrive-client.js';
import { getCreateNoteTool } from './create.js';
import { getListNotesTool } from './list.js';
import { getGetNoteTool } from './get.js';
import { getUpdateNoteTool } from './update.js';
import { getDeleteNoteTool } from './delete.js';
import { getListNoteCommentsTool } from './list-comments.js';
import { getAddNoteCommentTool } from './add-comment.js';
import { getUpdateNoteCommentTool } from './update-comment.js';
import { getDeleteNoteCommentTool } from './delete-comment.js';

/**
 * Get all note-related tools for the MCP server
 *
 * This function aggregates all 9 note tools into a single object:
 * - Create: create
 * - List: list
 * - Read: get
 * - Update: update
 * - Delete: delete
 * - List comments: list_comments
 * - Add comment: add_comment
 * - Update comment: update_comment
 * - Delete comment: delete_comment
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all note tools with their configurations
 */
export function getNoteTools(client: PipedriveClient) {
  return {
    ...getCreateNoteTool(client),
    ...getListNotesTool(client),
    ...getGetNoteTool(client),
    ...getUpdateNoteTool(client),
    ...getDeleteNoteTool(client),
    ...getListNoteCommentsTool(client),
    ...getAddNoteCommentTool(client),
    ...getUpdateNoteCommentTool(client),
    ...getDeleteNoteCommentTool(client),
  };
}
