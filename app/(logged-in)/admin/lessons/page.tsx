import { prisma } from "@/prisma-singleton";
import React from "react";
import Lessons from "./lessons";

const LessonsPage = async () => {
  const lessons = await prisma.lesson.findMany({
    include: {
      users: true,
    },
  });
  const users = await prisma.user.findMany();

  return <Lessons lessons={lessons} users={users} />;
};

export default LessonsPage;
