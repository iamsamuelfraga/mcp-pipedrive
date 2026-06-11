import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListDealFieldsTool } from './deal-fields.js';
import { getListPersonFieldsTool } from './person-fields.js';
import { getListOrganizationFieldsTool } from './org-fields.js';
import { getListActivityFieldsTool } from './activity-fields.js';
import { getListProductFieldsTool } from './product-fields.js';
import { getGetFieldTool } from './get-field.js';
import { getListAllFieldsTool } from './all-fields.js';
import { getSearchFieldsTool } from './search-fields.js';

import { getCreateOrganizationFieldTool } from './create-org-field.js';
import { getUpdateOrganizationFieldTool } from './update-org-field.js';
import { getDeleteOrganizationFieldTool } from './delete-org-field.js';
import { getBulkDeleteOrganizationFieldsTool } from './bulk-delete-org-fields.js';

import { getCreateDealFieldTool } from './create-deal-field.js';
import { getUpdateDealFieldTool } from './update-deal-field.js';
import { getDeleteDealFieldTool } from './delete-deal-field.js';
import { getBulkDeleteDealFieldsTool } from './bulk-delete-deal-fields.js';

import { getCreatePersonFieldTool } from './create-person-field.js';
import { getUpdatePersonFieldTool } from './update-person-field.js';
import { getDeletePersonFieldTool } from './delete-person-field.js';
import { getBulkDeletePersonFieldsTool } from './bulk-delete-person-fields.js';

import { getCreateProductFieldTool } from './create-product-field.js';
import { getUpdateProductFieldTool } from './update-product-field.js';
import { getDeleteProductFieldTool } from './delete-product-field.js';
import { getBulkDeleteProductFieldsTool } from './bulk-delete-product-fields.js';

/**
 * Get all field-related tools for the MCP server
 *
 * This function aggregates all field tools into a single object:
 * - Entity-specific field lists: list_deal_fields, list_person_fields, list_organization_fields, list_activity_fields, list_product_fields
 * - Field retrieval: get_field
 * - Aggregated lists: list_all_fields
 * - Search: search_fields
 * - Organization field management (CRUD): create_organization_field, update_organization_field, delete_organization_field, bulk_delete_organization_fields
 * - Deal field management (CRUD): create_deal_field, update_deal_field, delete_deal_field, bulk_delete_deal_fields
 * - Person field management (CRUD): create_person_field, update_person_field, delete_person_field, bulk_delete_person_fields
 * - Product field management (CRUD): create_product_field, update_product_field, delete_product_field, bulk_delete_product_fields
 *
 * Field definitions are cached (15 minutes); write operations invalidate the cache.
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all field tools with their configurations
 */
export function getFieldTools(client: PipedriveClient) {
  return {
    ...getListDealFieldsTool(client),
    ...getListPersonFieldsTool(client),
    ...getListOrganizationFieldsTool(client),
    ...getListActivityFieldsTool(client),
    ...getListProductFieldsTool(client),
    ...getGetFieldTool(client),
    ...getListAllFieldsTool(client),
    ...getSearchFieldsTool(client),

    ...getCreateOrganizationFieldTool(client),
    ...getUpdateOrganizationFieldTool(client),
    ...getDeleteOrganizationFieldTool(client),
    ...getBulkDeleteOrganizationFieldsTool(client),

    ...getCreateDealFieldTool(client),
    ...getUpdateDealFieldTool(client),
    ...getDeleteDealFieldTool(client),
    ...getBulkDeleteDealFieldsTool(client),

    ...getCreatePersonFieldTool(client),
    ...getUpdatePersonFieldTool(client),
    ...getDeletePersonFieldTool(client),
    ...getBulkDeletePersonFieldsTool(client),

    ...getCreateProductFieldTool(client),
    ...getUpdateProductFieldTool(client),
    ...getDeleteProductFieldTool(client),
    ...getBulkDeleteProductFieldsTool(client),
  };
}
