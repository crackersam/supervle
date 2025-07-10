import { auth } from "@/auth";
import { notFound } from "next/navigation";
import React from "react";

const RestrictedLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await auth();

  if (session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER") {
    return <>{children}</>;
  } else {
    return notFound();
  }
};

export default RestrictedLayout;
