import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListProductsTool, getListAllProductsAutoTool } from './list.js';
import { getCreateProductTool } from './create.js';
import { getGetProductTool } from './get.js';
import { getUpdateProductTool } from './update.js';
import { getDeleteProductTool } from './delete.js';
import { getSearchProductsTool } from './search.js';
import { getListProductDealsTool } from './deals.js';
import { getListProductFilesTool } from './files.js';
import {
  getAddProductFollowerTool,
  getListProductFollowersTool,
  getDeleteProductFollowerTool
} from './followers.js';
import { getProductPermittedUsersTool } from './permitted-users.js';

/**
 * Get all product-related tools
 */
export function getProductTools(client: PipedriveClient) {
  return [
    // List and pagination
    getListProductsTool(client),
    getListAllProductsAutoTool(client),

    // CRUD operations
    getCreateProductTool(client),
    getGetProductTool(client),
    getUpdateProductTool(client),
    getDeleteProductTool(client),

    // Search
    getSearchProductsTool(client),

    // Related entities
    getListProductDealsTool(client),
    getListProductFilesTool(client),

    // Followers
    getAddProductFollowerTool(client),
    getListProductFollowersTool(client),
    getDeleteProductFollowerTool(client),

    // Permissions
    getProductPermittedUsersTool(client),
  ];
}
