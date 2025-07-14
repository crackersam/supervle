import { auth } from "@/auth";
import Menu from "@/components/menu";
import { redirect } from "next/navigation";
import React, { JSX } from "react";

interface LoggedInLayoutProps {
  children: React.ReactNode;
}

const LoggedInLayout = async ({
  children,
}: LoggedInLayoutProps): Promise<JSX.Element> => {
  const session = await auth();

  // If no valid session, redirect immediately
  if (!session?.user?.id) {
    return redirect("/login");
  }

  // Otherwise render the logged‐in layout
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-200">
      <aside className="w-64 bg-white border-r border-gray-200 h-full p-4 overflow-auto shadow-lg">
        <Menu />
      </aside>
      <main className="flex-1 h-full overflow-auto">{children}</main>
    </div>
  );
};

export default LoggedInLayout;
