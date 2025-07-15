"use client";

import { useState } from "react";
import RecurringCalendar, { CalEvent } from "@/components/big-calendar";
const ReactCalendar = dynamic(() => import("react-calendar"), { ssr: false });
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import dynamic from "next/dynamic";

export default function CalendarPage({ events }: { events: CalEvent[] }) {
  // State for selected week date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Dialog state and selected event
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  // State for calendar dialog
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelectEvent = (event: CalEvent) => {
    setSelectedEvent(event);
    setIsEventOpen(true);
  };

  return (
    <div>
      <div className="flex justify-center mb-4">
        <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="rounded-lg border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Select Date
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Date</DialogTitle>
              <DialogDescription>
                Choose a date to view the schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <ReactCalendar
                onClickWeekNumber={(_weekNumber, date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
                onChange={(date) => {
                  if (date instanceof Date) {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }
                }}
                value={selectedDate}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCalendarOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <RecurringCalendar
        events={events}
        date={selectedDate.toISOString()}
        onSelectEvent={handleSelectEvent}
      />

      {/* Event Details Dialog */}
      <Dialog
        open={isEventOpen}
        onOpenChange={(open) => {
          setIsEventOpen(open);
          if (!open) setSelectedEvent(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription asChild>
              {selectedEvent && (
                <div className="space-y-2">
                  <p>
                    <strong>Start:</strong>{" "}
                    {selectedEvent.start.toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong> {selectedEvent.end.toLocaleString()}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEventOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
