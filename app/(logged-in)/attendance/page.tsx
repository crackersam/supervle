// app/attendance/page.tsx
import React from "react";
import dynamic from "next/dynamic";
import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import type { Option } from "./actions";

// Dynamically load the purely‑client component
const ClientAttendance = dynamic(() => import("./client-attendance"));

/* ------------------------------------------------------------------
   Page component (Server Component)
-------------------------------------------------------------------*/
export default async function AttendancePage() {
  const session = await auth();
  if (!session) return <p>Not authenticated.</p>;
  const role = session.user?.role;

  // Pre‑load dropdown for Student / Guardian roles
  let initialOptions: Option[] = [];

  if (role === "STUDENT") {
    const u = await prisma.user.findUnique({
      where: { id: session.user?.id },
      select: { id: true, forename: true, surname: true },
    });
    if (u) initialOptions = [{ id: u.id, label: `${u.forename} ${u.surname}` }];
  } else if (role === "GUARDIAN") {
    const g = await prisma.user.findUnique({
      where: { id: session.user?.id },
      include: {
        guardians: {
          include: {
            student: {
              select: { id: true, forename: true, surname: true },
            },
          },
        },
      },
    });
    initialOptions =
      g?.guardians.map((sg) => ({
        id: sg.student.id,
        label: `${sg.student.forename} ${sg.student.surname}`,
      })) || [];
  }

  return (
    <>
      <ClientAttendance
        initialOptions={initialOptions}
        allowSearch={role === "ADMIN" || role === "TEACHER"}
      />
    </>
  );
}
