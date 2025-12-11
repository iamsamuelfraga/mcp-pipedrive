import { describe, it, expect } from 'vitest';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ListProjectsSchema,
  ProjectStatusSchema,
} from '../project.js';

describe('ProjectStatusSchema', () => {
  it('should accept valid project statuses', () => {
    const validStatuses = ['open', 'completed', 'canceled', 'deleted'];
    validStatuses.forEach(status => {
      expect(() => ProjectStatusSchema.parse(status)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    expect(() => ProjectStatusSchema.parse('in_progress')).toThrow('Status must be one of: open, completed, canceled, deleted');
  });

  it('should be case-sensitive', () => {
    expect(() => ProjectStatusSchema.parse('Open')).toThrow();
  });
});

describe('CreateProjectSchema', () => {
  it('should accept valid project with required fields', () => {
    const valid = {
      title: 'New Project',
      board_id: 1,
      phase_id: 5,
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept project with all fields', () => {
    const valid = {
      title: 'Comprehensive Project',
      board_id: 1,
      phase_id: 5,
      description: 'A detailed project description',
      status: 'open',
      owner_id: 10,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      deal_ids: [1, 2, 3],
      org_id: 20,
      person_id: 15,
      labels: [100, 101, 102],
      template_id: 50,
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should reject empty title', () => {
    const invalid = {
      title: '',
      board_id: 1,
      phase_id: 5,
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('Title is required and cannot be empty');
  });

  it('should reject title exceeding 255 characters', () => {
    const invalid = {
      title: 'a'.repeat(256),
      board_id: 1,
      phase_id: 5,
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('Title cannot exceed 255 characters');
  });

  it('should reject description exceeding 2000 characters', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      description: 'a'.repeat(2001),
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('Description cannot exceed 2000 characters');
  });

  it('should accept description at 2000 characters', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      description: 'a'.repeat(2000),
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing board_id', () => {
    const invalid = {
      title: 'Project',
      phase_id: 5,
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow();
  });

  it('should reject missing phase_id', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid board_id', () => {
    const invalid = {
      title: 'Project',
      board_id: -1,
      phase_id: 5,
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject invalid phase_id', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 0,
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject invalid status', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      status: 'pending',
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('Status must be one of: open, completed, canceled, deleted');
  });

  it('should reject invalid start_date format', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      start_date: '01/01/2024',
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('Date must be in YYYY-MM-DD format');
  });

  it('should reject invalid end_date format', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      end_date: '12-31-2024',
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow('Date must be in YYYY-MM-DD format');
  });

  it('should accept empty deal_ids array', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      deal_ids: [],
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid deal IDs', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      deal_ids: [1, -2, 3],
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow();
  });

  it('should accept empty labels array', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      labels: [],
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should reject invalid label IDs', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      labels: [1, 0, 3],
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow();
  });

  it('should reject extra fields in strict mode', () => {
    const invalid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      extra_field: 'not allowed',
    };
    expect(() => CreateProjectSchema.parse(invalid)).toThrow();
  });
});

describe('UpdateProjectSchema', () => {
  it('should accept valid update with only ID', () => {
    const valid = { id: 1 };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with multiple fields', () => {
    const valid = {
      id: 1,
      title: 'Updated Project',
      status: 'completed',
      end_date: '2024-12-31',
    };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with board and phase', () => {
    const valid = {
      id: 1,
      board_id: 2,
      phase_id: 10,
    };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept update with deal_ids', () => {
    const valid = {
      id: 1,
      deal_ids: [5, 6, 7],
    };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should reject missing ID', () => {
    const invalid = { title: 'Updated Project' };
    expect(() => UpdateProjectSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid ID', () => {
    const invalid = { id: -1 };
    expect(() => UpdateProjectSchema.parse(invalid)).toThrow('ID must be positive');
  });

  it('should reject empty title if provided', () => {
    const invalid = { id: 1, title: '' };
    expect(() => UpdateProjectSchema.parse(invalid)).toThrow('Title cannot be empty');
  });

  it('should reject description exceeding 2000 characters', () => {
    const invalid = {
      id: 1,
      description: 'a'.repeat(2001),
    };
    expect(() => UpdateProjectSchema.parse(invalid)).toThrow('Description cannot exceed 2000 characters');
  });

  it('should reject invalid status', () => {
    const invalid = {
      id: 1,
      status: 'archived',
    };
    expect(() => UpdateProjectSchema.parse(invalid)).toThrow();
  });
});

describe('ListProjectsSchema', () => {
  it('should accept valid list request with defaults', () => {
    const valid = {};
    const result = ListProjectsSchema.parse(valid);
    expect(result.limit).toBe(100);
  });

  it('should accept list with all filters', () => {
    const valid = {
      cursor: 'next-page-cursor',
      limit: 50,
      filter_id: 5,
      status: 'open,completed',
      phase_id: 10,
      include_archived: true,
    };
    expect(() => ListProjectsSchema.parse(valid)).not.toThrow();
  });

  it('should accept comma-separated statuses', () => {
    const valid = { status: 'open,completed,canceled' };
    expect(() => ListProjectsSchema.parse(valid)).not.toThrow();
  });

  it('should accept single status', () => {
    const valid = { status: 'open' };
    expect(() => ListProjectsSchema.parse(valid)).not.toThrow();
  });

  it('should accept boolean-like values for include_archived', () => {
    const valid1 = { include_archived: '1' };
    const valid2 = { include_archived: 0 };
    const valid3 = { include_archived: true };
    expect(() => ListProjectsSchema.parse(valid1)).not.toThrow();
    expect(() => ListProjectsSchema.parse(valid2)).not.toThrow();
    expect(() => ListProjectsSchema.parse(valid3)).not.toThrow();
  });

  it('should reject negative limit', () => {
    const invalid = { limit: -1 };
    expect(() => ListProjectsSchema.parse(invalid)).toThrow('Limit must be positive');
  });

  it('should reject limit exceeding 500', () => {
    const invalid = { limit: 501 };
    expect(() => ListProjectsSchema.parse(invalid)).toThrow('Limit cannot exceed 500');
  });

  it('should accept limit at boundaries', () => {
    const valid1 = { limit: 1 };
    const valid2 = { limit: 500 };
    expect(() => ListProjectsSchema.parse(valid1)).not.toThrow();
    expect(() => ListProjectsSchema.parse(valid2)).not.toThrow();
  });

  it('should reject non-integer limit', () => {
    const invalid = { limit: 50.5 };
    expect(() => ListProjectsSchema.parse(invalid)).toThrow('Limit must be an integer');
  });

  it('should reject invalid phase_id', () => {
    const invalid = { phase_id: -1 };
    expect(() => ListProjectsSchema.parse(invalid)).toThrow();
  });
});

describe('CreateProjectSchema - Date Validation', () => {
  it('should accept valid date range', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept same start and end date', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      start_date: '2024-06-15',
      end_date: '2024-06-15',
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept only start_date', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      start_date: '2024-01-01',
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept only end_date', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      end_date: '2024-12-31',
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept dates in different years', () => {
    const valid = {
      title: 'Project',
      board_id: 1,
      phase_id: 5,
      start_date: '2024-12-01',
      end_date: '2025-02-28',
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });
});

describe('CreateProjectSchema - Association Scenarios', () => {
  it('should accept project with organization only', () => {
    const valid = {
      title: 'Org Project',
      board_id: 1,
      phase_id: 5,
      org_id: 20,
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept project with person only', () => {
    const valid = {
      title: 'Person Project',
      board_id: 1,
      phase_id: 5,
      person_id: 15,
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept project with both org and person', () => {
    const valid = {
      title: 'Combined Project',
      board_id: 1,
      phase_id: 5,
      org_id: 20,
      person_id: 15,
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept project with multiple deal associations', () => {
    const valid = {
      title: 'Multi-Deal Project',
      board_id: 1,
      phase_id: 5,
      deal_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept project with template', () => {
    const valid = {
      title: 'Templated Project',
      board_id: 1,
      phase_id: 5,
      template_id: 100,
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept project with multiple labels', () => {
    const valid = {
      title: 'Labeled Project',
      board_id: 1,
      phase_id: 5,
      labels: [101, 102, 103, 104, 105],
    };
    expect(() => CreateProjectSchema.parse(valid)).not.toThrow();
  });
});

describe('UpdateProjectSchema - Status Transitions', () => {
  it('should accept status change to completed', () => {
    const valid = {
      id: 1,
      status: 'completed',
    };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept status change to canceled', () => {
    const valid = {
      id: 1,
      status: 'canceled',
    };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept status change to deleted', () => {
    const valid = {
      id: 1,
      status: 'deleted',
    };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });

  it('should accept reopening project', () => {
    const valid = {
      id: 1,
      status: 'open',
    };
    expect(() => UpdateProjectSchema.parse(valid)).not.toThrow();
  });
});
