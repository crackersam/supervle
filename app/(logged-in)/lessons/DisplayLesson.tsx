// /mnt/data/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // adjust for your auth
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { getLessons, getOccurrences, getFiles, deleteFile } from "./actions";

type Lesson = { id: number; title: string };
type Occurrence = { id: number; start: string };
type FileRecord = { id: number; filename: string };

export default function FilePage() {
  const { data: session } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<number | null>(
    null
  );

  // Fetch lessons once
  useEffect(() => {
    getLessons().then(setLessons);
  }, []);

  // Handle lesson dropdown change
  const handleLessonChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const lessonId = Number(e.target.value);
    setSelectedLesson(lessonId);
    setSelectedOccurrence(null);
    setOccurrences([]);
    setFiles([]);
    if (lessonId) {
      const occs = await getOccurrences(lessonId);
      setOccurrences(
        occs.map((o) => ({ id: o.id, start: o.start.toISOString() }))
      );
    }
  };

  // Handle occurrence dropdown change
  const handleOccurrenceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const occId = Number(e.target.value);
    setSelectedOccurrence(occId);
    setFiles([]);
    if (occId) {
      const fetched = await getFiles(occId);
      setFiles(fetched);
    }
  };

  // Delete handler without using 'any'
  const handleDelete = async (fileId: number) => {
    if (!session) return;
    try {
      await deleteFile(fileId);
      if (selectedOccurrence) {
        const updated = await getFiles(selectedOccurrence);
        setFiles(updated);
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert(message || "Could not delete file");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Lesson & Occurrence Selector
        </h1>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Lesson Selector */}
          <div>
            <label
              htmlFor="lesson"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Lesson
            </label>
            <select
              id="lesson"
              className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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

          {/* Occurrence Selector */}
          <div>
            <label
              htmlFor="occurrence"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Occurrence
            </label>
            <select
              id="occurrence"
              className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
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

        {/* Files Display */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Files</h2>
          {files.length === 0 ? (
            <p className="text-gray-600">
              No files available for this selection.
            </p>
          ) : (
            <div className="space-y-6">
              {files.map((f) => {
                const ext = f.filename.split(".")?.pop()?.toLowerCase() ?? "";
                const isVideo = ["mp4", "webm", "ogg"].includes(ext);

                return (
                  <div
                    key={f.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-2xl hover:shadow-lg transition"
                  >
                    {isVideo ? (
                      <video
                        controls
                        className="w-full sm:w-1/2 h-auto rounded-lg"
                        src={`/uploads/${f.filename}`}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <span className="text-gray-800 font-medium mb-3 sm:mb-0">
                        {f.filename}
                      </span>
                    )}

                    <div className="flex space-x-2">
                      {!isVideo && (
                        <a
                          href={`/uploads/${f.filename}`}
                          download={f.filename}
                          className="inline-flex items-center px-4 py-2 rounded-2xl shadow-sm text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                          Download
                        </a>
                      )}

                      {/* Delete button only for teachers */}
                      {(session?.user?.role === "TEACHER" ||
                        session?.user?.role === "ADMIN") && (
                        <motion.button
                          onClick={() => handleDelete(f.id)}
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center px-4 py-2 rounded-2xl shadow-sm text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </motion.button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
