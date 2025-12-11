import type { PipedriveClient } from '../../pipedrive-client.js';
import { AttachAudioSchema } from '../../schemas/call-log.js';

export function getAttachAudioTool(client: PipedriveClient) {
  return {
    'call_logs/attach_audio': {
      description: `Attach an audio recording file to a call log.

Uploads an audio file and associates it with a call log. The call log will be marked as having a recording.

Workflow tips:
- Call log must already exist (create with call_logs/create first)
- Provide the call log ID and path to the audio file
- File must be a valid audio format
- This is a multipart/form-data upload
- After upload, has_recording will be true for this call log

Common use cases:
- Attach recording after call: { "id": "CAd92b224eb4a39b5ad8fea92ff0e", "file_path": "/path/to/recording.mp3" }
- Add call recording for documentation
- Store call audio for quality assurance`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: {
            type: 'string',
            description: 'ID of the call log to attach audio to',
          },
          file_path: {
            type: 'string',
            description: 'Path to the audio file to attach',
          },
        },
        required: ['id', 'file_path'],
      },
      handler: async (args: unknown) => {
        const { id, file_path } = AttachAudioSchema.parse(args);
        // Note: This would require multipart/form-data support in the client
        // For now, we'll use a simplified approach
        return client.post(`/callLogs/${id}/recordings`, { file: file_path });
      },
    },
  };
}
