"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { RRule } from "rrule";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteLesson, enrolUser } from "./actions";
import { toast } from "sonner";

const Lessons = ({
  lessons,
  users,
}: {
  lessons: ({
    users: { userId: string; lessonId: number; enrolledAt: Date }[];
  } & {
    id: number;
    createdAt: Date;
    title: string;
    start: Date;
    end: Date;
    rrule: string | null;
  })[];
  users: { id: string; forename: string; surname: string }[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users by matching the search term against full name
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.forename} ${user.surname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });
  function getUntilDate(rruleString: string): Date | null {
    const rule = RRule.fromString(rruleString);
    // .options.until is already a JS Date (in UTC)
    return rule.options.until ?? null;
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lessons</h1>
      <Table className="min-w-full bg-white border border-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2 border-b">Title</TableHead>
            <TableHead className="px-4 py-2 border-b">Start</TableHead>
            <TableHead className="px-4 py-2 border-b">End</TableHead>
            <TableHead className="px-4 py-2 border-b">Until</TableHead>
            <TableHead className="px-4 py-2 border-b">Users Enrolled</TableHead>
            <TableHead className="px-4 py-2 border-b">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell className="px-4 py-2 border-b">
                {lesson.title}
              </TableCell>
              <TableCell className="px-4 py-2 border-b">
                {format(new Date(lesson.start), "yyyy-MM-dd HH:mm")}
              </TableCell>
              <TableCell className="px-4 py-2 border-b">
                {format(new Date(lesson.end), "yyyy-MM-dd HH:mm")}
              </TableCell>
              <TableCell className="px-4 py-2 border-b">
                {format(
                  getUntilDate(lesson.rrule ?? "") ?? new Date(),
                  "yyyy-MM-dd HH:mm"
                )}
              </TableCell>
              <TableCell className="px-4 py-2 border-b">
                {lesson.users.length > 0
                  ? lesson.users.length + " users enrolled"
                  : "No users enrolled"}
              </TableCell>
              <TableCell className="px-4 py-2 border-b">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="ml-2">
                      Delete Lesson
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the lesson and remove the data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          type="submit"
                          variant={"destructive"}
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            deleteLesson(lesson.id);
                          }}
                        >
                          Delete
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="ml-2">
                      Enroll User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      action={async (formData) => {
                        const result = await enrolUser(formData);
                        if (result.success) {
                          toast.success(result.message);
                        } else {
                          toast.error(result.message);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="grid gap-4">
                        <input
                          type="hidden"
                          name="lessonId"
                          value={lesson.id}
                        />
                        <label htmlFor="userSearch" className="block">
                          Search User to Enroll:
                        </label>
                        <input
                          type="text"
                          id="userSearch"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Type forename or surname"
                          className="border rounded p-2 w-full"
                        />

                        <select
                          name="userId"
                          id="userId"
                          className="border rounded p-2 w-full"
                          required
                        >
                          {filteredUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.forename} {user.surname}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button type="submit" className="w-full">
                        Enroll User
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Lessons;
