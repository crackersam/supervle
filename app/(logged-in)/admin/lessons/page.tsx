import { prisma } from "@/prisma-singleton";
import React from "react";
import Lessons from "./lessons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddEventForm from "@/components/AddEventForm";

const LessonsPage = async () => {
  const lessons = await prisma.lesson.findMany({
    include: {
      users: true,
    },
  });
  const users = await prisma.user.findMany({
    where: { role: { in: ["STUDENT", "TEACHER"] } },
  });

  return (
    <>
      <Lessons lessons={lessons} users={users} />{" "}
      <Dialog>
        <DialogTrigger asChild>
          <Button className=" w-52">Schedule lesson</Button>
        </DialogTrigger>
        <DialogContent
          className="w-auto"
          aria-describedby="modal to schedule a lecture"
        >
          <DialogHeader>
            <DialogTitle>Schedule lesson</DialogTitle>
          </DialogHeader>

          <AddEventForm />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LessonsPage;
