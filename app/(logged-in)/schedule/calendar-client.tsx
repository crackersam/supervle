"use client";

import { useState } from "react";
import { Session } from "next-auth";
import Calendars from "@/components/calendars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <Calendar className="mr-2 h-6 w-6 text-indigo-600" />
              Schedule Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {session.user?.role === "ADMIN" && (
              <div className="space-y-2">
                <Label
                  htmlFor="student-select"
                  className="text-gray-700 font-medium"
                >
                  Select Student
                </Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger
                    id="student-select"
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentList.map((stu) => (
                      <SelectItem key={stu.id} value={stu.id}>
                        {stu.forename} {stu.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCalendar.title}
              </h2>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
