// components/ClientAttendance.tsx
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

  // Live search for admin / teacher
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

  // Ensure selectedId always valid when options change
  useEffect(() => {
    if (options.length && !options.find((o) => o.id === selectedId)) {
      setSelectedId(options[0].id);
    }
  }, [options, selectedId]);

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

  return (
    <div className="space-y-4">
      {allowSearch && (
        <input
          className="w-full rounded border p-2"
          placeholder="Search students…"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            setSearch(e.target.value)
          }
        />
      )}

      <select
        className="block w-full rounded border p-2"
        value={selectedId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>): void =>
          setSelectedId(e.target.value)
        }
      >
        {options.map((o: Option) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>

      <button
        onClick={view}
        disabled={!selectedId}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        View Attendance
      </button>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {attendance && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Attendance for {attendance.studentName}
          </h2>
          <p>
            Rate: {attendance.attendanceRate}% ({attendance.presentCount} of{" "}
            {attendance.total})
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.sessions.map((s: SessionRow) => (
                <TableRow key={s.key}>
                  <TableCell>
                    {format(new Date(s.date), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>{format(new Date(s.date), "HH:mm")}</TableCell>
                  <TableCell>{s.title}</TableCell>
                  <TableCell className="text-center">
                    {s.present ? "✅" : "❌"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
