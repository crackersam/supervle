import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const LoggedOutLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/");
  } else {
    return <>{children}</>;
  }
};

export default LoggedOutLayout;
