import { z } from 'zod';

/**
 * Schema for linking a user with video call integration
 */
export const LinkUserProviderSchema = z
  .object({
    user_provider_id: z
      .string()
      .uuid('User provider ID must be a valid UUID')
      .describe('Unique identifier linking a user to the installed integration'),
    user_id: z
      .number()
      .int('User ID must be an integer')
      .positive('User ID must be positive')
      .describe('ID of the user to link'),
    company_id: z
      .number()
      .int('Company ID must be an integer')
      .positive('Company ID must be positive')
      .describe('ID of the company'),
    marketplace_client_id: z
      .string()
      .min(1, 'Marketplace client ID is required')
      .describe('Marketplace client identifier for the integration'),
  })
  .strict();

export type LinkUserProviderInput = z.infer<typeof LinkUserProviderSchema>;

/**
 * Schema for deleting user video call link
 */
export const DeleteUserProviderLinkSchema = z.object({
  id: z
    .string()
    .uuid('Link ID must be a valid UUID')
    .describe('Unique identifier linking a user to the installed integration'),
});

export type DeleteUserProviderLinkInput = z.infer<typeof DeleteUserProviderLinkSchema>;
