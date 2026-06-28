/**
 * Client-side filtering of list responses by item creation date (`add_time`).
 *
 * The Pipedrive API v1 `/deals` and `/leads` endpoints do not accept `add_time`
 * as a query parameter, so date-range filtering must be applied after the
 * response is received.
 *
 * Comparison is done on the date portion (`YYYY-MM-DD`) as a string, which is
 * robust across the two `add_time` formats Pipedrive returns:
 *   - deals: `"2019-11-21 08:12:13"` (space-separated, UTC, no offset)
 *   - leads: `"2020-06-30T08:00:00.000Z"` (ISO 8601)
 *
 * Lexicographic comparison of ISO date strings is equivalent to chronological
 * comparison, so this sidesteps timezone parsing pitfalls entirely (e.g.
 * `new Date("2019-11-21 08:12:13")` would be parsed in the host's local time,
 * while the requested bounds would be in UTC) and avoids end-of-day boundary
 * hacks.
 *
 * Both bounds are inclusive. Items without an `add_time` field pass through
 * unfiltered.
 */
interface DateFilterableResponse {
  success?: boolean;
  data?: unknown;
  additional_data?: unknown;
}

export function applyDateFilter(
  response: unknown,
  addTimeFrom?: string,
  addTimeUntil?: string
): unknown {
  if (!addTimeFrom && !addTimeUntil) return response;

  const resp = response as DateFilterableResponse;
  if (!resp.data || !Array.isArray(resp.data)) return response;

  const filtered = resp.data.filter((item: unknown) => {
    const addTime = (item as { add_time?: string }).add_time;
    if (!addTime) return true; // items without add_time pass through unfiltered
    const day = addTime.slice(0, 10); // "YYYY-MM-DD"
    if (addTimeFrom && day < addTimeFrom) return false;
    if (addTimeUntil && day > addTimeUntil) return false;
    return true;
  });

  return {
    ...resp,
    data: filtered,
    additional_data: {
      ...((resp.additional_data as object) ?? {}),
      total_count: filtered.length,
    },
  };
}
