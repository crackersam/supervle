// app/(logged-in)/EventsSection.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNonRecurringEvents } from "./actions";
import { format } from "date-fns";

const DynamicCalendar = dynamic(() => import("react-calendar"), { ssr: false });

interface Event {
  id: number;
  title: string;
  start: string; // pre-formatted
}

interface EventsSectionProps {
  initialEvents: Event[];
}

const EventsSection = ({ initialEvents }: EventsSectionProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const fetchedEvents = await getNonRecurringEvents(
        weekStart.toISOString(),
        weekEnd.toISOString()
      );
      setEvents(fetchedEvents);
      setLoading(false);
    };

    fetchEvents();
  }, [date]);

  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DynamicCalendar
          onChange={(value) => setDate(value as Date)}
          value={date}
          className="rounded-lg border-gray-300"
        />
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-600">No events this week.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="border-b pb-2">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.start), "MMMM d, yyyy - h:mm a")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsSection;
