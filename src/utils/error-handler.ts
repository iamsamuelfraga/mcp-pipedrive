export class PipedriveError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PipedriveError';
    Error.captureStackTrace(this, this.constructor);
  }

  toUserFriendlyMessage(): string {
    const parts = [`Error: ${this.message}`];

    if (this.statusCode === 401) {
      parts.push(
        '\nAuthentication failed. Please check your PIPEDRIVE_API_TOKEN environment variable.'
      );
    } else if (this.statusCode === 403) {
      parts.push(
        '\nAccess denied. Your API token may not have permission for this operation.'
      );
    } else if (this.statusCode === 404) {
      parts.push('\nResource not found. The requested item may have been deleted.');
    } else if (this.statusCode === 429) {
      parts.push('\nRate limit exceeded. Please try again in a few moments.');
    } else if (this.statusCode && this.statusCode >= 500) {
      parts.push('\nPipedrive server error. Please try again later.');
    }

    if (this.endpoint) {
      parts.push(`\nEndpoint: ${this.endpoint}`);
    }

    if (this.details) {
      parts.push(`\nDetails: ${JSON.stringify(this.details, null, 2)}`);
    }

    return parts.join('');
  }
}

export function handleToolError(error: unknown): { content: Array<{ type: string; text: string }>; isError: true } {
  if (error instanceof PipedriveError) {
    return {
      content: [{ type: 'text', text: error.toUserFriendlyMessage() }],
      isError: true,
    };
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  return {
    content: [
      {
        type: 'text',
        text: `Unexpected error: ${errorMessage}\n\nPlease report this issue if it persists.`,
      },
    ],
    isError: true,
  };
}
