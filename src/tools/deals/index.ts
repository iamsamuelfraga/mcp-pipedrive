import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListDealsTools } from './list.js';
import { getCreateDealTool } from './create.js';
import { getGetDealTool } from './get.js';
import { getUpdateDealTools } from './update.js';
import { getDeleteDealTool } from './delete.js';
import { getDuplicateDealTool } from './duplicate.js';
import { getSearchDealsTool } from './search.js';
import { getSummaryTools } from './summary.js';
import { getFollowerTools } from './followers.js';
import { getParticipantTools } from './participants.js';
import { getProductTools } from './products.js';
import { getFileTools } from './files.js';
import { getTimelineTools } from './timeline.js';
import { getActivityTools } from './activities.js';
import { getUpdateTools } from './updates.js';
import { getMailTools } from './mail.js';
import { getMergeTools } from './merge.js';
import { getPermissionTools } from './permissions.js';
import { getPersonTools } from './persons.js';
import { getStatusTools } from './status.js';
import { getBulkTools } from './bulk.js';

/**
 * Get all deal-related tools for the MCP server
 *
 * This function aggregates all 37 deal tools into a single object:
 * - List operations: list, list_all_auto, list_archived
 * - CRUD operations: create, get, update, delete, duplicate
 * - Search operations: search
 * - Stage operations: move_to_stage
 * - Analytics: get_summary, get_archived_summary, get_deals_timeline, get_archived_deals_timeline
 * - Followers: add_follower, remove_follower, list_followers
 * - Participants: add_participant, remove_participant, list_participants
 * - Products: add_product, update_product, remove_product, list_products
 * - Files: attach_file, list_files
 * - Activities: list_activities
 * - Updates: list_field_updates, list_updates, list_participant_updates
 * - Mail: list_mail_messages
 * - Merge: merge
 * - Permissions: list_permitted_users
 * - Persons: list_persons
 * - Status: mark_as_won, mark_as_lost
 * - Bulk: bulk_delete
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all deal tools with their configurations
 */
export function getDealTools(client: PipedriveClient) {
  return {
    ...getListDealsTools(client),
    ...getCreateDealTool(client),
    ...getGetDealTool(client),
    ...getUpdateDealTools(client),
    ...getDeleteDealTool(client),
    ...getDuplicateDealTool(client),
    ...getSearchDealsTool(client),
    ...getSummaryTools(client),
    ...getFollowerTools(client),
    ...getParticipantTools(client),
    ...getProductTools(client),
    ...getFileTools(client),
    ...getTimelineTools(client),
    ...getActivityTools(client),
    ...getUpdateTools(client),
    ...getMailTools(client),
    ...getMergeTools(client),
    ...getPermissionTools(client),
    ...getPersonTools(client),
    ...getStatusTools(client),
    ...getBulkTools(client),
  };
}
