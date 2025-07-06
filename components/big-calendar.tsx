"use client";

import { RRule } from "rrule";
import moment from "moment-timezone";
import { Calendar } from "react-big-calendar";
import { momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Set default timezone to Europe/London
moment.tz.setDefault("Europe/London");
const localizer = momentLocalizer(moment);

// 1. Define your recurrence rules
const teamSyncRule = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.WE],
  dtstart: new Date(2025, 6, 1, 9, 0), // July 1, 2025 @ 09:00 local
  count: 10,
});

const lunchRule = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
  dtstart: new Date(2025, 6, 1, 12, 0), // July 1, 2025 @ 12:00 local
  count: 10,
});

// 2. Expand rules into discrete events
const teamSyncEvents = teamSyncRule.all().map((dt) => {
  const m = moment(dt).tz("Europe/London");
  return {
    start: m.toDate(),
    end: m.clone().add(1, "hour").toDate(),
    title: "Team Sync",
  };
});

const lunchEvents = lunchRule.all().map((dt) => {
  const m = moment(dt).tz("Europe/London");
  return {
    start: m.toDate(),
    end: m.clone().add(1, "hour").toDate(),
    title: "Lunch",
  };
});

// 3. Combine all events
const events = [...teamSyncEvents, ...lunchEvents];

// 4. RecurringCalendar component
export default function RecurringCalendar({ date }: { date: Date }) {
  return (
    <div style={{ height: 600, padding: "1rem" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="work_week"
        views={["work_week", "day"]}
        date={date}
        style={{ height: "100%" }}
      />
    </div>
  );
}
