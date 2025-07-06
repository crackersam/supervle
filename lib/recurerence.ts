// utils/recurrence.ts
import { RRule, rrulestr } from "rrule";

/**
 * Given an RRule (or string), plus a view window,
 * returns an array of { start, end, title } events.
 */
export function expandRecurrence(
  rule: RRule | string,
  windowStart: Date,
  windowEnd: Date,
  durationMs: number,
  title: string
) {
  // if you passed a string, parse it
  const rruleObj = typeof rule === "string" ? (rrulestr(rule) as RRule) : rule;

  // get all occurrence start-times within the window
  const starts: Date[] = rruleObj.between(windowStart, windowEnd, true);

  // map to calendar events, adding duration
  return starts.map((dt) => ({
    start: dt,
    end: new Date(dt.getTime() + durationMs),
    title,
  }));
}
