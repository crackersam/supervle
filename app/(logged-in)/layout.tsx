import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { JSX } from "react";
import LoggedInLayoutClient from "./logged-in-layout-client";
import { SessionProvider } from "next-auth/react";

interface LoggedInLayoutProps {
  children: React.ReactNode;
}

const LoggedInLayout = async ({
  children,
}: LoggedInLayoutProps): Promise<JSX.Element> => {
  const session = await auth();

  // If no valid session, redirect immediately
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Otherwise render the logged-in layout with client-side responsiveness
  return (
    <SessionProvider session={session}>
      <LoggedInLayoutClient session={session}>{children}</LoggedInLayoutClient>;
    </SessionProvider>
  );
};

export default LoggedInLayout;
