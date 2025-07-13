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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Lesson & Occurrence Selector
        </h1>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="lesson"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Lesson
            </label>
            <select
              id="lesson"
              className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              onChange={handleLessonChange}
              defaultValue=""
            >
              <option value="" disabled>
                -- Choose a lesson --
              </option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="occurrence"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Occurrence
            </label>
            <select
              id="occurrence"
              className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
              onChange={handleOccurrenceChange}
              disabled={!selectedLesson}
              defaultValue=""
            >
              <option value="" disabled>
                -- Choose an occurrence --
              </option>
              {occurrences.map((o) => (
                <option key={o.id} value={o.id}>
                  {new Date(o.start).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Files</h2>
          {files.length === 0 && (
            <p className="text-gray-600">
              No files available for this selection.
            </p>
          )}
          <div className="space-y-6">
            {files.map((f) => {
              const ext = f.filename.split(".")?.pop()?.toLowerCase() ?? "";
              if (["mp4", "webm", "ogg"].includes(ext)) {
                return (
                  <div
                    key={f.id}
                    className="overflow-hidden rounded-lg shadow-md"
                  >
                    <video
                      controls
                      className="w-full h-auto"
                      src={`/uploads/${f.filename}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                );
              }
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-lg transition"
                >
                  <span className="text-gray-800 font-medium">
                    {f.filename}
                  </span>
                  <a
                    href={`/uploads/${f.filename}`}
                    download={f.filename}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                  >
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
