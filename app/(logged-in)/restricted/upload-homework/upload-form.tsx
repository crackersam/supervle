// app/homework/upload/UploadForm.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uploadHomework } from "./actions";
import { toast } from "sonner";

export interface Occurrence {
  id: number;
  lesson: { title: string };
  start: string;
}

export default function UploadForm({
  occurrences,
}: {
  occurrences: Occurrence[];
}) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await uploadHomework(formData);
    if (result.success) {
      toast.success(result.message);
      formRef.current?.reset();
      setDueDate(undefined);
    } else {
      toast.error(result.message || "Failed to upload homework");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center">
          Upload Homework
        </h1>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Homework File
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.zip"
              required
              className="mt-2 block w-full p-2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="lessonOccurrenceId"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson Occurrence
            </label>
            <select
              id="lessonOccurrenceId"
              name="lessonOccurrenceId"
              required
              className="mt-2 block w-full px-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a lesson</option>
              {occurrences.map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {occ.lesson.title} —{" "}
                  {format(new Date(occ.start), "dd/MM/yyyy")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <Dialog open={openCalendar} onOpenChange={setOpenCalendar}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full flex justify-between border border-gray-300 rounded-lg px-4 py-2",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  {dueDate ? format(dueDate, "dd/MM/yyyy") : "Pick a date"}
                  <CalendarIcon className="ml-2 w-4 h-4 opacity-50" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-sm">
                <DialogHeader>
                  <DialogTitle>Select date</DialogTitle>
                  <DialogDescription>
                    Choose a due date for the homework.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center mb-4">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(day) => {
                      if (day) setDueDate(day);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </div>
                <DialogFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpenCalendar(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setOpenCalendar(false)}>Done</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <input
              type="hidden"
              name="dueDate"
              value={dueDate ? dueDate.toISOString() : ""}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-6 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Homework
          </button>
        </form>
      </div>
    </div>
  );
}
