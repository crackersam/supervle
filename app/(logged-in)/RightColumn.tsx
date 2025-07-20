// app/home/RightColumn.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { getNonRecurringEvents } from "./actions"; // Assuming this is the events fetch action
import { getAnnouncements } from "./actions";
import { format } from "date-fns";

const DynamicCalendar = dynamic(() => import("react-calendar"), { ssr: false });

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
}

interface Announcement {
  id: string;
  title: string;
  date: Date;
  description: string;
}

interface RightColumnProps {
  initialEvents: Event[];
  initialAnnouncements: Announcement[];
}

const RightColumn = ({
  initialEvents,
  initialAnnouncements,
}: RightColumnProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const [fetchedEvents, fetchedAnnouncements] = await Promise.all([
        getNonRecurringEvents(weekStart.toISOString(), weekEnd.toISOString()),
        getAnnouncements(weekStart.toISOString(), weekEnd.toISOString()),
      ]);

      setEvents(fetchedEvents);
      setAnnouncements(fetchedAnnouncements);
      setLoading(false);
    };

    fetchData();
  }, [date]);

  return (
    <div className="space-y-2 w-[350px]">
      <div className="w-full flex flex-col justify-center items-center">
        <DynamicCalendar
          onChange={(value) => setDate(value as Date)}
          value={date}
          className="rounded-lg w-full shadow-sm"
        />
        <h2 className="text-2xl font-semibold text-left w-full mt-4 ml-2">
          Events
        </h2>
      </div>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : events.length === 0 ? (
        <Card
          className={`bg-gray-50 my-4 rounded-lg w-full border-t-4 border-l border-r border-b border-blue-200`}
        >
          <CardContent className="p-4">
            <p className="text-gray-600">No events this week.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-5">
          {events.map((event, index) => (
            <Card
              key={event.id}
              className={`bg-gray-50 my-4 rounded-lg w-full ${index % 2 === 0 ? "border-t-4 border-l border-r border-b border-blue-200" : "border-t-4 border-l border-r border-b border-purple-200"}`}
            >
              <CardContent className="p-4">
                <p
                  className="text-sm text-gray-500 mb-1"
                  suppressHydrationWarning
                >
                  {format(new Date(event.start), "MMMM d, yyyy")}
                </p>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-500" suppressHydrationWarning>
                    {format(new Date(event.start), "h:mm a")} -{" "}
                    {format(new Date(event.end), "h:mm a")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <h2 className="text-2xl font-semibold text-left w-full mt-4 ml-2">
        Announcements
      </h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : announcements.length === 0 ? (
        <Card
          className={`bg-gray-50 my-4 rounded-lg w-full border-t-4 border-l border-r border-b border-blue-200`}
        >
          <CardContent className="p-4">
            <p className="text-gray-600">No announcements this week.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-5">
          {announcements.map((ann, index) => (
            <Card
              key={ann.id}
              className={`bg-gray-50 my-4 rounded-lg w-full ${index % 2 === 0 ? "border-t-4 border-l border-r border-b border-blue-200" : "border-t-4 border-l border-r border-b border-purple-200"}`}
            >
              <CardContent className="p-4">
                <p
                  className="text-sm text-gray-500 mb-1"
                  suppressHydrationWarning
                >
                  {format(new Date(ann.date), "MMMM d, yyyy")}
                </p>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{ann.title}</h4>
                </div>
                <p className="text-gray-700">{ann.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RightColumn;
