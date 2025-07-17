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
import { deleteEnrollment, deleteLesson, enrolUser } from "./actions";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Lesson {
  id: number;
  createdAt: Date;
  title: string;
  start: Date;
  end: Date;
  rrule: string | null;
  users: { userId: string; lessonId: number; enrolledAt: Date }[];
}

interface User {
  id: string;
  forename: string;
  surname: string;
}

interface LessonsProps {
  lessons: Lesson[];
  users: User[];
}

const Lessons: React.FC<LessonsProps> = ({ lessons, users }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.forename} ${user.surname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const getUntilDate = (rruleString: string): Date | null => {
    try {
      const rule = RRule.fromString(rruleString);
      return rule.options.until ?? null;
    } catch {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl">Manage Lessons</CardTitle>
            <CardDescription>
              View and manage all lessons in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Until</TableHead>
                  <TableHead>Users Enrolled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{lesson.title}</TableCell>
                    <TableCell>
                      {format(new Date(lesson.start), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(lesson.end), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      {lesson.rrule
                        ? format(
                            getUntilDate(lesson.rrule) ?? new Date(),
                            "yyyy-MM-dd HH:mm"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {lesson.users.length > 0 ? (
                        <Dialog>
                          <DialogTrigger className="hover:underline cursor-pointer">
                            {lesson.users.length} user(s) enrolled
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Users Enrolled</DialogTitle>
                              <DialogDescription>
                                List of users enrolled in this lesson.
                              </DialogDescription>
                            </DialogHeader>
                            <ul className="space-y-2">
                              {lesson.users.map((enrollment) => {
                                const user = users.find(
                                  (u) => u.id === enrollment.userId
                                );
                                return (
                                  <li
                                    key={enrollment.userId}
                                    className="flex justify-between items-center"
                                  >
                                    <span>
                                      {user?.forename} {user?.surname} —
                                      Enrolled at{" "}
                                      {format(
                                        new Date(enrollment.enrolledAt),
                                        "yyyy-MM-dd HH:mm"
                                      )}
                                    </span>
                                    <Button
                                      variant={"destructive"}
                                      onClick={async () => {
                                        const res = await deleteEnrollment(
                                          lesson.id.toString(),
                                          enrollment.userId
                                        );
                                        if (res.success) {
                                          toast.success(res.message);
                                        } else {
                                          toast.error(res.message);
                                        }
                                      }}
                                      size={"sm"}
                                    >
                                      Unenroll
                                    </Button>
                                  </li>
                                );
                              })}
                            </ul>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        "No users enrolled"
                      )}
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete Lesson</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. It will permanently
                              delete the lesson.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => deleteLesson(lesson.id)}
                              >
                                Delete
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="default">Enroll User</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enroll a User</DialogTitle>
                            <DialogDescription>
                              Select a user to enroll in this lesson.
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
                            <input
                              type="hidden"
                              name="lessonId"
                              value={lesson.id}
                            />
                            <div className="grid gap-4">
                              <label htmlFor="userSearch" className="block">
                                Search User:
                              </label>
                              <Input
                                id="userSearch"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Type forename or surname"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Lessons;
