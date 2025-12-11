import { z } from 'zod';
import { BooleanLikeSchema, DateTimeStringSchema } from './common.js';

/**
 * Provider type enum for channels
 */
export const ProviderTypeSchema = z.enum(['other', 'facebook', 'instagram', 'whatsapp', 'telegram', 'line', 'viber'], {
  errorMap: () => ({ message: 'Provider type must be one of: other, facebook, instagram, whatsapp, telegram, line, viber' }),
}).describe('Provider type for the channel');

export type ProviderType = z.infer<typeof ProviderTypeSchema>;

/**
 * Schema for creating a new channel
 */
export const CreateChannelSchema = z.object({
  name: z.string()
    .min(1, 'Name is required and cannot be empty')
    .max(255, 'Name cannot exceed 255 characters')
    .describe('Name of the channel'),
  provider_channel_id: z.string()
    .min(1, 'Provider channel ID is required')
    .describe('ID of the channel in the provider system'),
  avatar_url: z.string()
    .url('Avatar URL must be a valid URL')
    .optional()
    .describe('Avatar URL for the channel'),
  template_support: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('Whether the channel supports message templates'),
  provider_type: ProviderTypeSchema
    .optional()
    .default('other')
    .describe('Type of the messaging provider'),
}).strict();

export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;

/**
 * Schema for deleting a channel
 */
export const DeleteChannelSchema = z.object({
  id: z.string()
    .min(1, 'Channel ID is required')
    .describe('ID of the channel to delete'),
}).strict();

export type DeleteChannelInput = z.infer<typeof DeleteChannelSchema>;

/**
 * Schema for message attachment
 */
export const MessageAttachmentSchema = z.object({
  id: z.string()
    .min(1, 'Attachment ID is required')
    .describe('ID of the attachment'),
  type: z.string()
    .min(1, 'Attachment type is required')
    .describe('MIME type of the attachment (e.g., image/png, application/pdf)'),
  url: z.string()
    .url('Attachment URL must be valid')
    .describe('URL where the attachment can be accessed'),
  name: z.string()
    .min(1, 'Attachment name is required')
    .describe('Name of the attachment file'),
  size: z.number()
    .nonnegative('Attachment size must be non-negative')
    .describe('Size of the attachment in bytes'),
  preview_url: z.string()
    .url('Preview URL must be valid')
    .optional()
    .describe('URL for a preview of the attachment'),
  link_expires: BooleanLikeSchema
    .optional()
    .default(false)
    .describe('Whether the attachment link expires'),
}).strict();

export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;

/**
 * Schema for receiving an incoming message
 */
export const ReceiveMessageSchema = z.object({
  id: z.string()
    .min(1, 'Message ID is required')
    .describe('ID of the message'),
  channel_id: z.string()
    .min(1, 'Channel ID is required')
    .describe('ID of the channel the message was sent to'),
  sender_id: z.string()
    .min(1, 'Sender ID is required')
    .describe('ID of the message sender'),
  conversation_id: z.string()
    .min(1, 'Conversation ID is required')
    .describe('ID of the conversation this message belongs to'),
  message: z.string()
    .min(1, 'Message content is required')
    .describe('Content of the message'),
  status: z.string()
    .min(1, 'Message status is required')
    .describe('Status of the message (e.g., sent, delivered, read)'),
  created_at: DateTimeStringSchema
    .describe('When the message was created'),
  reply_by: DateTimeStringSchema
    .optional()
    .describe('When a reply is expected by'),
  conversation_link: z.string()
    .url('Conversation link must be a valid URL')
    .optional()
    .describe('Link to the conversation in the provider system'),
  attachments: z.array(MessageAttachmentSchema)
    .optional()
    .default([])
    .describe('Array of message attachments'),
}).strict();

export type ReceiveMessageInput = z.infer<typeof ReceiveMessageSchema>;

/**
 * Schema for deleting a conversation
 */
export const DeleteConversationSchema = z.object({
  channel_id: z.string()
    .min(1, 'Channel ID is required')
    .describe('ID of the channel'),
  conversation_id: z.string()
    .min(1, 'Conversation ID is required')
    .describe('ID of the conversation to delete'),
}).strict();

export type DeleteConversationInput = z.infer<typeof DeleteConversationSchema>;
