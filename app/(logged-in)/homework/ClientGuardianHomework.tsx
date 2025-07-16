// app/homework/ClientGuardianHomework.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getHomeworkForStudent } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Download } from "lucide-react";

interface StudentOption {
  id: string;
  label: string;
}

interface HomeworkItem {
  id: number;
  filePath: string;
  dueDate: Date;
  createdAt: Date;
  lessonOccurrence: {
    id: number;
    start: Date;
    end: Date;
    lesson: {
      id: number;
      title: string;
    };
  };
}

interface Props {
  initialStudents: StudentOption[];
}

export default function ClientGuardianHomework({ initialStudents }: Props) {
  const [options] = useState<StudentOption[]>(initialStudents);
  const [selectedId, setSelectedId] = useState<string>(
    initialStudents[0]?.id ?? ""
  );
  const [homework, setHomework] = useState<HomeworkItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoLoaded, setAutoLoaded] = useState<boolean>(false);

  /* ------------------------- OPTION SANITY CHECK ------------------------- */
  useEffect(() => {
    if (options.length && !options.find((o) => o.id === selectedId)) {
      setSelectedId(options[0].id);
    }
  }, [options, selectedId]);

  /* ---------- Auto-load homework when only one option ---------- */
  useEffect(() => {
    if (options.length === 1 && !autoLoaded) {
      (async () => {
        setLoading(true);
        try {
          const data = await getHomeworkForStudent(options[0].id);
          setHomework(data);
          setSelectedId(options[0].id);
          setAutoLoaded(true);
        } catch (e: unknown) {
          console.error(e);
          setError("Failed to load homework");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [options, autoLoaded]);

  /* ------------------------ Manual fetch ------------------------ */
  async function view(): Promise<void> {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getHomeworkForStudent(selectedId);
      setHomework(data);
    } catch (e: unknown) {
      console.error(e);
      setError("Failed to load homework");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------ RENDER ------------------------------ */
  return (
    <>
      {/* If exactly one option, show as plain text */}
      {options.length === 1 ? (
        <p className="text-center text-gray-700 font-medium">
          {options[0].label}
        </p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="student" className="text-gray-700 font-medium">
            Select Student
          </Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger
              id="student"
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o: StudentOption) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Show button when select is required */}
      {options.length > 1 && (
        <Button
          onClick={view}
          disabled={!selectedId || loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "View Homework"
          )}
        </Button>
      )}

      {error && (
        <div className="flex items-center justify-center text-red-600 mt-4">
          {error}
        </div>
      )}

      {homework && (
        <div className="overflow-x-auto mt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Lesson</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homework.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-600">
                    No homework assigned yet.
                  </TableCell>
                </TableRow>
              ) : (
                homework.map((hw) => (
                  <TableRow
                    key={hw.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {hw.lessonOccurrence.lesson.title}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(hw.lessonOccurrence.start),
                        "dd/MM/yyyy"
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(hw.dueDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        asChild
                        className="hover:text-indigo-600"
                      >
                        <Link
                          href={hw.filePath}
                          target="_blank"
                          className="flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {loading && !homework && (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      )}
    </>
  );
}
