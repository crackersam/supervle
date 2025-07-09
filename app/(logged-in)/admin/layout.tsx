import { auth } from "@/auth";
import { notFound } from "next/navigation";
import React from "react";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    return <>{children}</>;
  } else {
    return notFound();
  }
};

export default AdminLayout;
