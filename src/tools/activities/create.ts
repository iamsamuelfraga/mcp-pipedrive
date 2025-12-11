import { z } from 'zod';
import type { PipedriveClient } from '../../pipedrive-client.js';
import type { Activity } from '../../types/pipedrive-api.js';
import type { PipedriveResponse } from '../../types/common.js';

const ActivityParticipantSchema = z.object({
  person_id: z.number().describe('Person ID'),
  primary_flag: z.boolean().optional().describe('Is this the primary participant?'),
});

const ActivityAttendeeSchema = z.object({
  email_address: z.string().describe('Email address of attendee'),
  name: z.string().optional().describe('Name of attendee'),
  user_id: z.number().optional().describe('User ID if attendee is a Pipedrive user'),
  person_id: z.number().optional().describe('Person ID if attendee is a Pipedrive person'),
});

const CreateActivityArgsSchema = z.object({
  subject: z.string().describe('Activity subject (required)'),
  type: z.enum(['call', 'meeting', 'task', 'deadline', 'email', 'lunch']).describe('Activity type (required)'),
  due_date: z.string().describe('Due date in YYYY-MM-DD format (required)'),
  due_time: z.string().optional().describe('Due time in HH:MM format (optional)'),
  duration: z.string().optional().describe('Duration in HH:MM format (optional)'),
  user_id: z.number().optional().describe('User ID to assign the activity to'),
  deal_id: z.number().optional().describe('Deal ID to link the activity to'),
  person_id: z.number().optional().describe('Person ID to link the activity to'),
  org_id: z.number().optional().describe('Organization ID to link the activity to'),
  project_id: z.number().optional().describe('Project ID to link the activity to'),
  lead_id: z.string().optional().describe('Lead ID to link the activity to'),
  note: z.string().optional().describe('Activity note'),
  location: z.string().optional().describe('Activity location'),
  public_description: z.string().optional().describe('Public description'),
  busy_flag: z.boolean().optional().describe('Mark as busy in calendar'),
  participants: z.array(ActivityParticipantSchema).optional().describe('Array of participants'),
  attendees: z.array(ActivityAttendeeSchema).optional().describe('Array of attendees'),
  done: z.boolean().optional().describe('Mark as done'),
  custom_fields: z.record(z.any()).optional().describe('Custom fields as key-value pairs'),
});

export function createCreateActivityTool(client: PipedriveClient) {
  return {
    name: 'activities/create',
    description: 'Create a new activity. Subject, type, and due_date are required. Can link to deals, persons, organizations, projects, or leads.',
    inputSchema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Activity subject (required)' },
        type: {
          type: 'string',
          enum: ['call', 'meeting', 'task', 'deadline', 'email', 'lunch'],
          description: 'Activity type (required)'
        },
        due_date: { type: 'string', description: 'Due date in YYYY-MM-DD format (required)' },
        due_time: { type: 'string', description: 'Due time in HH:MM format (optional)' },
        duration: { type: 'string', description: 'Duration in HH:MM format (optional)' },
        user_id: { type: 'number', description: 'User ID to assign the activity to' },
        deal_id: { type: 'number', description: 'Deal ID to link the activity to' },
        person_id: { type: 'number', description: 'Person ID to link the activity to' },
        org_id: { type: 'number', description: 'Organization ID to link the activity to' },
        project_id: { type: 'number', description: 'Project ID to link the activity to' },
        lead_id: { type: 'string', description: 'Lead ID to link the activity to' },
        note: { type: 'string', description: 'Activity note' },
        location: { type: 'string', description: 'Activity location' },
        public_description: { type: 'string', description: 'Public description' },
        busy_flag: { type: 'boolean', description: 'Mark as busy in calendar' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              person_id: { type: 'number', description: 'Person ID' },
              primary_flag: { type: 'boolean', description: 'Is this the primary participant?' },
            },
            required: ['person_id'],
          },
          description: 'Array of participants'
        },
        attendees: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              email_address: { type: 'string', description: 'Email address of attendee' },
              name: { type: 'string', description: 'Name of attendee' },
              user_id: { type: 'number', description: 'User ID if attendee is a Pipedrive user' },
              person_id: { type: 'number', description: 'Person ID if attendee is a Pipedrive person' },
            },
            required: ['email_address'],
          },
          description: 'Array of attendees'
        },
        done: { type: 'boolean', description: 'Mark as done' },
        custom_fields: { type: 'object', description: 'Custom fields as key-value pairs' },
      },
      required: ['subject', 'type', 'due_date'],
    },
    handler: async (args: unknown) => {
      const parsed = CreateActivityArgsSchema.parse(args);

      const body: Record<string, any> = {
        subject: parsed.subject,
        type: parsed.type,
        due_date: parsed.due_date,
      };

      if (parsed.due_time !== undefined) body.due_time = parsed.due_time;
      if (parsed.duration !== undefined) body.duration = parsed.duration;
      if (parsed.user_id !== undefined) body.user_id = parsed.user_id;
      if (parsed.deal_id !== undefined) body.deal_id = parsed.deal_id;
      if (parsed.person_id !== undefined) body.person_id = parsed.person_id;
      if (parsed.org_id !== undefined) body.org_id = parsed.org_id;
      if (parsed.project_id !== undefined) body.project_id = parsed.project_id;
      if (parsed.lead_id !== undefined) body.lead_id = parsed.lead_id;
      if (parsed.note !== undefined) body.note = parsed.note;
      if (parsed.location !== undefined) body.location = parsed.location;
      if (parsed.public_description !== undefined) body.public_description = parsed.public_description;
      if (parsed.busy_flag !== undefined) body.busy_flag = parsed.busy_flag;
      if (parsed.participants !== undefined) body.participants = parsed.participants;
      if (parsed.attendees !== undefined) body.attendees = parsed.attendees;
      if (parsed.done !== undefined) body.done = parsed.done;

      // Merge custom fields
      if (parsed.custom_fields) {
        Object.assign(body, parsed.custom_fields);
      }

      const response = await client.post<PipedriveResponse<Activity>>(
        '/activities',
        body
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
