import { prisma } from "@/prisma-singleton";
import UploadUI from "./UploadUI";
import { RRule } from "rrule";
import { addMonths } from "date-fns";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UploadPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-8">
          <Card className="shadow-lg rounded-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-red-600">
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700">
                Only teachers and admins can access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { id: userId, role } = session.user;

  // Define where clause based on role
  const whereClause = role === "ADMIN" ? {} : { users: { some: { userId } } };

  // 1. Sync occurrences for relevant lessons (next 6 months or single event)
  const lessonsRaw = await prisma.lesson.findMany({
    where: whereClause,
    select: { id: true, start: true, end: true, rrule: true },
  });

  await Promise.all(
    lessonsRaw.map(async (lesson) => {
      const dates = lesson.rrule
        ? RRule.fromString(lesson.rrule).between(
            new Date(),
            addMonths(new Date(), 6),
            true
          )
        : [lesson.start];
      const durationMs = lesson.end.getTime() - lesson.start.getTime();
      await Promise.all(
        dates.map((dt) =>
          prisma.lessonOccurrence.upsert({
            where: { lessonId_start: { lessonId: lesson.id, start: dt } },
            create: {
              lessonId: lesson.id,
              start: dt,
              end: new Date(dt.getTime() + durationMs),
            },
            update: {},
          })
        )
      );
    })
  );

  // 2. Fetch relevant lessons with their persisted occurrences
  const lessons = await prisma.lesson.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      occurrences: {
        orderBy: { start: "asc" },
        select: { id: true, start: true, end: true },
      },
    },
  });

  return (
    <SessionProvider session={session}>
      <UploadUI lessons={lessons} />
    </SessionProvider>
  );
}
