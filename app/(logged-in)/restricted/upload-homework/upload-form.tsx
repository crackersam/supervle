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
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uploadHomework } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="py-6">
      <div className="max-w-md mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <Upload className="mr-2 h-6 w-6 text-indigo-600" />
              Upload Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="lessonOccurrenceId"
                  className="text-gray-700 font-medium"
                >
                  Lesson Occurrence
                </Label>
                <Select name="lessonOccurrenceId">
                  <SelectTrigger className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {occurrences.map((occ) => (
                      <SelectItem key={occ.id} value={occ.id.toString()}>
                        {occ.lesson.title} —{" "}
                        {format(new Date(occ.start), "dd/MM/yyyy")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="block text-gray-700 font-medium">
                  Due Date
                </Label>
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
                  <DialogContent className="w-sm rounded-xl">
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
                      <Button onClick={() => setOpenCalendar(false)}>
                        Done
                      </Button>
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
              <div className="space-y-2">
                <Label htmlFor="file" className="text-gray-700 font-medium">
                  Homework File
                </Label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                  required
                  className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Homework
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
