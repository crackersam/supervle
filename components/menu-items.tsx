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
        <Link href="/restricted/schedules" className="hover:underline">
          Schedules
        </Link>
      )}
      {(session?.user?.role === "TEACHER" ||
        session?.user?.role === "STUDENT") && (
        <Link href="/schedule" className="hover:underline">
          My Schedule
        </Link>
      )}
    </div>
  );
};

export default MenuItems;
