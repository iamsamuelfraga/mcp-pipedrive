import type { PipedriveClient } from '../../pipedrive-client.js';
import { UploadFileFromPathSchema } from '../../schemas/file.js';
import { readFile } from 'fs/promises';
import { basename } from 'path';

export function getUploadFileTool(client: PipedriveClient) {
  return {
    'files_upload': {
      description: `Upload a file to Pipedrive and attach it to a deal, person, organization, activity, or product.

Uploads a file from the specified file path and associates it with at least one entity.

Workflow tips:
- Provide the full file path to upload
- At least one entity ID must be provided (deal_id, person_id, org_id, activity_id, or product_id)
- The file name will be extracted from the path automatically
- Supports all common file types (documents, images, videos, etc.)
- Maximum file size depends on your Pipedrive plan

Common use cases:
- Attach contract to deal: { "file_path": "/path/contract.pdf", "deal_id": 123 }
- Add profile photo to person: { "file_path": "/path/photo.jpg", "person_id": 456 }
- Upload document to organization: { "file_path": "/path/doc.docx", "org_id": 789 }
- Attach multiple entities: { "file_path": "/path/file.pdf", "deal_id": 123, "person_id": 456 }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          file_path: {
            type: 'string',
            description: 'Path to the file to upload',
          },
          deal_id: { type: 'number', description: 'ID of the deal to attach the file to' },
          person_id: { type: 'number', description: 'ID of the person to attach the file to' },
          org_id: { type: 'number', description: 'ID of the organization to attach the file to' },
          activity_id: { type: 'number', description: 'ID of the activity to attach the file to' },
          product_id: { type: 'number', description: 'ID of the product to attach the file to' },
          lead_id: { type: 'number', description: 'ID of the lead to attach the file to' },
        },
        required: ['file_path'],
      },
      handler: async (args: unknown) => {
        const validated = UploadFileFromPathSchema.parse(args);
        const { file_path, ...entityIds } = validated;

        // Read file from disk
        const fileBuffer = await readFile(file_path);
        const fileName = basename(file_path);

        // Build additional fields for entity associations
        const additionalFields: Record<string, number> = {};
        if (entityIds.deal_id) additionalFields.deal_id = entityIds.deal_id;
        if (entityIds.person_id) additionalFields.person_id = entityIds.person_id;
        if (entityIds.org_id) additionalFields.org_id = entityIds.org_id;
        if (entityIds.activity_id) additionalFields.activity_id = entityIds.activity_id;
        if (entityIds.product_id) additionalFields.product_id = entityIds.product_id;

        return client.uploadFile('/files', fileBuffer, fileName, additionalFields);
      },
    },
  };
}
