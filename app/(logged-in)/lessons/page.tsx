import React from "react";
import DisplayLesson from "./DisplayLesson";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
const LessonPage = async () => {
  const session = await auth();
  return (
    <div>
      <SessionProvider session={session}>
        <DisplayLesson />
      </SessionProvider>
    </div>
  );
};

export default LessonPage;
