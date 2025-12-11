import { z } from 'zod';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

/**
 * Validates data against a Zod schema and returns a type-safe result
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns A validation result object
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Validates data and throws an error if validation fails
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated data
 * @throws ZodError if validation fails
 */
export function validateStrict<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Formats a Zod error into a human-readable error message
 * @param error - The ZodError to format
 * @returns A formatted error message string
 */
export function formatZodError(error: z.ZodError): string {
  const issues = error.errors.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });

  return issues.join('; ');
}

/**
 * Validates data and returns a formatted error message if validation fails
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns null if valid, error message string if invalid
 */
export function validateWithMessage<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): string | null {
  const result = validate(schema, data);

  if (!result.success) {
    return formatZodError(result.error);
  }

  return null;
}

/**
 * Creates a validation middleware function for API routes
 * @param schema - The Zod schema to validate against
 * @returns A validation function that can be used in middleware
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return validateStrict(schema, data);
  };
}
