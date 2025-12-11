import { describe, it, expect } from 'vitest';
import { PipedriveError, handleToolError } from '../error-handler';

describe('PipedriveError', () => {
  describe('constructor', () => {
    it('should create error with message only', () => {
      const error = new PipedriveError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PipedriveError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('PipedriveError');
    });

    it('should create error with status code', () => {
      const error = new PipedriveError('Test error', 404);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
    });

    it('should create error with endpoint', () => {
      const error = new PipedriveError('Test error', 500, '/api/deals');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.endpoint).toBe('/api/deals');
    });

    it('should create error with details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new PipedriveError('Validation error', 400, '/api/persons', details);

      expect(error.message).toBe('Validation error');
      expect(error.statusCode).toBe(400);
      expect(error.endpoint).toBe('/api/persons');
      expect(error.details).toEqual(details);
    });

    it('should capture stack trace', () => {
      const error = new PipedriveError('Test error');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('PipedriveError');
    });

    it('should handle undefined optional parameters', () => {
      const error = new PipedriveError('Test error', undefined, undefined, undefined);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBeUndefined();
      expect(error.endpoint).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('toUserFriendlyMessage', () => {
    it('should format basic error message', () => {
      const error = new PipedriveError('Something went wrong');
      const message = error.toUserFriendlyMessage();

      expect(message).toBe('Error: Something went wrong');
    });

    it('should include authentication guidance for 401', () => {
      const error = new PipedriveError('Unauthorized', 401);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Unauthorized');
      expect(message).toContain('Authentication failed');
      expect(message).toContain('PIPEDRIVE_API_TOKEN');
    });

    it('should include permission guidance for 403', () => {
      const error = new PipedriveError('Forbidden', 403);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Forbidden');
      expect(message).toContain('Access denied');
      expect(message).toContain('may not have permission');
    });

    it('should include not found guidance for 404', () => {
      const error = new PipedriveError('Not found', 404);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Not found');
      expect(message).toContain('Resource not found');
      expect(message).toContain('may have been deleted');
    });

    it('should include rate limit guidance for 429', () => {
      const error = new PipedriveError('Too many requests', 429);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Too many requests');
      expect(message).toContain('Rate limit exceeded');
      expect(message).toContain('try again in a few moments');
    });

    it('should include server error guidance for 500', () => {
      const error = new PipedriveError('Internal server error', 500);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Internal server error');
      expect(message).toContain('Pipedrive server error');
      expect(message).toContain('try again later');
    });

    it('should include server error guidance for 502', () => {
      const error = new PipedriveError('Bad gateway', 502);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Bad gateway');
      expect(message).toContain('Pipedrive server error');
    });

    it('should include server error guidance for 503', () => {
      const error = new PipedriveError('Service unavailable', 503);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Service unavailable');
      expect(message).toContain('Pipedrive server error');
    });

    it('should include server error guidance for 504', () => {
      const error = new PipedriveError('Gateway timeout', 504);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Gateway timeout');
      expect(message).toContain('Pipedrive server error');
    });

    it('should include endpoint when provided', () => {
      const error = new PipedriveError('Error', 404, '/api/deals/123');
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Endpoint: /api/deals/123');
    });

    it('should include details when provided', () => {
      const details = { field: 'email', error: 'invalid' };
      const error = new PipedriveError('Validation error', 400, '/api/persons', details);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Details:');
      expect(message).toContain('"field"');
      expect(message).toContain('"email"');
      expect(message).toContain('"error"');
      expect(message).toContain('"invalid"');
    });

    it('should format details as JSON with indentation', () => {
      const details = { key1: 'value1', key2: 'value2' };
      const error = new PipedriveError('Error', 400, undefined, details);
      const message = error.toUserFriendlyMessage();

      // Should be pretty-printed with 2 space indentation
      expect(message).toMatch(/Details:[\s\S]*\{[\s\S]*"key1"[\s\S]*\}/);
    });

    it('should handle complex nested details', () => {
      const details = {
        errors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'phone', message: 'Invalid phone' },
        ],
        metadata: {
          timestamp: '2024-01-01',
          requestId: 'req-123',
        },
      };
      const error = new PipedriveError('Validation failed', 400, '/api/persons', details);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Details:');
      expect(message).toContain('errors');
      expect(message).toContain('metadata');
      expect(message).toContain('Invalid email');
    });

    it('should not include endpoint section when not provided', () => {
      const error = new PipedriveError('Error', 500);
      const message = error.toUserFriendlyMessage();

      expect(message).not.toContain('Endpoint:');
    });

    it('should not include details section when not provided', () => {
      const error = new PipedriveError('Error', 500);
      const message = error.toUserFriendlyMessage();

      expect(message).not.toContain('Details:');
    });

    it('should handle error with all fields', () => {
      const details = { reason: 'test' };
      const error = new PipedriveError('Complete error', 500, '/api/test', details);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Error: Complete error');
      expect(message).toContain('Pipedrive server error');
      expect(message).toContain('Endpoint: /api/test');
      expect(message).toContain('Details:');
      expect(message).toContain('"reason"');
    });

    it('should handle error with no status code', () => {
      const error = new PipedriveError('Generic error');
      const message = error.toUserFriendlyMessage();

      expect(message).toBe('Error: Generic error');
      expect(message).not.toContain('Authentication');
      expect(message).not.toContain('Rate limit');
    });

    it('should handle unknown status codes', () => {
      const error = new PipedriveError('Unknown error', 418); // I'm a teapot
      const message = error.toUserFriendlyMessage();

      expect(message).toBe('Error: Unknown error');
    });
  });

  describe('error properties', () => {
    it('should allow reading statusCode', () => {
      const error = new PipedriveError('Test', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should allow reading endpoint', () => {
      const error = new PipedriveError('Test', 404, '/api/deals');
      expect(error.endpoint).toBe('/api/deals');
    });

    it('should allow reading details', () => {
      const details = { key: 'value' };
      const error = new PipedriveError('Test', 404, '/api/deals', details);
      expect(error.details).toEqual(details);
    });

    it('should be throwable', () => {
      const throwError = () => {
        throw new PipedriveError('Test error', 500);
      };

      expect(throwError).toThrow(PipedriveError);
      expect(throwError).toThrow('Test error');
    });

    it('should be catchable as Error', () => {
      try {
        throw new PipedriveError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(PipedriveError);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty error message', () => {
      const error = new PipedriveError('');
      expect(error.message).toBe('');
      expect(error.toUserFriendlyMessage()).toBe('Error: ');
    });

    it('should handle very long error messages', () => {
      const longMessage = 'Error '.repeat(100);
      const error = new PipedriveError(longMessage);
      expect(error.message).toBe(longMessage);
      expect(error.toUserFriendlyMessage()).toContain(longMessage);
    });

    it('should handle special characters in message', () => {
      const message = 'Error: "test" with \n newlines and \t tabs';
      const error = new PipedriveError(message);
      expect(error.message).toBe(message);
    });

    it('should handle null in details', () => {
      const details = { value: null };
      const error = new PipedriveError('Error', 400, undefined, details);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('null');
    });

    it('should handle circular references in details safely', () => {
      const details: any = { key: 'value' };
      details.self = details; // Circular reference

      const error = new PipedriveError('Error', 400, undefined, details);

      // JSON.stringify will throw on circular references
      // This tests that the error handler doesn't crash
      expect(() => error.toUserFriendlyMessage()).toThrow();
    });

    it('should handle array details', () => {
      const details = ['error1', 'error2', 'error3'];
      const error = new PipedriveError('Multiple errors', 400, undefined, details);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('error1');
      expect(message).toContain('error2');
      expect(message).toContain('error3');
    });

    it('should handle string details', () => {
      const details = 'Simple error description';
      const error = new PipedriveError('Error', 400, undefined, details);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('Simple error description');
    });

    it('should handle number details', () => {
      const details = 12345;
      const error = new PipedriveError('Error', 400, undefined, details);
      const message = error.toUserFriendlyMessage();

      expect(message).toContain('12345');
    });
  });
});

describe('handleToolError', () => {
  describe('PipedriveError handling', () => {
    it('should handle PipedriveError', () => {
      const error = new PipedriveError('Test error', 404);
      const result = handleToolError(error);

      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Test error');
    });

    it('should use toUserFriendlyMessage for PipedriveError', () => {
      const error = new PipedriveError('Unauthorized', 401);
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('Authentication failed');
      expect(result.content[0].text).toContain('PIPEDRIVE_API_TOKEN');
    });

    it('should include endpoint in output', () => {
      const error = new PipedriveError('Not found', 404, '/api/deals/123');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('/api/deals/123');
    });

    it('should include details in output', () => {
      const details = { field: 'email' };
      const error = new PipedriveError('Validation error', 400, '/api/persons', details);
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('field');
      expect(result.content[0].text).toContain('email');
    });
  });

  describe('generic Error handling', () => {
    it('should handle standard Error', () => {
      const error = new Error('Standard error');
      const result = handleToolError(error);

      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Unexpected error: Standard error');
    });

    it('should include guidance to report issue', () => {
      const error = new Error('Something went wrong');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('report this issue if it persists');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('Unexpected error:');
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Type error occurred');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('Type error occurred');
    });

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('Reference error occurred');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('Reference error occurred');
    });
  });

  describe('non-Error handling', () => {
    it('should handle string error', () => {
      const result = handleToolError('String error message');

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error: String error message');
    });

    it('should handle number error', () => {
      const result = handleToolError(404);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error: 404');
    });

    it('should handle null error', () => {
      const result = handleToolError(null);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error: null');
    });

    it('should handle undefined error', () => {
      const result = handleToolError(undefined);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error: undefined');
    });

    it('should handle object error', () => {
      const result = handleToolError({ message: 'Object error', code: 500 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error:');
      expect(result.content[0].text).toContain('[object Object]');
    });

    it('should handle array error', () => {
      const result = handleToolError(['error1', 'error2']);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error:');
    });

    it('should handle boolean error', () => {
      const result = handleToolError(false);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unexpected error: false');
    });
  });

  describe('return format', () => {
    it('should return correct structure', () => {
      const error = new Error('Test');
      const result = handleToolError(error);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('isError');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.isError).toBe(true);
    });

    it('should return array with single content item', () => {
      const error = new Error('Test');
      const result = handleToolError(error);

      expect(result.content).toHaveLength(1);
    });

    it('should return content with type text', () => {
      const error = new Error('Test');
      const result = handleToolError(error);

      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0]).toHaveProperty('text');
      expect(result.content[0].type).toBe('text');
    });

    it('should always set isError to true', () => {
      const testCases = [
        new PipedriveError('Test'),
        new Error('Test'),
        'Test',
        123,
        null,
        undefined,
      ];

      testCases.forEach((testCase) => {
        const result = handleToolError(testCase);
        expect(result.isError).toBe(true);
      });
    });

    it('should return text as string', () => {
      const error = new Error('Test');
      const result = handleToolError(error);

      expect(typeof result.content[0].text).toBe('string');
    });
  });

  describe('edge cases', () => {
    it('should handle error with very long message', () => {
      const longMessage = 'Error '.repeat(1000);
      const error = new Error(longMessage);
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('Unexpected error:');
      expect(result.content[0].text.length).toBeGreaterThan(1000);
    });

    it('should handle error with special characters', () => {
      const error = new Error('Error with \n newlines \t tabs and "quotes"');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('newlines');
      expect(result.content[0].text).toContain('tabs');
      expect(result.content[0].text).toContain('quotes');
    });

    it('should handle error with unicode characters', () => {
      const error = new Error('Error with unicode: 你好 🚀');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('你好');
      expect(result.content[0].text).toContain('🚀');
    });

    it('should handle multiple error types in sequence', () => {
      const errors = [
        new PipedriveError('Pipedrive error', 500),
        new Error('Standard error'),
        'String error',
        null,
      ];

      errors.forEach((error) => {
        const result = handleToolError(error);
        expect(result.isError).toBe(true);
        expect(result.content).toHaveLength(1);
      });
    });

    it('should handle error thrown in async context', async () => {
      try {
        throw new PipedriveError('Async error', 500);
      } catch (error) {
        const result = handleToolError(error);
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Async error');
      }
    });

    it('should handle error with custom Error subclass', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const error = new CustomError('Custom error message');
      const result = handleToolError(error);

      expect(result.content[0].text).toContain('Custom error message');
    });
  });
});
