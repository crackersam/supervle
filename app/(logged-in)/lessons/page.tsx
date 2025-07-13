"use client";
import { useEffect, useState } from "react";
import { getLessons, getOccurrences, getFiles } from "./actions";

type Lesson = { id: number; title: string };
type Occurrence = { id: number; start: string };
type FileRecord = { id: number; filename: string };

export default function FilePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  useEffect(() => {
    getLessons().then(setLessons);
  }, []);

  const handleLessonChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const lessonId = Number(e.target.value);
    setSelectedLesson(lessonId);
    setOccurrences([]);
    setFiles([]);
    if (lessonId) {
      const occs = await getOccurrences(lessonId);
      // Convert Date to ISO string for client state
      setOccurrences(
        occs.map((o) => ({ id: o.id, start: o.start.toISOString() }))
      );
    }
  };

  const handleOccurrenceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const occId = Number(e.target.value);
    setFiles([]);
    if (occId) {
      const fetched = await getFiles(occId);
      setFiles(fetched);
    }
  };

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Select Lesson and Occurrence
      </h1>
      <div className="mb-6">
        <label className="block mb-2 text-gray-700">
          Lesson:
          <select
            className="ml-2 p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handleLessonChange}
            defaultValue=""
          >
            <option value="" disabled>
              -- Select --
            </option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-gray-700">
          Occurrence:
          <select
            className="ml-2 p-2 border border-gray-300 rounded bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handleOccurrenceChange}
            disabled={!selectedLesson}
            defaultValue=""
          >
            <option value="" disabled>
              -- Select --
            </option>
            {occurrences.map((o) => (
              <option key={o.id} value={o.id}>
                {new Date(o.start).toLocaleString()}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Files</h2>
        {files.length === 0 && (
          <p className="text-gray-600">No files for this selection.</p>
        )}
        {files.map((f) => {
          const ext = f.filename.split(".")?.pop()?.toLowerCase() ?? "";
          if (["mp4", "webm", "ogg"].includes(ext)) {
            return (
              <div key={f.id} className="mb-6">
                <video
                  controls
                  width={640}
                  className="rounded shadow"
                  src={`/uploads/${f.filename}`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }
          return (
            <div key={f.id} className="mb-4">
              <a
                href={`/uploads/${f.filename}`}
                download={f.filename}
                className="inline-block p-2 border border-gray-300 rounded bg-gray-50 text-blue-600 hover:bg-gray-100 transition"
              >
                {f.filename}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
