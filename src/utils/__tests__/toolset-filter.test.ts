import { describe, it, expect } from 'vitest';
import { DEFAULT_TOOLSETS, findToolset } from '../toolset-filter.js';

describe('findToolset', () => {
  const toolsets = [...DEFAULT_TOOLSETS];

  describe('single-word toolsets', () => {
    it('matches tools belonging to a simple toolset', () => {
      expect(findToolset('deals_create', toolsets)).toBe('deals');
      expect(findToolset('persons_list', toolsets)).toBe('persons');
      expect(findToolset('organizations_get', toolsets)).toBe('organizations');
      expect(findToolset('activities_update', toolsets)).toBe('activities');
      expect(findToolset('mailbox_get_thread', toolsets)).toBe('mailbox');
    });

    it('matches the toolset itself when name equals it', () => {
      expect(findToolset('deals', toolsets)).toBe('deals');
    });
  });

  describe('compound toolsets (regression guard)', () => {
    it.each([
      ['org_relationships_create', 'org_relationships'],
      ['org_relationships_get_all', 'org_relationships'],
      ['org_relationships_get', 'org_relationships'],
      ['org_relationships_update', 'org_relationships'],
      ['org_relationships_delete', 'org_relationships'],
      ['activity_types_list', 'activity_types'],
      ['activity_types_create', 'activity_types'],
      ['call_logs_get', 'call_logs'],
      ['call_logs_delete', 'call_logs'],
      ['project_templates_list', 'project_templates'],
      ['project_templates_get', 'project_templates'],
      ['permission_sets_list', 'permission_sets'],
      ['permission_sets_get', 'permission_sets'],
      ['stages_list', 'stages'],
      ['stages_create', 'stages'],
      ['stages_update', 'stages'],
      ['lead_labels_create', 'lead_labels'],
      ['lead_labels_update', 'lead_labels'],
      ['lead_labels_delete', 'lead_labels'],
    ])('matches %s → %s', (name, expected) => {
      expect(findToolset(name, toolsets)).toBe(expected);
    });
  });

  describe('longest-prefix wins', () => {
    it('prefers the longer compound toolset over a shorter overlap', () => {
      const overlapping = ['org', 'org_relationships'];
      expect(findToolset('org_relationships_create', overlapping)).toBe('org_relationships');
      expect(findToolset('org_create', overlapping)).toBe('org');
    });

    it('prefers lead_labels over leads for lead_labels_* names', () => {
      const overlapping = ['leads', 'lead_labels'];
      expect(findToolset('lead_labels_create', overlapping)).toBe('lead_labels');
      expect(findToolset('leads_create', overlapping)).toBe('leads');
    });

    it('does not match unrelated toolsets that share a prefix substring', () => {
      // `organizations` should not match `org_relationships_*`
      expect(findToolset('org_relationships_create', ['organizations'])).toBeUndefined();
      // `org_relationships` should not match `organizations_*`
      expect(findToolset('organizations_list', ['org_relationships'])).toBeUndefined();
    });
  });

  describe('legacy slash-separated names', () => {
    it('still resolves names that use a slash separator', () => {
      expect(findToolset('deals/create', toolsets)).toBe('deals');
      expect(findToolset('org_relationships/create', toolsets)).toBe('org_relationships');
    });
  });

  describe('unknown tools', () => {
    it('returns undefined when no toolset prefixes the tool name', () => {
      expect(findToolset('unknown_tool', toolsets)).toBeUndefined();
      expect(findToolset('completely_random_name', toolsets)).toBeUndefined();
    });

    it('returns undefined when toolsets list is empty', () => {
      expect(findToolset('deals_create', [])).toBeUndefined();
    });
  });

  describe('every default toolset has at least one resolvable tool', () => {
    it.each([...DEFAULT_TOOLSETS])('%s resolves to itself for a `${name}_x` tool', (name) => {
      expect(findToolset(`${name}_anything`, toolsets)).toBe(name);
    });
  });
});
