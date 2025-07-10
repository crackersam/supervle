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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import "react-calendar/dist/Calendar.css";
import dynamic from "next/dynamic";

export default function CalendarPage({ events }: { events: CalEvent[] }) {
  // State for selected week date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Dialog state and selected event
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  const handleSelectEvent = (event: CalEvent) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  return (
    <div className="p-4 flex flex-col gap-4 md:flex-row items-center justify-center">
      <div className="md:flex-1">
        <RecurringCalendar
          events={events}
          date={selectedDate.toISOString()}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      <div className="space-y-4">
        <ReactCalendar
          onClickWeekNumber={(_weekNumber, date) => setSelectedDate(date)}
          onChange={(date) => date instanceof Date && setSelectedDate(date)}
          value={selectedDate}
          showWeekNumbers
        />
      </div>

      {/* Event Details Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
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
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
