import { auth } from "@/auth";
import Link from "next/link";
import React from "react";

const MenuItems = async () => {
  const session = await auth();
  return (
    <div className="flex flex-col gap-2 px-4">
      {session?.user?.role === "ADMIN" && (
        <>
          <Link href="/admin/lessons" className="hover:underline">
            Lessons
          </Link>
          <Link href="/admin/permit-users" className="hover:underline">
            Permit Users
          </Link>
        </>
      )}
      {(session?.user?.role === "TEACHER" ||
        session?.user?.role === "ADMIN") && (
        <>
          <Link href="/restricted/schedules" className="hover:underline">
            Schedules
          </Link>
          <Link href={"/restricted/registers"} className="hover:underline">
            Registers
          </Link>
          <Link href="/attendance" className="hover:underline">
            Attendance
          </Link>
        </>
      )}
      {(session?.user?.role === "TEACHER" ||
        session?.user?.role === "STUDENT") && (
        <Link href="/schedule" className="hover:underline">
          Schedule
        </Link>
      )}
      {session?.user?.role === "STUDENT" && (
        <Link href="/attendance" className="hover:underline">
          Attendance
        </Link>
      )}
      {session?.user?.role === "GUARDIAN" && (
        <>
          <Link href="/guardian/schedule" className="hover:underline">
            Schedule
          </Link>
          <Link href="/attendance" className="hover:underline">
            Attendance
          </Link>
        </>
      )}
    </div>
  );
};

export default MenuItems;
