import type { PipedriveClient } from '../../pipedrive-client.js';
import {
  GetPipelineStagesSchema,
  CreateStageSchema,
  UpdateStageSchema,
  GetStageSchema,
  GetAllStagesSchema,
  DeleteStageSchema,
  DeleteMultipleStagesSchema,
} from '../../schemas/pipeline.js';

export function getPipelineStageTools(client: PipedriveClient) {
  return {
    'pipelines_get_stages': {
      description: `Get all stages for a specific pipeline.

Returns all stages in a pipeline with their configuration.

Workflow tips:
- Returns stages in order (by order_nr)
- Shows deal probability for each stage
- Includes rotten deal settings
- Use this to get stage IDs for deal creation

Common use cases:
- Get stages: { "id": 1 }
- Find stage ID for deal placement
- Check stage probabilities
- Review stage order`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the pipeline' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetPipelineStagesSchema.parse(args);
        return client.get(
          `/pipelines/${validated.id}/stages`,
          {},
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },

    'stages_create': {
      description: `Create a new stage in a pipeline.

Adds a new stage to a pipeline with specified configuration.

Workflow tips:
- name and pipeline_id are required
- Set order_nr to control stage position
- deal_probability (0-100) sets win likelihood
- Enable rotten_flag to mark stale deals
- rotten_days sets how long before deals become rotten
- Stages appear in pipeline by order_nr

Common use cases:
- Simple stage: { "name": "Proposal", "pipeline_id": 1 }
- Ordered stage: { "name": "Negotiation", "pipeline_id": 1, "order_nr": 3 }
- Stage with probability: { "name": "Closing", "pipeline_id": 1, "deal_probability": 80 }
- Rotten tracking: { "name": "Follow-up", "pipeline_id": 1, "rotten_flag": true, "rotten_days": 7 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Stage name (required, max 255 chars)' },
          pipeline_id: { type: 'number', description: 'ID of the pipeline (required)' },
          order_nr: { type: 'number', description: 'Order number for stage position' },
          deal_probability: {
            type: 'number',
            description: 'Deal success probability 0-100',
          },
          rotten_flag: { type: 'boolean', description: 'Enable rotten deal tracking' },
          rotten_days: { type: 'number', description: 'Days until deal becomes rotten' },
        },
        required: ['name', 'pipeline_id'],
      },
      handler: async (args: unknown) => {
        const validated = CreateStageSchema.parse(args);
        return client.post('/stages', validated);
      },
    },

    'stages_update': {
      description: `Update an existing stage.

Updates stage configuration including name, order, probability, and rotten settings.

Workflow tips:
- All fields except id are optional
- Use order_nr to reorder stages
- Update deal_probability to adjust win likelihood
- Enable/disable rotten_flag for stale deal tracking
- Can move stage to different pipeline with pipeline_id

Common use cases:
- Rename stage: { "id": 1, "name": "New Proposal" }
- Reorder stage: { "id": 1, "order_nr": 2 }
- Set probability: { "id": 1, "deal_probability": 75 }
- Enable rotten tracking: { "id": 1, "rotten_flag": true, "rotten_days": 14 }
- Move to pipeline: { "id": 1, "pipeline_id": 2 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the stage to update' },
          name: { type: 'string', description: 'New stage name (max 255 chars)' },
          order_nr: { type: 'number', description: 'New order number' },
          deal_probability: { type: 'number', description: 'New probability 0-100' },
          rotten_flag: { type: 'boolean', description: 'Enable/disable rotten tracking' },
          rotten_days: { type: 'number', description: 'Days until rotten' },
          pipeline_id: { type: 'number', description: 'Move to different pipeline' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = UpdateStageSchema.parse(args);
        const { id, ...updateData } = validated;

        return client.put(`/stages/${id}`, updateData);
      },
    },

    'stages_get_all': {
      description: `Get all stages across all pipelines or filter by pipeline.

Returns data about all stages with their configuration.

Workflow tips:
- Omit pipeline_id to get stages from all pipelines
- Use pipeline_id to filter stages for a specific pipeline
- Returns stages with order, probability, and rotten settings
- Shows which pipeline each stage belongs to
- Results include pagination info

Common use cases:
- Get all stages: {}
- Get all stages: { "pipeline_id": null }
- Filter by pipeline: { "pipeline_id": 1 }
- Review all stage configurations across pipelines
- Find stage IDs for deal management`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          pipeline_id: {
            type: 'number',
            description: 'Optional pipeline ID to filter stages (omit for all stages)',
          },
        },
      },
      handler: async (args: unknown) => {
        const validated = GetAllStagesSchema.parse(args);
        const params: Record<string, number> = {};

        if (validated.pipeline_id !== undefined && validated.pipeline_id !== null) {
          params.pipeline_id = validated.pipeline_id;
        }

        return client.get(
          '/stages',
          params,
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },

    'stages_get': {
      description: `Get a single stage by ID.

Returns detailed data about a specific stage.

Workflow tips:
- Get full stage configuration by ID
- Returns name, order, probability, rotten settings
- Shows which pipeline the stage belongs to
- Includes timestamps (add_time, update_time)
- Use for verifying stage details before updates

Common use cases:
- Get stage details: { "id": 1 }
- Verify stage configuration
- Check stage before moving deals
- Review stage settings`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the stage to retrieve' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = GetStageSchema.parse(args);
        return client.get(
          `/stages/${validated.id}`,
          {},
          { enabled: true, ttl: 300000 } // Cache for 5 minutes
        );
      },
    },

    'stages_delete': {
      description: `Delete a single stage.

Marks a stage as deleted in Pipedrive.

Workflow tips:
- Deleting a stage is irreversible
- Deals in the deleted stage may need to be moved first
- Stage ID is required
- Returns the deleted stage ID on success
- Consider moving deals before deleting stage

Common use cases:
- Delete stage: { "id": 1 }
- Clean up unused stages
- Remove deprecated workflow stages
- Consolidate pipeline stages`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'number', description: 'ID of the stage to delete' },
        },
        required: ['id'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteStageSchema.parse(args);
        return client.delete(`/stages/${validated.id}`);
      },
    },

    'stages_delete_multiple': {
      description: `Delete multiple stages in bulk.

Marks multiple stages as deleted in one operation.

Note: This endpoint has been deprecated by Pipedrive. Consider using stages_delete for each stage instead.

Workflow tips:
- Provide comma-separated stage IDs
- All specified stages will be deleted
- Deletion is irreversible
- Consider impact on deals in these stages
- Returns array of deleted stage IDs

Common use cases:
- Delete multiple stages: { "ids": "1,2,3" }
- Bulk cleanup of unused stages
- Remove multiple deprecated stages
- Pipeline reorganization`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          ids: {
            type: 'string',
            description: 'Comma-separated stage IDs to delete (e.g., "1,2,3")',
          },
        },
        required: ['ids'],
      },
      handler: async (args: unknown) => {
        const validated = DeleteMultipleStagesSchema.parse(args);
        return client.delete('/stages', { ids: validated.ids });
      },
    },
  };
}
