import Link from "next/link";
import React from "react";

const MenuItems = () => {
  return (
    <div className="flex flex-col gap-2 px-4">
      <Link href="/admin/lessons" className="hover:underline">
        Lessons
      </Link>
      <Link href="/admin/permit-users" className="hover:underline">
        Permit Users
      </Link>
      <Link href="/restricted/schedules" className="hover:underline">
        Schedules
      </Link>
    </div>
  );
};

export default MenuItems;
