import type { PipedriveClient } from '../../pipedrive-client.js';
import { DeletePersonPictureSchema } from '../../schemas/person.js';
import type { PipedriveResponse } from '../../types/common.js';

/**
 * Tool for deleting a person's picture
 */
export function getDeletePersonPictureTool(client: PipedriveClient) {
  return {
    name: 'persons/delete_picture',
    description: `Delete a person's profile picture.

Removes the profile picture from the person record. The person will revert to:
- Default avatar
- Or initials-based placeholder
- Depending on Pipedrive settings

This is useful for:
- Updating outdated photos
- Privacy compliance (GDPR, etc.)
- Data cleanup
- Resetting profile images

Note: This does not delete the image file from Pipedrive storage, it only removes
the association with the person.`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
      },
      required: ['id'],
    } as const,
    handler: async (params: unknown) => {
      const validated = DeletePersonPictureSchema.parse(params);

      const response = await client.delete<PipedriveResponse<{ success: boolean }>>(
        `/persons/${validated.id}/picture`
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}

/**
 * Tool for adding/updating a person's picture
 */
export function getAddPersonPictureTool(client: PipedriveClient) {
  return {
    name: 'persons/add_picture',
    description: `Add or update a person's profile picture.

Uploads an image file to set as the person's profile picture. The image will be:
- Displayed in person records
- Shown in lists and search results
- Visible to users with access to the person
- Used across the Pipedrive interface

Image requirements:
- Format: JPEG, PNG, GIF
- Recommended size: 512x512 pixels
- Maximum file size: Typically 5-10 MB (check Pipedrive limits)

Cropping parameters (optional):
- Use crop_x, crop_y to set the top-left corner of the crop area
- Use crop_width, crop_height to define the crop dimensions
- All crop values are in pixels
- If not provided, the full image is used

Workflow:
1. Read the image file as a Buffer
2. Provide the filename (with extension)
3. Optionally specify crop parameters
4. The tool uploads and sets the picture

Use cases:
- Adding profile photos for contacts
- Updating person images
- Visual identification in CRM
- Personalization and branding`,
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Person ID',
        },
        file: {
          type: 'string',
          description: 'Base64-encoded image file or file buffer',
        },
        filename: {
          type: 'string',
          description: 'Name of the image file (e.g., "photo.jpg")',
        },
        crop_x: {
          type: 'number',
          description: 'X coordinate for cropping (pixels)',
        },
        crop_y: {
          type: 'number',
          description: 'Y coordinate for cropping (pixels)',
        },
        crop_width: {
          type: 'number',
          description: 'Width of crop area (pixels)',
        },
        crop_height: {
          type: 'number',
          description: 'Height of crop area (pixels)',
        },
      },
      required: ['id', 'file', 'filename'],
    } as const,
    handler: async (params: unknown) => {
      // For picture upload, we need to handle the file parameter specially
      // In practice, the file would come as a Buffer or base64 string
      const { id, file, filename, crop_x, crop_y, crop_width, crop_height } = params as {
        id: number;
        file: Buffer | string;
        filename: string;
        crop_x?: number;
        crop_y?: number;
        crop_width?: number;
        crop_height?: number;
      };

      // Convert base64 to Buffer if needed
      let fileBuffer: Buffer;
      if (typeof file === 'string') {
        // Assume base64 encoded
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
        fileBuffer = Buffer.from(base64Data, 'base64');
      } else {
        fileBuffer = file;
      }

      // Validate with schema (excluding file since Buffer validation happens above)
      DeletePersonPictureSchema.parse({ id });

      // Build additional fields for cropping
      const additionalFields: Record<string, string | number> = {};
      if (crop_x !== undefined) additionalFields.crop_x = crop_x;
      if (crop_y !== undefined) additionalFields.crop_y = crop_y;
      if (crop_width !== undefined) additionalFields.crop_width = crop_width;
      if (crop_height !== undefined) additionalFields.crop_height = crop_height;

      const response = await client.uploadFile(
        `/persons/${id}/picture`,
        fileBuffer,
        filename,
        additionalFields
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    },
  };
}
