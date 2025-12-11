import { describe, it, expect } from 'vitest';
import {
  CreateActivitySchema,
  UpdateActivitySchema,
  ListActivitiesSchema,
  BulkDeleteActivitiesSchema,
  BulkUpdateActivitiesSchema,
  ActivityTypeSchema,
} from '../activity.js';

describe('ActivityTypeSchema', () => {
  it('should accept valid activity types', () => {
    const validTypes = ['call', 'meeting', 'task', 'deadline', 'email', 'lunch'];
    validTypes.forEach(type => {
      expect(() => ActivityTypeSchema.parse(type)).not.toThrow();
    });
  });

  it('should reject invalid activity type', () => {
    expect(() => ActivityTypeSchema.parse('conference')).toThrow('Activity type must be one of: call, meeting, task, deadline, email, lunch');
  });
});

describe('CreateActivitySchema', () => {
  it('should accept valid activity with required fields', () => {
    const valid = {
      subject: 'Follow-up call',
      type: 'call',
      due_date: '2024-12-15',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should accept activity with person_id association', () => {
    const valid = {
      subject: 'Meeting',
      type: 'meeting',
      due_date: '2024-12-15',
      person_id: 10,
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should accept activity with org_id association', () => {
    const valid = {
      subject: 'Task',
      type: 'task',
      due_date: '2024-12-15',
      org_id: 20,
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should accept activity with all fields', () => {
    const valid = {
      subject: 'Comprehensive meeting',
      type: 'meeting',
      due_date: '2024-12-15',
      due_time: '14:30',
      duration: '01:30',
      user_id: 1,
      deal_id: 5,
      person_id: 10,
      org_id: 20,
      location: 'Conference Room A',
      note: 'Discuss Q4 plans',
      public_description: 'Quarterly planning session',
      done: false,
      participants: [
        { person_id: 10, primary_flag: true },
        { person_id: 11, primary_flag: false },
      ],
      busy_flag: true,
      attendees: [
        { email_address: 'john@example.com', name: 'John Doe' },
        { email_address: 'jane@example.com', name: 'Jane Smith' },
      ],
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should use default done value', () => {
    const activity = {
      subject: 'Task',
      type: 'task',
      due_date: '2024-12-15',
      deal_id: 1,
    };
    const result = CreateActivitySchema.parse(activity);
    expect(result.done).toBe(false);
  });

  it('should reject empty subject', () => {
    const invalid = {
      subject: '',
      type: 'call',
      due_date: '2024-12-15',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Subject is required and cannot be empty');
  });

  it('should reject subject exceeding 255 characters', () => {
    const invalid = {
      subject: 'a'.repeat(256),
      type: 'call',
      due_date: '2024-12-15',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Subject cannot exceed 255 characters');
  });

  it('should reject invalid due_date format', () => {
    const invalid = {
      subject: 'Call',
      type: 'call',
      due_date: '12/15/2024',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Date must be in YYYY-MM-DD format');
  });

  it('should reject invalid due_time format', () => {
    const invalid = {
      subject: 'Call',
      type: 'call',
      due_date: '2024-12-15',
      due_time: '2:30 PM',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Due time must be in HH:MM format (24-hour)');
  });

  it('should accept valid due_time format', () => {
    const valid = {
      subject: 'Call',
      type: 'call',
      due_date: '2024-12-15',
      due_time: '14:30',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should reject due_time exceeding 23:59', () => {
    const invalid = {
      subject: 'Call',
      type: 'call',
      due_date: '2024-12-15',
      due_time: '25:00',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Due time must be in HH:MM format (24-hour)');
  });

  it('should reject invalid duration format', () => {
    const invalid = {
      subject: 'Meeting',
      type: 'meeting',
      due_date: '2024-12-15',
      duration: '90 minutes',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Duration must be in HH:MM format');
  });

  it('should accept valid duration format', () => {
    const valid = {
      subject: 'Meeting',
      type: 'meeting',
      due_date: '2024-12-15',
      duration: '01:30',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should reject note exceeding 65535 characters', () => {
    const invalid = {
      subject: 'Task',
      type: 'task',
      due_date: '2024-12-15',
      note: 'a'.repeat(65536),
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Note cannot exceed 65535 characters');
  });

  it('should reject public_description exceeding 1000 characters', () => {
    const invalid = {
      subject: 'Task',
      type: 'task',
      due_date: '2024-12-15',
      public_description: 'a'.repeat(1001),
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Public description cannot exceed 1000 characters');
  });

  it('should reject activity without any association', () => {
    const invalid = {
      subject: 'Task',
      type: 'task',
      due_date: '2024-12-15',
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('At least one of deal_id, person_id, or org_id must be provided');
  });

  it('should reject location exceeding 255 characters', () => {
    const invalid = {
      subject: 'Meeting',
      type: 'meeting',
      due_date: '2024-12-15',
      location: 'a'.repeat(256),
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Location cannot exceed 255 characters');
  });

  it('should reject invalid email in attendees', () => {
    const invalid = {
      subject: 'Meeting',
      type: 'meeting',
      due_date: '2024-12-15',
      deal_id: 1,
      attendees: [{ email_address: 'not-an-email' }],
    };
    expect(() => CreateActivitySchema.parse(invalid)).toThrow('Invalid email address');
  });

  it('should accept attendees without names', () => {
    const valid = {
      subject: 'Meeting',
      type: 'meeting',
      due_date: '2024-12-15',
      deal_id: 1,
      attendees: [{ email_address: 'john@example.com' }],
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });
});

describe('UpdateActivitySchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: 1 };
    expect(() => UpdateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should accept update with multiple fields', () => {
    const valid = {
      id: 1,
      subject: 'Updated subject',
      type: 'meeting',
      due_date: '2024-12-20',
      done: true,
    };
    expect(() => UpdateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { subject: 'Updated' };
    expect(() => UpdateActivitySchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid = { id: -1 };
    expect(() => UpdateActivitySchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject empty subject if provided', () => {
    const invalid = { id: 1, subject: '' };
    expect(() => UpdateActivitySchema.parse(invalid)).toThrow('Subject cannot be empty');
  });
});

describe('ListActivitiesSchema', () => {
  it('should accept valid list request with defaults', () => {
    const valid = {};
    const result = ListActivitiesSchema.parse(valid);
    expect(result.start).toBe(0);
  });

  it('should accept list with all filters', () => {
    const valid = {
      start: 10,
      limit: 50,
      user_id: 1,
      deal_id: 5,
      person_id: 10,
      org_id: 20,
      type: 'meeting',
      done: true,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      filter_id: 3,
      sort: 'due_date',
      sort_by: 'desc',
    };
    expect(() => ListActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should reject when start_date is after end_date', () => {
    const invalid = {
      start_date: '2024-12-31',
      end_date: '2024-01-01',
    };
    expect(() => ListActivitiesSchema.parse(invalid)).toThrow('Start date must be before or equal to end date');
  });

  it('should accept when start_date equals end_date', () => {
    const valid = {
      start_date: '2024-12-15',
      end_date: '2024-12-15',
    };
    expect(() => ListActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should accept start_date without end_date', () => {
    const valid = { start_date: '2024-01-01' };
    expect(() => ListActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should accept end_date without start_date', () => {
    const valid = { end_date: '2024-12-31' };
    expect(() => ListActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid activity type', () => {
    const invalid = { type: 'conference' };
    expect(() => ListActivitiesSchema.parse(invalid)).toThrow();
  });
});

describe('BulkDeleteActivitiesSchema', () => {
  it('should accept valid bulk delete', () => {
    const valid = {
      ids: [1, 2, 3, 4, 5],
    };
    expect(() => BulkDeleteActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty IDs array', () => {
    const invalid = { ids: [] };
    expect(() => BulkDeleteActivitiesSchema.parse(invalid)).toThrow('At least one activity ID is required');
  });

  it('should reject more than 100 IDs', () => {
    const invalid = {
      ids: Array.from({ length: 101 }, (_, i) => i + 1),
    };
    expect(() => BulkDeleteActivitiesSchema.parse(invalid)).toThrow('Cannot delete more than 100 activities at once');
  });

  it('should accept exactly 100 IDs', () => {
    const valid = {
      ids: Array.from({ length: 100 }, (_, i) => i + 1),
    };
    expect(() => BulkDeleteActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid IDs in array', () => {
    const invalid = { ids: [1, -2, 3] };
    expect(() => BulkDeleteActivitiesSchema.parse(invalid)).toThrow();
  });
});

describe('BulkUpdateActivitiesSchema', () => {
  it('should accept valid bulk update', () => {
    const valid = {
      ids: [1, 2, 3],
      user_id: 5,
      done: true,
    };
    expect(() => BulkUpdateActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty IDs array', () => {
    const invalid = {
      ids: [],
      done: true,
    };
    expect(() => BulkUpdateActivitiesSchema.parse(invalid)).toThrow('At least one activity ID is required');
  });

  it('should reject more than 100 IDs', () => {
    const invalid = {
      ids: Array.from({ length: 101 }, (_, i) => i + 1),
      done: true,
    };
    expect(() => BulkUpdateActivitiesSchema.parse(invalid)).toThrow('Cannot update more than 100 activities at once');
  });

  it('should accept update with only type change', () => {
    const valid = {
      ids: [1, 2],
      type: 'task',
    };
    expect(() => BulkUpdateActivitiesSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid type', () => {
    const invalid = {
      ids: [1, 2],
      type: 'appointment',
    };
    expect(() => BulkUpdateActivitiesSchema.parse(invalid)).toThrow();
  });
});

describe('CreateActivitySchema - Time Format Edge Cases', () => {
  it('should accept midnight time', () => {
    const valid = {
      subject: 'Early task',
      type: 'task',
      due_date: '2024-12-15',
      due_time: '00:00',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should accept end of day time', () => {
    const valid = {
      subject: 'Late task',
      type: 'task',
      due_date: '2024-12-15',
      due_time: '23:59',
      deal_id: 1,
    };
    expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
  });

  it('should accept various duration formats', () => {
    const durations = ['00:15', '01:00', '02:30', '10:45'];
    durations.forEach(duration => {
      const valid = {
        subject: 'Task',
        type: 'task',
        due_date: '2024-12-15',
        duration,
        deal_id: 1,
      };
      expect(() => CreateActivitySchema.parse(valid)).not.toThrow();
    });
  });
});
