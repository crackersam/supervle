"use client";

import { Calendar } from "react-big-calendar";
import moment from "moment-timezone";
import { momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.tz.setDefault("Europe/London");
const localizer = momentLocalizer(moment);

type Event = {
  id: number;
  title: string;
  start: string; // ISO
  end: string; // ISO
};

export default function RecurringCalendar({
  events,
  date,
}: {
  events: Event[];
  date: string;
}) {
  // convert ISO strings to Date
  const evts = events.map((e) => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));

  return (
    <div style={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={evts}
        startAccessor="start"
        endAccessor="end"
        defaultView="work_week"
        views={["work_week", "day"]}
        date={new Date(date)}
        style={{ height: "100%" }}
      />
    </div>
  );
}
