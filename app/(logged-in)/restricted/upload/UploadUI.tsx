"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { uploadFile } from "./actions";
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
import { Upload } from "lucide-react";
import { useSession } from "next-auth/react";

// Match the Date types returned by Prisma
interface Occurrence {
  id: number;
  start: Date;
  end: Date;
}

interface Lesson {
  id: number;
  title: string;
  occurrences: Occurrence[];
}

interface Props {
  lessons: Lesson[];
}

export default function UploadUI({ lessons }: Props) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const initialLessonId = lessons[0]?.id || 0;
  const initialOccurrenceId = lessons[0]?.occurrences[0]?.id || 0;

  const [lessonId, setLessonId] = useState<number>(initialLessonId);
  const [occurrenceId, setOccurrenceId] = useState<number>(initialOccurrenceId);

  useEffect(() => {
    const occs = lessons.find((l) => l.id === lessonId)?.occurrences || [];
    setOccurrenceId(occs[0]?.id || 0);
  }, [lessonId, lessons]);

  if (role !== "TEACHER" && role !== "ADMIN") {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-8">
          <Card className="shadow-lg rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-red-600">
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700">
                Only teachers can upload files to lessons.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // grab the file input and check size
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
    if (file.size > MAX_SIZE) {
      toast.error("File too large. Maximum size is 50 MB.");
      return;
    }

    const fd = new FormData(form);
    fd.set("occurrenceId", occurrenceId.toString());

    try {
      const { filename } = await uploadFile(fd);
      toast.success(`Uploaded as ${filename}`);
      form.reset();
      setLessonId(initialLessonId);
      setOccurrenceId(initialOccurrenceId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const currentOccs = lessons.find((l) => l.id === lessonId)?.occurrences || [];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <Upload className="mr-2 h-6 w-6 text-indigo-600" />
              Upload File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lesson" className="text-gray-700 font-medium">
                  Select Lesson
                </Label>
                <Select
                  value={lessonId.toString()}
                  onValueChange={(value) => setLessonId(Number(value))}
                >
                  <SelectTrigger className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Choose a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((l) => (
                      <SelectItem key={l.id} value={l.id.toString()}>
                        {l.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="occurrence"
                  className="text-gray-700 font-medium"
                >
                  Select Occurrence
                </Label>
                <Select
                  value={occurrenceId.toString()}
                  onValueChange={(value) => setOccurrenceId(Number(value))}
                >
                  <SelectTrigger className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Choose an occurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentOccs.map((occ) => (
                      <SelectItem key={occ.id} value={occ.id.toString()}>
                        {format(occ.start, "MMM d, yyyy 'at' h:mm a")} –{" "}
                        {format(occ.end, "h:mm a")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="text-gray-700 font-medium">
                  Select File (max 50 MB)
                </Label>
                <input
                  id="file"
                  type="file"
                  name="file"
                  accept="*/*"
                  required
                  className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
