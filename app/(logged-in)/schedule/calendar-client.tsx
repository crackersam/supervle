"use client";
import React, { useState } from "react";
import { Session } from "next-auth";
import Calendars from "@/components/calendars";

export interface StudentInfo {
  id: string;
  forename: string;
  surname: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface PerUserCalendar {
  title: string;
  events: CalendarEvent[];
}

interface CalendarClientProps {
  studentList: StudentInfo[];
  calendarMap: Record<string, PerUserCalendar>;
  session: Session;
  initialSelectedId: string;
}

export default function CalendarClient({
  studentList,
  calendarMap,
  initialSelectedId,
  session,
}: CalendarClientProps) {
  // Store selectedId as a string
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);

  // Lookup calendar by string key
  const selectedCalendar = calendarMap[selectedId] || { title: "", events: [] };

  return (
    <div>
      {session.user?.role === "ADMIN" && (
        <div className="mb-4">
          <label htmlFor="student-select" className="mr-2">
            Select Student:
          </label>
          <select
            id="student-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {studentList.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.forename} {stu.surname}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{selectedCalendar.title}</h2>
        <Calendars
          events={selectedCalendar.events.map((event) => ({
            ...event,
            // If Calendars expects numeric IDs, parse here
            id: parseInt(event.id, 10),
            start: new Date(event.start),
            end: new Date(event.end),
          }))}
        />
      </div>
    </div>
  );
}
