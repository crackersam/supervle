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
    <div className="flex h-screen overflow-hidden">
      <aside className="w-fit bg-gray-100 h-full p-1 overflow-auto">
        <Menu />
      </aside>
      <main className="flex-1 h-full overflow-auto">{children}</main>
    </div>
  );
};

export default LoggedInLayout;
