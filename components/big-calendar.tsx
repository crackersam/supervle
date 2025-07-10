"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, View } from "react-big-calendar";
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
  // internal state for controlled calendar
  const [currentDate, setCurrentDate] = useState<Date>(new Date(date));
  const [currentView, setCurrentView] = useState<View>("work_week");

  // if the `date` prop ever changes, sync it
  useEffect(() => {
    setCurrentDate(new Date(date));
  }, [date]);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setCurrentView(newView);
  }, []);

  // ensure events have real Date objects
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
        // controlled props:
        view={currentView}
        onView={handleViewChange}
        date={currentDate}
        onNavigate={handleNavigate}
        // allow only work_week and day views
        views={["work_week", "day"]}
        style={{ height: "100%" }}
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
}
