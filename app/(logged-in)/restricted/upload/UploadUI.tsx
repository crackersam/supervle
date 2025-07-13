"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { uploadFile } from "./actions";

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
  const [lessonId, setLessonId] = useState<number>(lessons[0]?.id || 0);
  const [occurrenceId, setOccurrenceId] = useState<number>(
    lessons[0]?.occurrences[0]?.id || 0
  );

  useEffect(() => {
    const occs = lessons.find((l) => l.id === lessonId)?.occurrences || [];
    setOccurrenceId(occs[0]?.id || 0);
  }, [lessonId, lessons]);

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const currentOccs = lessons.find((l) => l.id === lessonId)?.occurrences || [];

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      <div>
        <label className="block text-gray-700">Lesson</label>
        <select
          value={lessonId}
          onChange={(e) => setLessonId(Number(e.target.value))}
          className="mt-1 block w-full rounded-lg border-gray-300"
        >
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700">Occurrence</label>
        <select
          value={occurrenceId}
          onChange={(e) => setOccurrenceId(Number(e.target.value))}
          className="mt-1 block w-full rounded-lg border-gray-300"
        >
          {currentOccs.map((occ) => (
            <option key={occ.id} value={occ.id}>
              {format(occ.start, "MMM d, yyyy 'at' h:mm a")} –{" "}
              {format(occ.end, "h:mm a")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700">Select File (max 50 MB)</label>
        <input
          type="file"
          name="file"
          accept="*/*"
          required
          className="mt-1 block w-full text-sm text-gray-700
           file:mr-4 file:py-2 file:px-4 file:rounded-full
           file:border-0 file:bg-blue-50 file:text-blue-700
           hover:file:bg-blue-100"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Upload
      </button>
    </form>
  );
}
