// app/attendance/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";

import AttendanceViewer from "./attendance-viewer";

// Server Action to handle student selection and redirect
async function selectStudent(formData: FormData) {
  "use server";
  const userId = formData.get("userId");
  if (typeof userId === "string") {
    redirect(`/attendance?studentId=${encodeURIComponent(userId)}`);
  }
}

export default async function AttendancePage(props: {
  searchParams: Promise<{ studentId?: string; search?: string }>;
}) {
  // Await searchParams for Next.js 15
  const { studentId, search: searchTerm = "" } = await props.searchParams;
  const session = await auth();
  if (!session) {
    return <p>Not authenticated.</p>;
  }
  const role = session.user?.role;

  // Preload options based on role and searchTerm
  let options: { id: string; label: string }[] = [];
  if (role === "STUDENT") {
    const u = await prisma.user.findUnique({
      where: { id: session.user?.id },
      select: { id: true, forename: true, surname: true },
    });
    if (u) options = [{ id: u.id, label: `${u.forename} ${u.surname}` }];
  } else if (role === "GUARDIAN") {
    const g = await prisma.user.findUnique({
      where: { id: session.user?.id },
      include: {
        students: {
          include: {
            student: { select: { id: true, forename: true, surname: true } },
          },
        },
      },
    });
    options =
      g?.students.map((s) => ({
        id: s.student.id,
        label: `${s.student.forename} ${s.student.surname}`,
      })) || [];
  } else if (role === "ADMIN" || role === "TEACHER") {
    if (searchTerm.length >= 3) {
      const users = await prisma.user.findMany({
        where: {
          role: "STUDENT",
          OR: [
            { forename: { contains: searchTerm, mode: "insensitive" } },
            { surname: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: { id: true, forename: true, surname: true },
        take: 20,
      });
      options = users.map((u) => ({
        id: u.id,
        label: `${u.forename} ${u.surname}`,
      }));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">View Attendance</h1>

      {/* Search form for Admin/Teacher */}
      {(role === "ADMIN" || role === "TEACHER") && (
        <form method="get" className="flex space-x-2 mb-4">
          <input
            name="search"
            defaultValue={searchTerm}
            placeholder="Search students (min 3 chars)"
            className="flex-1 rounded border p-2"
          />
          <button type="submit" className="px-4 py-2 rounded bg-gray-200">
            Search
          </button>
        </form>
      )}

      {/* Selection form using server action */}
      <form action={selectStudent} className="space-y-4 mb-6">
        <select
          name="userId"
          defaultValue={options[0]?.id || ""}
          className="block w-full rounded border p-2"
        >
          <option value="">Select a student</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="mt-2 px-4 py-2 rounded bg-blue-600 text-white"
          disabled={options.length === 0}
        >
          View Attendance
        </button>
      </form>

      {/* Render attendance if a studentId is present */}
      {studentId ? (
        <AttendanceViewer userId={studentId} />
      ) : (
        <p>Select a student to view attendance.</p>
      )}
    </div>
  );
}
