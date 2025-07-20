"use client";

import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  roles: string[];
  category: string;
}

const menuItems: MenuItem[] = [
  {
    path: "/admin/lessons",
    label: "Lessons",
    roles: ["ADMIN"],
    category: "Admin Tools",
  },
  {
    path: "/admin/permit-users",
    label: "Permit Users",
    roles: ["ADMIN"],
    category: "Admin Tools",
  },
  {
    path: "/admin/assign-guardian",
    label: "Assign Guardian",
    roles: ["ADMIN"],
    category: "Admin Tools",
  },
  {
    path: "/admin/announcement",
    label: "Announcements",
    roles: ["ADMIN"],
    category: "Admin Tools",
  },
  {
    path: "/restricted/schedules",
    label: "Schedules",
    roles: ["TEACHER", "ADMIN"],
    category: "Teaching Tools",
  },
  {
    path: "/restricted/registers",
    label: "Registers",
    roles: ["TEACHER", "ADMIN"],
    category: "Teaching Tools",
  },
  {
    path: "/attendance",
    label: "Attendance",
    roles: ["TEACHER", "ADMIN"],
    category: "Teaching Tools",
  },
  {
    path: "/restricted/upload",
    label: "Upload Content",
    roles: ["TEACHER", "ADMIN"],
    category: "Teaching Tools",
  },
  {
    path: "/lessons",
    label: "Lessons",
    roles: ["TEACHER", "ADMIN"],
    category: "Teaching Tools",
  },
  {
    path: "/restricted/upload-homework",
    label: "Assign Homework",
    roles: ["TEACHER", "ADMIN"],
    category: "Teaching Tools",
  },
  {
    path: "/schedule",
    label: "Schedule",
    roles: ["TEACHER", "STUDENT", "GUARDIAN"],
    category: "Personal Tools",
  },
  {
    path: "/homework",
    label: "Homework",
    roles: ["TEACHER", "STUDENT", "GUARDIAN"],
    category: "Personal Tools",
  },
  {
    path: "/attendance",
    label: "Attendance",
    roles: ["STUDENT", "GUARDIAN"],
    category: "Personal Tools",
  },
  {
    path: "/lessons",
    label: "Lessons",
    roles: ["STUDENT", "GUARDIAN"],
    category: "Personal Tools",
  },
  {
    path: "/",
    label: "Dashboard",
    roles: ["STUDENT", "TEACHER", "GUARDIAN", "ADMIN"],
    category: "Personal Tools",
  },
];

const MenuItems = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-center text-gray-600">Loading menu...</div>;
  }

  const role = session?.user?.role;

  if (!role) {
    return (
      <div className="text-center text-gray-600">No menu items available.</div>
    );
  }

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  const groupedItems = filteredItems.reduce(
    (acc: Record<string, MenuItem[]>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-4 px-4 h-full">
      <div className="flex-grow">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h3 className="font-semibold text-lg mb-2">{category}</h3>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button at Bottom */}
      <Button
        variant="destructive"
        className="w-full mt-auto bg-red-600 hover:bg-red-700 flex items-center justify-center"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log Out
      </Button>
    </div>
  );
};

export default MenuItems;
