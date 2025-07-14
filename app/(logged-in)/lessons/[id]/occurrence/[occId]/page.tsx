// app/lessons/[id]/occurrence/[occId]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/prisma-singleton";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import Link from "next/link";
import {
  Trash2,
  Download,
  FileText,
  BookOpen,
  ArrowLeft,
  Users,
} from "lucide-react";
import { revalidatePath } from "next/cache";

interface Params {
  params: Promise<{ id: string; occId: string }>;
}

const OccurrenceDetailsPage = async ({ params }: Params) => {
  const resolvedParams = await params;
  const session = await auth();
  if (!session || !session.user) {
    return notFound();
  }

  const lessonId = parseInt(resolvedParams.id, 10);
  const occId = parseInt(resolvedParams.occId, 10);
  if (isNaN(lessonId) || isNaN(occId)) {
    return notFound();
  }

  const occurrence = await prisma.lessonOccurrence.findUnique({
    where: { id: occId },
    include: {
      lesson: {
        include: {
          users: {
            include: {
              user: {
                select: { id: true, forename: true, surname: true, role: true },
              },
            },
          },
        },
      },
      files: true,
      homework: true,
    },
  });

  if (!occurrence || occurrence.lessonId !== lessonId) {
    return notFound();
  }

  // Check access based on enrollment in the parent lesson
  const isEnrolled = occurrence.lesson.users.some(
    (enrollment) => enrollment.userId === session.user?.id
  );
  const isAdminOrTeacher =
    session.user.role === "ADMIN" || session.user.role === "TEACHER";
  const isGuardian = session.user.role === "GUARDIAN";

  let hasAccess = isEnrolled || isAdminOrTeacher;
  if (isGuardian) {
    const studentRelations = await prisma.studentGuardian.findMany({
      where: { guardianId: session.user.id },
      select: { studentId: true },
    });
    const studentIds = studentRelations.map((r) => r.studentId);
    hasAccess = occurrence.lesson.users.some((enrollment) =>
      studentIds.includes(enrollment.userId)
    );
  }

  if (!hasAccess) {
    return notFound();
  }

  const deleteFileAction = async (formData: FormData) => {
    "use server";
    const fileId = parseInt(formData.get("fileId") as string, 10);
    if (isNaN(fileId)) return;

    await prisma.file.delete({ where: { id: fileId } });
    revalidatePath(`/lessons/${lessonId}/occurrence/${occId}`);
  };

  const deleteHomeworkAction = async (formData: FormData) => {
    "use server";
    const homeworkId = parseInt(formData.get("homeworkId") as string, 10);
    if (isNaN(homeworkId)) return;

    await prisma.homework.delete({ where: { id: homeworkId } });
    revalidatePath(`/lessons/${lessonId}/occurrence/${occId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-4 hover:bg-indigo-100 transition-colors"
        >
          <Link href={`/lessons/${occurrence.lesson.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lesson
          </Link>
        </Button>

        {/* Occurrence Header */}
        <Card className="overflow-hidden shadow-xl rounded-2xl border border-indigo-200">
          <CardHeader className="p-8">
            <CardTitle className="text-4xl font-bold text-gray-900">
              {occurrence.lesson.title} - Occurrence
            </CardTitle>
            <CardDescription className="text-gray-900 text-lg mt-2">
              Date: {format(new Date(occurrence.start), "MMMM d, yyyy")} | Time:{" "}
              {format(new Date(occurrence.start), "h:mm a")} -{" "}
              {format(new Date(occurrence.end), "h:mm a")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-gray-700">
            <p>
              View files, homework, and enrolled users for this specific
              occurrence.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {/* Files Section */}
          <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <FileText className="mr-2 h-6 w-6 text-indigo-600" />
                Files
              </CardTitle>
              <CardDescription>
                Uploaded files for this occurrence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Filename</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occurrence.files.map((file) => (
                    <TableRow
                      key={file.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>{file.filename}</TableCell>
                      <TableCell>
                        {format(
                          new Date(file.createdAt),
                          "MMMM d, yyyy - h:mm a"
                        )}
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="ghost"
                          asChild
                          className="hover:text-indigo-600"
                        >
                          <Link href={`/uploads/${file.filename}`} download>
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Link>
                        </Button>
                        {isAdminOrTeacher && (
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
                                <AlertDialogTitle className="text-lg">
                                  Confirm Deletion
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this file?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-gray-100">
                                  Cancel
                                </AlertDialogCancel>
                                <form action={deleteFileAction}>
                                  <input
                                    type="hidden"
                                    name="fileId"
                                    value={file.id}
                                  />
                                  <AlertDialogAction
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700"
                                  >
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
              {occurrence.files.length === 0 && (
                <p className="text-center text-gray-600 mt-4">
                  No files uploaded.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Homework Section */}
          <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-indigo-600" />
                Homework
              </CardTitle>
              <CardDescription>
                Assigned homework for this occurrence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Due Date</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occurrence.homework.map((hw) => (
                    <TableRow
                      key={hw.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        {format(new Date(hw.dueDate), "MMMM d, yyyy - h:mm a")}
                      </TableCell>
                      <TableCell>{hw.filePath.split("/").pop()}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="ghost"
                          asChild
                          className="hover:text-indigo-600"
                        >
                          <Link href={hw.filePath} download>
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Link>
                        </Button>
                        {isAdminOrTeacher && (
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
                                <AlertDialogTitle className="text-lg">
                                  Confirm Deletion
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this homework?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-gray-100">
                                  Cancel
                                </AlertDialogCancel>
                                <form action={deleteHomeworkAction}>
                                  <input
                                    type="hidden"
                                    name="homeworkId"
                                    value={hw.id}
                                  />
                                  <AlertDialogAction
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700"
                                  >
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
              {occurrence.homework.length === 0 && (
                <p className="text-center text-gray-600 mt-4">
                  No homework assigned.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Enrolled Users Section (from parent lesson) */}
          <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Users className="mr-2 h-6 w-6 text-indigo-600" />
                Enrolled Users
              </CardTitle>
              <CardDescription>
                Users enrolled in the parent lesson.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Enrolled At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occurrence.lesson.users.map((enrollment) => (
                    <TableRow
                      key={enrollment.userId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        {enrollment.user.forename} {enrollment.user.surname}
                      </TableCell>
                      <TableCell>{enrollment.user.role}</TableCell>
                      <TableCell>
                        {format(
                          new Date(enrollment.enrolledAt),
                          "MMMM d, yyyy - h:mm a"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {occurrence.lesson.users.length === 0 && (
                <p className="text-center text-gray-600 mt-4">
                  No users enrolled.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OccurrenceDetailsPage;
