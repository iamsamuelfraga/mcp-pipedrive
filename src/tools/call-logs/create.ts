import type { PipedriveClient } from '../../pipedrive-client.js';
import { CreateCallLogSchema } from '../../schemas/call-log.js';

export function getCreateCallLogTool(client: PipedriveClient) {
  return {
    'call_logs/create': {
      description: `Add a new call log to track phone call activity.

Creates a call log with phone numbers, outcome, duration, and timestamps. Can be linked to persons, organizations, deals, leads, and activities.

Workflow tips:
- to_phone_number, outcome, start_time, and end_time are required
- Outcome describes call result (e.g., connected, no_answer, busy, voicemail)
- Use ISO 8601 format for timestamps
- Link to records using person_id, org_id, deal_id, or lead_id
- Associate with an activity using activity_id
- Add notes for call details

Common use cases:
- Log successful call: { "to_phone_number": "+1234567890", "outcome": "connected", "start_time": "2024-12-10T10:00:00Z", "end_time": "2024-12-10T10:15:00Z" }
- Log missed call: { "to_phone_number": "+1234567890", "outcome": "no_answer", "start_time": "2024-12-10T10:00:00Z", "end_time": "2024-12-10T10:00:30Z" }
- Link to person: Include "person_id": 123`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          to_phone_number: {
            type: 'string',
            description: 'Phone number called',
          },
          outcome: {
            type: 'string',
            description: 'Call outcome (e.g., connected, no_answer, busy, voicemail)',
          },
          start_time: {
            type: 'string',
            description: 'Call start time in ISO 8601 format',
          },
          end_time: {
            type: 'string',
            description: 'Call end time in ISO 8601 format',
          },
          user_id: {
            type: 'number',
            description: 'ID of the user who made the call',
          },
          activity_id: {
            type: 'number',
            description: 'ID of the associated activity',
          },
          subject: {
            type: 'string',
            description: 'Call subject/title',
          },
          duration: {
            type: 'string',
            description: 'Call duration in seconds (e.g., "120")',
          },
          from_phone_number: {
            type: 'string',
            description: 'Phone number that made the call',
          },
          person_id: {
            type: 'number',
            description: 'ID of the person associated with the call',
          },
          org_id: {
            type: 'number',
            description: 'ID of the organization associated with the call',
          },
          deal_id: {
            type: 'number',
            description: 'ID of the deal associated with the call',
          },
          lead_id: {
            type: 'string',
            description: 'UUID of the lead associated with the call',
          },
          note: {
            type: 'string',
            description: 'Additional notes about the call',
          },
        },
        required: ['to_phone_number', 'outcome', 'start_time', 'end_time'],
      },
      handler: async (args: unknown) => {
        const data = CreateCallLogSchema.parse(args);
        return client.post('/callLogs', data);
      },
    },
  };
}
