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
import {
  getLessons,
  getOccurrences,
  getFiles,
  deleteFile,
  getStudentsForGuardian,
  getLessonsForStudent,
} from "./actions";
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

interface Lesson {
  id: number;
  title: string;
}
interface Occurrence {
  id: number;
  start: string;
}
interface FileRecord {
  id: number;
  filename: string;
}
interface Student {
  id: string;
  name: string;
}

export default function FilePage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const canManage = role === "TEACHER" || role === "ADMIN";
  const isViewer = role === "STUDENT" || role === "GUARDIAN";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<number | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    if (role === "GUARDIAN") {
      getStudentsForGuardian().then((stus: Student[]) => {
        setStudents(stus);
        if (stus.length === 1) {
          setSelectedStudent(stus[0].id);
        }
      });
    } else if (role) {
      getLessons().then(setLessons);
    }
  }, [role]);

  // Fetch lessons when student changes (for guardians)
  useEffect(() => {
    if (role === "GUARDIAN" && selectedStudent) {
      getLessonsForStudent(selectedStudent).then(setLessons);
    }
  }, [selectedStudent, role]);

  // Handle student change
  const handleStudentChange = (value: string) => {
    setSelectedStudent(value);
    setSelectedLesson(null);
    setSelectedOccurrence(null);
    setOccurrences([]);
    setFiles([]);
    setLessons([]); // Clear lessons until new fetch
  };

  // Handle lesson change
  const handleLessonChange = async (value: string) => {
    const lessonId = Number(value);
    setSelectedLesson(lessonId);
    setSelectedOccurrence(null);
    setOccurrences([]);
    setFiles([]);
    if (lessonId) {
      const occs = await getOccurrences(lessonId);
      // Filter to weekdays only (Monday=1 to Friday=5) and today or future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const filteredOccs = occs.filter((o) => {
        const occDate = new Date(o.start);
        const day = occDate.getDay();
        return occDate >= today && day >= 1 && day <= 5;
      });
      setOccurrences(
        filteredOccs.map((o) => ({ id: o.id, start: o.start.toISOString() }))
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
    <div className="py-6">
      <div className="max-w-lg mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <FileText className="mr-2 h-6 w-6 text-indigo-600" />
              Lesson & Occurrence Selector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {role === "GUARDIAN" && (
              <div className="space-y-2">
                <Label htmlFor="student" className="text-gray-700 font-medium">
                  Select Student
                </Label>
                <Select
                  value={selectedStudent ?? ""}
                  onValueChange={handleStudentChange}
                >
                  <SelectTrigger
                    id="student"
                    className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <SelectValue placeholder="-- Choose a student --" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="lesson" className="text-gray-700 font-medium">
                Select Lesson
              </Label>
              <Select
                value={selectedLesson?.toString() ?? ""}
                onValueChange={handleLessonChange}
                disabled={role === "GUARDIAN" && !selectedStudent}
              >
                <SelectTrigger
                  id="lesson"
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
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
                              isViewer
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
