"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // adjust for your auth
import { motion } from "framer-motion";
import { Trash2, Download, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { getLessons, getOccurrences, getFiles, deleteFile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Lesson = { id: number; title: string };
type Occurrence = { id: number; start: string };
type FileRecord = { id: number; filename: string };

export default function FilePage() {
  const { data: session } = useSession();
  const canManage =
    session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";
  const isStudent =
    session?.user?.role !== "TEACHER" && session?.user?.role !== "ADMIN";

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

  // Handle lesson change
  const handleLessonChange = async (value: string) => {
    const lessonId = Number(value);
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

  // Handle occurrence change
  const handleOccurrenceChange = async (value: string) => {
    const occId = Number(value);
    setSelectedOccurrence(occId);
    setFiles([]);
    if (occId) {
      const fetched = await getFiles(occId);
      setFiles(fetched);
    }
  };

  // Delete handler
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <FileText className="mr-2 h-6 w-6 text-indigo-600" />
              Lesson & Occurrence Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lesson" className="text-gray-700 font-medium">
                Select Lesson
              </Label>
              <Select
                value={selectedLesson?.toString() ?? ""}
                onValueChange={handleLessonChange}
              >
                <SelectTrigger
                  id="lesson"
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <SelectValue placeholder="-- Choose a lesson --" />
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
              <Label htmlFor="occurrence" className="text-gray-700 font-medium">
                Select Occurrence
              </Label>
              <Select
                value={selectedOccurrence?.toString() ?? ""}
                onValueChange={handleOccurrenceChange}
                disabled={!selectedLesson}
              >
                <SelectTrigger
                  id="occurrence"
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <SelectValue placeholder="-- Choose an occurrence --" />
                </SelectTrigger>
                <SelectContent>
                  {occurrences.map((o) => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      {new Date(o.start).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Files Display */}
        {selectedOccurrence && (
          <Card className="shadow-lg rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <FileText className="mr-2 h-6 w-6 text-indigo-600" />
                Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-center text-gray-600">
                  No files available for this selection.
                </p>
              ) : (
                <div className="space-y-6">
                  {files.map((f) => {
                    const ext =
                      f.filename.split(".")?.pop()?.toLowerCase() ?? "";
                    const isVideo = ["mp4", "webm", "ogg"].includes(ext);

                    return (
                      <div
                        key={f.id}
                        className="flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center p-4 border border-gray-200 rounded-2xl hover:shadow-lg transition"
                      >
                        {isVideo ? (
                          <video
                            controls
                            src={`/uploads/${f.filename}`}
                            className={`${
                              isStudent
                                ? "w-full h-auto"
                                : "w-full sm:flex-1 sm:w-3/4 h-auto"
                            } rounded-lg`}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <span className="text-gray-800 font-medium mb-3 sm:mb-0 flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-indigo-600" />
                            {f.filename}
                          </span>
                        )}

                        <div className="flex space-x-2 mt-3 sm:mt-0">
                          {!isVideo && (
                            <Button
                              variant="ghost"
                              asChild
                              className="hover:text-indigo-600"
                            >
                              <a
                                href={`/uploads/${f.filename}`}
                                download={f.filename}
                                className="flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" /> Download
                              </a>
                            </Button>
                          )}

                          {canManage && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <motion.button
                                  initial={{ scale: 1 }}
                                  whileHover={{ scale: 1.05 }}
                                  className="flex items-center px-4 py-2 rounded-2xl shadow-sm text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </motion.button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirm Deletion
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete
                                    this file?
                                    <br />
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(f.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
