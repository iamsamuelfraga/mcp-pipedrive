import type { PipedriveClient } from '../../pipedrive-client.js';
import { getListPipelinesTool } from './list.js';
import { getGetPipelineTool } from './get.js';
import { getCreatePipelineTool } from './create.js';
import { getUpdatePipelineTool } from './update.js';
import { getDeletePipelineTool } from './delete.js';
import { getPipelineStageTools } from './stages.js';
import { getPipelineAnalyticsTools } from './analytics.js';

/**
 * Get all pipeline-related tools for the MCP server
 *
 * This function aggregates all 15 pipeline tools into a single object:
 * - Pipeline operations: list, get, create, update, delete (5 tools)
 * - Stage operations: get_stages (by pipeline), get_all, get, create, update, delete, delete_multiple (7 tools)
 * - Analytics operations: conversion_statistics, movement_statistics, deals (3 tools)
 *
 * @param client - The PipedriveClient instance to use for API calls
 * @returns Object containing all pipeline tools with their configurations
 */
export function getPipelineTools(client: PipedriveClient) {
  return {
    ...getListPipelinesTool(client),
    ...getGetPipelineTool(client),
    ...getCreatePipelineTool(client),
    ...getUpdatePipelineTool(client),
    ...getDeletePipelineTool(client),
    ...getPipelineStageTools(client),
    ...getPipelineAnalyticsTools(client),
  };
}
