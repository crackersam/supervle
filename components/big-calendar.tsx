"use client";

import { Calendar } from "react-big-calendar";
import moment from "moment-timezone";
import { momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.tz.setDefault("Europe/London");
const localizer = momentLocalizer(moment);

export type CalEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

export default function RecurringCalendar({
  events,
  date,
  onSelectEvent,
}: {
  events: CalEvent[];
  date: string;
  onSelectEvent?: (event: CalEvent) => void;
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
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
}
