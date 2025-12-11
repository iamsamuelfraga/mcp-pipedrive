import type { PipedriveClient } from '../../pipedrive-client.js';
import { LinkRemoteFileSchema } from '../../schemas/file.js';

export function getRemoteFileTool(client: PipedriveClient) {
  return {
    'files_create_remote_link': {
      description: `Link a remote file from Google Drive, Dropbox, OneDrive, Box, or SharePoint.

Creates a link to a file stored in external cloud storage and associates it with a Pipedrive entity.

Workflow tips:
- Supported platforms: googledrive, dropbox, onedrive, box, sharepoint
- Provide the remote file's ID from the cloud storage platform
- Specify which entity type and ID to link to
- Remote files appear alongside uploaded files in Pipedrive

Common use cases:
- Link Google Drive file to deal: { "item_type": "deal", "item_id": 123, "remote_id": "1a2b3c", "remote_location": "googledrive" }
- Link Dropbox file to person: { "item_type": "person", "item_id": 456, "remote_id": "xyz789", "remote_location": "dropbox" }
- Link OneDrive file to org: { "item_type": "organization", "item_id": 789, "remote_id": "abc123", "remote_location": "onedrive" }`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          item_type: {
            type: 'string',
            enum: ['deal', 'person', 'organization', 'activity', 'product'],
            description: 'Type of item to link the file to',
          },
          item_id: { type: 'number', description: 'ID of the item to link the file to' },
          remote_id: { type: 'string', description: 'ID of the file in the remote system' },
          remote_location: {
            type: 'string',
            enum: ['googledrive', 'dropbox', 'onedrive', 'box', 'sharepoint'],
            description: 'Remote file storage location',
          },
        },
        required: ['item_type', 'item_id', 'remote_id', 'remote_location'],
      },
      handler: async (args: unknown) => {
        const validated = LinkRemoteFileSchema.parse(args);
        return client.post('/files/remote', validated);
      },
    },
  };
}
