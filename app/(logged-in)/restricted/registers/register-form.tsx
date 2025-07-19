"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Role = "STUDENT" | "TEACHER" | "ADMIN" | "GUARDIAN";

type Event = {
  id: string;
  title: string;
  users: { id: string; forename: string; surname: string; role: Role }[];
};

type Props = {
  events: Event[];
  registerAttendance: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
};

export default function RegisterForm({ events, registerAttendance }: Props) {
  const [selectedId, setSelectedId] = useState<string>(events[0]?.id || "");
  const selectedEvent = events.find((evt) => evt.id === selectedId)!;
  const [taken, setTaken] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await registerAttendance(formData);

    if (result.success) {
      toast.success(result.message);
      setTaken(true);
    } else {
      toast.error(`Error: ${result.message}`);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <Users className="mr-2 h-6 w-6 text-indigo-600" />
              Register Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="event" className="text-gray-700 font-medium">
                  Select Today&apos;s Class
                </Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger
                    id="event"
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((evt) => (
                      <SelectItem key={evt.id} value={evt.id}>
                        {evt.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="eventId" value={selectedId} />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Mark Attendance
                </Label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEvent.users
                        .filter((user) => user.role === "STUDENT")
                        .map((user) => (
                          <TableRow
                            key={user.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <TableCell>
                              {user.forename} {user.surname}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                id={`user-${user.id}`}
                                name="present"
                                value={user.id}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                {selectedEvent.users.filter((user) => user.role === "STUDENT")
                  .length === 0 && (
                  <p className="text-center text-gray-600 mt-4">
                    No students enrolled.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                disabled={taken}
              >
                {taken ? "Attendance Submitted" : "Submit Attendance"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
