"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Option, AttendancePayload, SessionRow } from "./actions";
import { searchStudents, getAttendanceData } from "./actions";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  initialOptions: Option[];
  allowSearch: boolean;
}

export default function ClientAttendance({
  initialOptions,
  allowSearch,
}: Props) {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [search, setSearch] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>(
    initialOptions[0]?.id ?? ""
  );
  const [attendance, setAttendance] = useState<AttendancePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoLoaded, setAutoLoaded] = useState<boolean>(false);

  /* ------------------------ SEARCH (Admin/Teacher) ------------------------ */
  useEffect(() => {
    let cancelled = false;
    if (allowSearch && search.length >= 3) {
      searchStudents(search)
        .then((newOpts: Option[]) => {
          if (cancelled) return;
          setOptions(newOpts);
          if (newOpts.length && !newOpts.find((o) => o.id === selectedId)) {
            setSelectedId(newOpts[0].id);
          }
        })
        .catch((e: unknown) => console.error(e));
    }
    return () => {
      cancelled = true;
    };
  }, [search, allowSearch, selectedId]);

  /* ------------------------- OPTION SANITY CHECK ------------------------- */
  useEffect(() => {
    if (options.length && !options.find((o) => o.id === selectedId)) {
      setSelectedId(options[0].id);
    }
  }, [options, selectedId]);

  /* ---------- Auto-load attendance when only one option (Student/Guardian) ---------- */
  useEffect(() => {
    if (!allowSearch && options.length === 1 && !autoLoaded) {
      (async () => {
        setLoading(true);
        try {
          const data = await getAttendanceData(options[0].id);
          setAttendance(data);
          setSelectedId(options[0].id);
          setAutoLoaded(true);
        } catch (e: unknown) {
          console.error(e);
          setError("Failed to load attendance");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [options, allowSearch, autoLoaded]);

  /* ------------------------ Manual fetch (Admin/Teacher/Guardian with multiple) ------------------------ */
  async function view(): Promise<void> {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const data: AttendancePayload = await getAttendanceData(selectedId);
      setAttendance(data);
    } catch (e: unknown) {
      console.error(e);
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------ RENDER ------------------------------ */
  return (
    <div className="py-6">
      <div className="max-w-lg mx-auto space-y-8">
        <Card className="shadow-lg rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <CheckCircle2 className="mr-2 h-6 w-6 text-indigo-600" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {allowSearch && (
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-700 font-medium">
                  Search Students
                </Label>
                <Input
                  id="search"
                  placeholder="Search students…"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    setSearch(e.target.value)
                  }
                  className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* If exactly one option (Student/Guardian), show as plain text */}
            {options.length === 1 && !allowSearch ? (
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
                    {options.map((o: Option) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show button when search/select is required (Admin/Teacher/Guardian with multiple) */}
            {(allowSearch || options.length > 1) && (
              <Button
                onClick={view}
                disabled={!selectedId || loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "View Attendance"
                )}
              </Button>
            )}

            {error && (
              <div className="flex items-center justify-center text-red-600">
                <AlertCircle className="mr-2 h-5 w-5" />
                {error}
              </div>
            )}

            {attendance && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-semibold text-center">
                  Attendance (past 30 days) for {attendance.studentName}
                </h2>
                <p className="text-center text-gray-700">
                  Rate: {attendance.attendanceRate}% ({attendance.presentCount}{" "}
                  of {attendance.total})
                </p>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Lesson</TableHead>
                        <TableHead className="text-center">Present</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.sessions.map((s: SessionRow) => (
                        <TableRow
                          key={s.key}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            {format(new Date(s.date), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(s.date), "HH:mm")}
                          </TableCell>
                          <TableCell>{s.title}</TableCell>
                          <TableCell className="text-center">
                            {s.present ? (
                              <CheckCircle2 className="inline h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="inline h-5 w-5 text-red-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {loading && !attendance && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
