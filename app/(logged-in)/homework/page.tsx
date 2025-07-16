// app/homework/page.tsx
import Link from "next/link";
import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Download, Trash2, BookOpen } from "lucide-react";
import ClientGuardianHomework from "./ClientGuardianHomework";

export default async function HomeworkListPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }
  const { id: userId, role } = session.user;

  if (role === "GUARDIAN") {
    const studentRelations = await prisma.studentGuardian.findMany({
      where: { guardianId: userId },
      select: {
        student: { select: { id: true, forename: true, surname: true } },
      },
    });
    const students: { id: string; label: string }[] = studentRelations.map(
      (r) => ({
        id: r.student.id,
        label: `${r.student.forename} ${r.student.surname}`,
      })
    );
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="shadow-lg rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center">
                <BookOpen className="mr-2 h-6 w-6 text-indigo-600" />
                Assigned Homework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientGuardianHomework initialStudents={students} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } else {
    const whereFilter = {
      lessonOccurrence: {
        lesson: {
          users: {
            some: { userId },
          },
        },
      },
    };

    const homeworkItems = await prisma.homework.findMany({
      where: whereFilter,
      include: {
        lessonOccurrence: {
          include: { lesson: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="shadow-lg rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center">
                <BookOpen className="mr-2 h-6 w-6 text-indigo-600" />
                Assigned Homework
              </CardTitle>
            </CardHeader>
            <CardContent>
              {homeworkItems.length === 0 ? (
                <p className="text-center text-gray-600">
                  No homework assigned yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Lesson</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {homeworkItems.map((hw) => (
                        <TableRow
                          key={hw.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {hw.lessonOccurrence.lesson.title}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(hw.lessonOccurrence.start),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(hw.dueDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              asChild
                              className="hover:text-indigo-600"
                            >
                              <Link
                                href={hw.filePath}
                                target="_blank"
                                className="flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" /> Download
                              </Link>
                            </Button>
                            {(role === "TEACHER" || role === "ADMIN") && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="hover:bg-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirm Deletion
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      homework?
                                      <br />
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <form action={deleteHomework}>
                                      <input
                                        type="hidden"
                                        name="homeworkId"
                                        value={hw.id}
                                      />
                                      <AlertDialogAction type="submit">
                                        Delete
                                      </AlertDialogAction>
                                    </form>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

async function deleteHomework(formData: FormData) {
  "use server";
  const homeworkId = formData.get("homeworkId") as string;
  if (!homeworkId) {
    throw new Error("Missing homework ID");
  }

  await prisma.homework.delete({
    where: { id: parseInt(homeworkId, 10) },
  });

  revalidatePath("/homework");
  return;
}
