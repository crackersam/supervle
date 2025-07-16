// app/lessons/[id]/page.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar,
  FileText,
  Users,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { revalidatePath } from "next/cache";

interface Params {
  params: { id: string };
}

const LessonDetailsPage = async ({ params }: Params) => {
  const session = await auth();
  if (!session || !session.user) {
    return notFound();
  }

  const lessonId = parseInt(params.id, 10);
  if (isNaN(lessonId)) {
    return notFound();
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      users: {
        include: {
          user: {
            select: { id: true, forename: true, surname: true, role: true },
          },
        },
      },
      occurrences: {
        include: {
          files: true,
          homework: true,
        },
        orderBy: { start: "asc" },
      },
    },
  });

  if (!lesson) {
    return notFound();
  }

  // Check if user has access (enrolled or admin/teacher)
  const isEnrolled = lesson.users.some(
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
    hasAccess = lesson.users.some((enrollment) =>
      studentIds.includes(enrollment.userId)
    );
  }

  if (!hasAccess) {
    return notFound();
  }

  // Filter occurrences to weekdays only (Monday=1 to Friday=5)
  const weekdayOccurrences = lesson.occurrences.filter((occ) => {
    const day = new Date(occ.start).getDay();
    return day >= 1 && day <= 5;
  });

  const deleteFileAction = async (formData: FormData) => {
    "use server";
    const fileId = parseInt(formData.get("fileId") as string, 10);
    if (isNaN(fileId)) return;

    await prisma.file.delete({ where: { id: fileId } });
    revalidatePath(`/lessons/${lessonId}`);
  };

  const deleteHomeworkAction = async (formData: FormData) => {
    "use server";
    const homeworkId = parseInt(formData.get("homeworkId") as string, 10);
    if (isNaN(homeworkId)) return;

    await prisma.homework.delete({ where: { id: homeworkId } });
    revalidatePath(`/lessons/${lessonId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-4 hover:bg-indigo-100 transition-colors"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        {/* Lesson Header */}
        <Card className="overflow-hidden shadow-xl rounded-2xl border border-indigo-200">
          <CardHeader className="p-8">
            <CardTitle className="text-4xl font-bold text-gray-900">
              {lesson.title}
            </CardTitle>
            <CardDescription className="text-gray-900 text-lg mt-2">
              Starts: {format(new Date(lesson.start), "MMMM d, yyyy - h:mm a")}{" "}
              | Ends: {format(new Date(lesson.end), "h:mm a")}
              {lesson.rrule ? " (Recurring)" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-gray-700">
            <p>
              Explore weekday occurrences, associated files, homework, and
              enrolled users below.
            </p>
          </CardContent>
        </Card>

        {/* Tabs for Sections */}
        <Tabs defaultValue="occurrences" className="space-y-4">
          <Card className="shadow-md rounded-xl border border-gray-200 p-2 flex justify-center flex-wrap gap-2">
            <TabsList className="bg-transparent p-0 flex-wrap h-auto">
              <TabsTrigger
                value="occurrences"
                className="flex-shrink-0 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Occurrences
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="flex-shrink-0 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2"
              >
                <FileText className="mr-2 h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger
                value="homework"
                className="flex-shrink-0 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Homework
              </TabsTrigger>
              <TabsTrigger
                value="enrolled"
                className="flex-shrink-0 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-4 py-2"
              >
                <Users className="mr-2 h-4 w-4" />
                Enrolled Users
              </TabsTrigger>
            </TabsList>
          </Card>

          {/* Occurrences Tab */}
          <TabsContent value="occurrences">
            <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Lesson Occurrences</CardTitle>
                <CardDescription>
                  Weekday scheduled instances of this lesson.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekdayOccurrences.map((occ) => (
                      <TableRow
                        key={occ.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          {format(new Date(occ.start), "MMMM d, yyyy - h:mm a")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(occ.end), "h:mm a")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            asChild
                            className="hover:text-indigo-600"
                          >
                            <Link
                              href={`/lessons/${lesson.id}/occurrence/${occ.id}`}
                            >
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {weekdayOccurrences.length === 0 && (
                  <p className="text-center text-gray-600 mt-4">
                    No weekday occurrences scheduled.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Associated Files</CardTitle>
                <CardDescription>
                  Files uploaded for weekday occurrences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Filename</TableHead>
                      <TableHead>Occurrence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekdayOccurrences.flatMap((occ) =>
                      occ.files.map((file) => (
                        <TableRow
                          key={file.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>{file.filename}</TableCell>
                          <TableCell>
                            {format(new Date(occ.start), "MMMM d, yyyy")}
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
                      ))
                    )}
                  </TableBody>
                </Table>
                {weekdayOccurrences.every((occ) => occ.files.length === 0) && (
                  <p className="text-center text-gray-600 mt-4">
                    No files available for weekday occurrences.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework">
            <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Assigned Homework</CardTitle>
                <CardDescription>
                  Homework for weekday occurrences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Due Date</TableHead>
                      <TableHead>Occurrence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekdayOccurrences.flatMap((occ) =>
                      occ.homework.map((hw) => (
                        <TableRow
                          key={hw.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell>
                            {format(new Date(hw.dueDate), "MMMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(occ.start), "MMMM d, yyyy")}
                          </TableCell>
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
                                      Are you sure you want to delete this
                                      homework?
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
                      ))
                    )}
                  </TableBody>
                </Table>
                {weekdayOccurrences.every(
                  (occ) => occ.homework.length === 0
                ) && (
                  <p className="text-center text-gray-600 mt-4">
                    No homework assigned for weekday occurrences.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enrolled Users Tab */}
          <TabsContent value="enrolled">
            <Card className="shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Enrolled Users</CardTitle>
                <CardDescription>
                  Users enrolled in this lesson.
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
                    {lesson.users.map((enrollment) => (
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
                            "MMMM d, yyyy"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {lesson.users.length === 0 && (
                  <p className="text-center text-gray-600 mt-4">
                    No users enrolled.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LessonDetailsPage;
