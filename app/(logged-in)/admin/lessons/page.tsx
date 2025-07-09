import { prisma } from "@/prisma-singleton";
import React from "react";
import Lessons from "./lessons";

const LessonsPage = async () => {
  const lessons = await prisma.lesson.findMany({
    include: {
      users: true,
    },
  });

  return <Lessons lessons={lessons} />;
};

export default LessonsPage;
