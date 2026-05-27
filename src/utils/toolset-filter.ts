/**
 * Default list of toolsets exposed by the MCP server. Used both as the fallback when
 * PIPEDRIVE_TOOLSETS is not set and as the canonical list of valid toolset prefixes.
 */
export const DEFAULT_TOOLSETS = [
  'deals',
  'persons',
  'organizations',
  'activities',
  'files',
  'search',
  'pipelines',
  'notes',
  'fields',
  'system',
  'products',
  'leads',
  'users',
  'roles',
  'webhooks',
  'filters',
  'projects',
  'project_templates',
  'goals',
  'tasks',
  'activity_types',
  'call_logs',
  'mailbox',
  'teams',
  'org_relationships',
  'permission_sets',
  'channels',
  'meetings',
] as const;

export type DefaultToolset = (typeof DEFAULT_TOOLSETS)[number];

/**
 * Resolves the toolset a tool belongs to by matching its name against the provided
 * toolset list. Returns the longest matching prefix so compound names like
 * `org_relationships` win over partial matches like `org`.
 *
 * A tool name matches a toolset `t` when it equals `t`, starts with `${t}_`, or
 * starts with `${t}/`. The legacy slash separator is supported for backwards
 * compatibility with older tool naming.
 *
 * @returns the matching toolset, or `undefined` if no toolset prefixes the name.
 */
export function findToolset(name: string, toolsets: readonly string[]): string | undefined {
  return toolsets
    .filter((t) => name === t || name.startsWith(`${t}_`) || name.startsWith(`${t}/`))
    .sort((a, b) => b.length - a.length)[0];
}
