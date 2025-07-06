import { rrulestr } from "rrule";
import { prisma } from "../../../prisma-singleton";
import Calendars from "./calendars";
import React from "react";

export default async function AdminPage() {
  const all = await prisma.event.findMany({ orderBy: { start: "asc" } });

  // Choose your window
  const windowStart = new Date();
  const windowEnd = new Date();
  windowEnd.setMonth(windowEnd.getMonth() + 3);

  // Turn each RRULE row into a list of actual dates
  const expanded = all.flatMap((e) => {
    if (e.rrule) {
      const rule = rrulestr(e.rrule, { dtstart: e.start });
      return rule.between(windowStart, windowEnd, true).map((dt) => ({
        id: e.id,
        title: e.title,
        start: dt.toISOString(),
        end: new Date(
          dt.getTime() + (e.end.getTime() - e.start.getTime())
        ).toISOString(),
      }));
    }
    return [
      {
        id: e.id,
        title: e.title,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
      },
    ];
  });

  return <Calendars events={expanded} />;
}
