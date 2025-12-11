import { z } from 'zod';
import { IdSchema, OptionalIdSchema } from './common.js';

/**
 * Valid event actions for webhooks
 */
export const EventActionSchema = z.enum(
  [
    'added',
    'updated',
    'deleted',
    'merged',
    '*', // All actions
  ],
  {
    errorMap: () => ({
      message: 'Event action must be one of: added, updated, deleted, merged, or * (all)',
    }),
  }
);

export type EventAction = z.infer<typeof EventActionSchema>;

/**
 * Valid event objects for webhooks
 */
export const EventObjectSchema = z.enum(
  [
    'activity',
    'activityType',
    'deal',
    'note',
    'organization',
    'person',
    'pipeline',
    'product',
    'stage',
    'user',
    '*', // All objects
  ],
  {
    errorMap: () => ({
      message:
        'Event object must be one of: activity, activityType, deal, note, organization, person, pipeline, product, stage, user, or * (all)',
    }),
  }
);

export type EventObject = z.infer<typeof EventObjectSchema>;

/**
 * Schema for creating a new webhook
 */
export const CreateWebhookSchema = z
  .object({
    subscription_url: z
      .string()
      .url('Subscription URL must be a valid URL')
      .min(1, 'Subscription URL is required')
      .describe('The HTTP endpoint URL where webhook notifications will be sent'),
    event_action: EventActionSchema.describe(
      'The type of action that triggers the webhook (added, updated, deleted, merged, or *)'
    ),
    event_object: EventObjectSchema.describe(
      'The type of object that triggers the webhook (activity, deal, person, organization, etc., or *)'
    ),
    user_id: OptionalIdSchema.describe('The ID of the user this webhook will be associated with'),
    http_auth_user: z
      .string()
      .optional()
      .describe('HTTP basic auth username for the webhook endpoint (optional)'),
    http_auth_password: z
      .string()
      .optional()
      .describe('HTTP basic auth password for the webhook endpoint (optional)'),
    version: z
      .enum(['1.0', '2.0'])
      .optional()
      .default('2.0')
      .describe('Webhook version (default: 2.0)'),
    name: z
      .string()
      .max(255, 'Name cannot exceed 255 characters')
      .optional()
      .describe('Optional name for the webhook'),
  })
  .strict()
  .refine(
    (data) => {
      // Both auth fields should be provided together or not at all
      const hasUser = !!data.http_auth_user;
      const hasPassword = !!data.http_auth_password;
      return hasUser === hasPassword;
    },
    {
      message: 'Both http_auth_user and http_auth_password must be provided together',
      path: ['http_auth_user'],
    }
  );

export type CreateWebhookInput = z.infer<typeof CreateWebhookSchema>;

/**
 * Schema for deleting a webhook
 */
export const DeleteWebhookSchema = z
  .object({
    id: IdSchema.describe('ID of the webhook to delete'),
  })
  .strict();

export type DeleteWebhookInput = z.infer<typeof DeleteWebhookSchema>;

/**
 * Schema for getting a specific webhook (not used in initial implementation)
 */
export const GetWebhookSchema = z
  .object({
    id: IdSchema.describe('ID of the webhook to retrieve'),
  })
  .strict();

export type GetWebhookInput = z.infer<typeof GetWebhookSchema>;
