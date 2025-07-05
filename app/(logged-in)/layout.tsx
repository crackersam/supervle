import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const LoggedInLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (session?.user?.id) {
    return <>{children}</>;
  } else {
    redirect("/login");
  }
};

export default LoggedInLayout;
