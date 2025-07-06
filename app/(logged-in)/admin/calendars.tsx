"use client";

import { useState } from "react";
import RecurringCalendar from "@/components/big-calendar";
import AddEventForm from "@/components/AddEventForm";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarPage({
  events,
}: {
  events: {
    id: number;
    title: string;
    start: string;
    end: string;
  }[];
}) {
  // Keep track of the currently‐selected date (we’ll treat it as the week anchor)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="p-4 flex flex-col gap-4">
      
        <AddEventForm />
      <RecurringCalendar events={events} date={selectedDate.toISOString()} />
    

        {/* Show week numbers, and when one’s clicked, switch to that week */}
        <ReactCalendar
          onClickWeekNumber={(_weekNumber, date) => setSelectedDate(date)}
          showWeekNumbers
          value={selectedDate}
          onChange={(date) => {
            if (date) {
              if (date instanceof Date) {
                setSelectedDate(date);
              }
            }
          }}
        />
    </div>
  );
}
