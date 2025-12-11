import { describe, it, expect } from 'vitest';
import {
  CreateWebhookSchema,
  DeleteWebhookSchema,
  EventActionSchema,
  EventObjectSchema,
} from '../webhook.js';

describe('EventActionSchema', () => {
  it('should accept valid event actions', () => {
    const validActions = ['added', 'updated', 'deleted', 'merged', '*'];
    validActions.forEach(action => {
      expect(() => EventActionSchema.parse(action)).not.toThrow();
    });
  });

  it('should reject invalid event action', () => {
    expect(() => EventActionSchema.parse('modified')).toThrow('Event action must be one of: added, updated, deleted, merged, or * (all)');
  });

  it('should reject empty string', () => {
    expect(() => EventActionSchema.parse('')).toThrow();
  });
});

describe('EventObjectSchema', () => {
  it('should accept valid event objects', () => {
    const validObjects = [
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
      '*',
    ];
    validObjects.forEach(obj => {
      expect(() => EventObjectSchema.parse(obj)).not.toThrow();
    });
  });

  it('should reject invalid event object', () => {
    expect(() => EventObjectSchema.parse('lead')).toThrow('Event object must be one of: activity, activityType, deal, note, organization, person, pipeline, product, stage, user, or * (all)');
  });

  it('should be case-sensitive', () => {
    expect(() => EventObjectSchema.parse('Activity')).toThrow();
    expect(() => EventObjectSchema.parse('DEAL')).toThrow();
  });
});

describe('CreateWebhookSchema', () => {
  it('should accept valid webhook with required fields', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
    };
    const result = CreateWebhookSchema.parse(valid);
    expect(result.version).toBe('2.0');
  });

  it('should accept webhook with all fields', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'updated',
      event_object: 'person',
      user_id: 1,
      http_auth_user: 'admin',
      http_auth_password: 'secret123',
      version: '2.0',
      name: 'My Webhook',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept webhook with wildcard event_action', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: '*',
      event_object: 'deal',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept webhook with wildcard event_object', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: '*',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept webhook with both wildcards', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: '*',
      event_object: '*',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept version 1.0', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      version: '1.0',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid subscription_url', () => {
    const invalid = {
      subscription_url: 'not-a-url',
      event_action: 'added',
      event_object: 'deal',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow('Subscription URL must be a valid URL');
  });

  it('should reject empty subscription_url', () => {
    const invalid = {
      subscription_url: '',
      event_action: 'added',
      event_object: 'deal',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid event_action', () => {
    const invalid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'created',
      event_object: 'deal',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid event_object', () => {
    const invalid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'lead',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow();
  });

  it('should reject http_auth_user without http_auth_password', () => {
    const invalid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      http_auth_user: 'admin',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow('Both http_auth_user and http_auth_password must be provided together');
  });

  it('should reject http_auth_password without http_auth_user', () => {
    const invalid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      http_auth_password: 'secret123',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow('Both http_auth_user and http_auth_password must be provided together');
  });

  it('should accept both http_auth fields together', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      http_auth_user: 'admin',
      http_auth_password: 'secret123',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept neither http_auth field', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid version', () => {
    const invalid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      version: '3.0',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow();
  });

  it('should reject name exceeding 255 characters', () => {
    const invalid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      name: 'a'.repeat(256),
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow('Name cannot exceed 255 characters');
  });

  it('should accept name at 255 characters', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      name: 'a'.repeat(255),
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should reject extra fields in strict mode', () => {
    const invalid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      extra_field: 'not allowed',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow();
  });
});

describe('DeleteWebhookSchema', () => {
  it('should accept valid delete request', () => {
    const valid = { id: 1 };
    expect(() => DeleteWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = {};
    expect(() => DeleteWebhookSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid1 = { id: 0 };
    const invalid2 = { id: -1 };
    const invalid3 = { id: 1.5 };
    expect(() => DeleteWebhookSchema.parse(invalid1)).toThrow();
    expect(() => DeleteWebhookSchema.parse(invalid2)).toThrow();
    expect(() => DeleteWebhookSchema.parse(invalid3)).toThrow();
  });

  it('should reject string ID', () => {
    const invalid = { id: '1' };
    expect(() => DeleteWebhookSchema.parse(invalid)).toThrow();
  });
});

describe('CreateWebhookSchema - URL Formats', () => {
  it('should accept various valid URL formats', () => {
    const validUrls = [
      'https://example.com/webhook',
      'https://example.com:8080/webhook',
      'https://subdomain.example.com/webhook',
      'https://example.com/webhook?param=value',
      'https://example.com/webhook#fragment',
      'http://localhost:3000/webhook',
    ];
    validUrls.forEach(url => {
      const valid = {
        subscription_url: url,
        event_action: 'added',
        event_object: 'deal',
      };
      expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
    });
  });

  it('should reject URLs without protocol', () => {
    const invalid = {
      subscription_url: 'example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
    };
    expect(() => CreateWebhookSchema.parse(invalid)).toThrow();
  });
});

describe('CreateWebhookSchema - Event Combinations', () => {
  it('should accept all action types with deal object', () => {
    const actions = ['added', 'updated', 'deleted', 'merged', '*'];
    actions.forEach(action => {
      const valid = {
        subscription_url: 'https://example.com/webhook',
        event_action: action as any,
        event_object: 'deal',
      };
      expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
    });
  });

  it('should accept all object types with added action', () => {
    const objects = [
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
      '*',
    ];
    objects.forEach(obj => {
      const valid = {
        subscription_url: 'https://example.com/webhook',
        event_action: 'added',
        event_object: obj as any,
      };
      expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
    });
  });

  it('should accept merged action with person object', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'merged',
      event_object: 'person',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept merged action with organization object', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'merged',
      event_object: 'organization',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });
});

describe('CreateWebhookSchema - Authentication Edge Cases', () => {
  it('should accept empty string for http_auth_user and http_auth_password together', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      http_auth_user: '',
      http_auth_password: '',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept complex passwords', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      http_auth_user: 'admin',
      http_auth_password: 'C0mpl3x!P@ssw0rd#2024',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });

  it('should accept special characters in username', () => {
    const valid = {
      subscription_url: 'https://example.com/webhook',
      event_action: 'added',
      event_object: 'deal',
      http_auth_user: 'user@example.com',
      http_auth_password: 'password',
    };
    expect(() => CreateWebhookSchema.parse(valid)).not.toThrow();
  });
});
