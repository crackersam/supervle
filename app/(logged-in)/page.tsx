// app/home/page.tsx (updated Home component)
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, CheckCircle, Users } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/prisma-singleton";
import { format } from "date-fns";
import GuardianUpcomingLessons from "./GuardianUpcomingLessons";
import RightColumn from "./RightColumn";

const Home = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return (
      <div className="text-center py-10">
        Please log in to access the dashboard.
      </div>
    );
  }

  const { id: userId, forename, role } = session.user;

  let students: { id: string; forename: string }[] = [];
  let whereClause = {};
  if (role === "GUARDIAN") {
    const studentRelations = await prisma.studentGuardian.findMany({
      where: { guardianId: userId },
      include: { student: { select: { forename: true } } },
    });
    students = studentRelations.map((r) => ({
      id: r.studentId,
      forename: r.student.forename,
    }));
    const studentIds = students.map((s) => s.id);
    whereClause = {
      lesson: {
        users: { some: { userId: { in: studentIds } } },
      },
    };
  } else {
    whereClause = {
      lesson: {
        users: { some: { userId } },
      },
    };
  }

  const lessonSelect = {
    id: true,
    title: true,
  };
  if (role === "GUARDIAN") {
    // @ts-expect-error: 'users' is conditionally added based on the role being 'GUARDIAN'
    lessonSelect.users = {
      select: {
        userId: true,
      },
    };
  }

  const allUpcomingLessons = await prisma.lessonOccurrence.findMany({
    where: {
      start: { gte: new Date() },
      ...whereClause,
    },
    orderBy: { start: "asc" },
    include: { lesson: { select: lessonSelect } },
  });

  const upcomingLessons = allUpcomingLessons
    .filter((lesson) => {
      const day = new Date(lesson.start).getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    })
    .slice(0, 3);

  if (role === "STUDENT") {
    let weekdays: Date[] = [];
    const current = new Date();
    current.setDate(current.getDate() - 1);
    while (weekdays.length < 7) {
      const day = current.getDay();
      if (day >= 1 && day <= 5) {
        weekdays.push(new Date(current));
      }
      current.setDate(current.getDate() - 1);
    }
    weekdays = weekdays.reverse(); // from oldest to newest
    const minDate = weekdays[0];
    const attendances = await prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: minDate, lt: new Date() },
      },
      select: { present: true, date: true },
    });
    // group by day
    interface AttGroup {
      present: number;
      total: number;
    }
    const attMap = new Map<string, AttGroup>();
    for (const att of attendances) {
      const dayStr = format(att.date, "yyyy-MM-dd");
      let group = attMap.get(dayStr);
      if (!group) {
        group = { present: 0, total: 0 };
        attMap.set(dayStr, group);
      }
      group.total++;
      if (att.present) group.present++;
    }
  }

  const roleSpecificContent = {
    ADMIN: {
      title: "Admin Dashboard",
      description: "Manage users, lessons, and system settings.",
      actions: [
        { label: "Permit Users", href: "/admin/permit-users", icon: Users },
        { label: "Manage Lessons", href: "/admin/lessons", icon: Calendar },
        {
          label: "Assign Guardian",
          href: "/admin/assign-guardian",
          icon: Users,
        },
      ],
    },
    TEACHER: {
      title: "Teacher Dashboard",
      description: "Prepare lessons, assign homework, and track attendance.",
      actions: [
        { label: "Upload Content", href: "/restricted/upload", icon: BookOpen },
        {
          label: "Assign Homework",
          href: "/restricted/upload-homework",
          icon: CheckCircle,
        },
        { label: "View Registers", href: "/restricted/registers", icon: Users },
      ],
    },
    STUDENT: {
      title: "Student Dashboard",
      description: "View your schedule, homework, and download lesson assets.",
      actions: [
        { label: "View Homework", href: "/homework", icon: BookOpen },
        { label: "Check Attendance", href: "/attendance", icon: CheckCircle },
        { label: "Browse Lessons", href: "/lessons", icon: Calendar },
      ],
    },
    GUARDIAN: {
      title: "Guardian Dashboard",
      description: "Monitor your child's progress, schedule and attendance.",
      actions: [
        { label: "View Schedule", href: "/schedule", icon: Calendar },
        { label: "Check Attendance", href: "/attendance", icon: CheckCircle },
        { label: "Review Homework", href: "/homework", icon: BookOpen },
      ],
    },
  };

  const content = roleSpecificContent[
    role as keyof typeof roleSpecificContent
  ] || {
    title: "User Dashboard",
    description: "Welcome back! Explore your features.",
    actions: [],
  };

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday start
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const initialEvents = await prisma.lesson.findMany({
    where: {
      rrule: null,
      start: { gte: weekStart, lte: weekEnd },
    },
    select: { id: true, title: true, start: true, end: true },
    orderBy: { start: "desc" },
    take: 3,
  });

  const initialAnnouncements = await prisma.announcement.findMany({
    where: {
      date: { gte: weekStart, lte: weekEnd },
    },
    orderBy: { date: "desc" },
    take: 3,
  });

  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
  const teacherCount = await prisma.user.count({ where: { role: "TEACHER" } });
  const guardianCount = await prisma.user.count({
    where: { role: "GUARDIAN" },
  });
  const staffCount = await prisma.user.count({ where: { role: "ADMIN" } });

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const academicYear =
    currentMonth >= 9
      ? `${currentYear}/${(currentYear + 1) % 100}`
      : `${currentYear - 1}/${currentYear % 100}`;

  return (
    <div className="max-w-screen-xl mx-auto  py-12 grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="space-y-8 xl:col-span-2">
        {/* Stats Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-purple-100 rounded-2xl shadow-sm">
            <CardHeader className="text-center pb-0">
              <div className="inline-flex items-center w-fit px-3 py-1 rounded-full bg-white text-green-600 text-xs font-medium">
                {academicYear}
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <h2 className="text-3xl font-bold">
                {studentCount.toLocaleString()}
              </h2>
              <p className="text-sm text-gray-600">Students</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-100 rounded-2xl shadow-sm">
            <CardHeader className="text-center pb-0">
              <div className="inline-flex items-center px-3 py-1 w-fit rounded-full bg-white text-green-600 text-xs font-medium">
                {academicYear}
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <h2 className="text-3xl font-bold">
                {teacherCount.toLocaleString()}
              </h2>
              <p className="text-sm text-gray-600">Teachers</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-100 rounded-2xl shadow-sm">
            <CardHeader className="text-center pb-0">
              <div className="inline-flex items-center px-3 py-1 w-fit rounded-full bg-white text-green-600 text-xs font-medium">
                {academicYear}
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <h2 className="text-3xl font-bold">
                {guardianCount.toLocaleString()}
              </h2>
              <p className="text-sm text-gray-600">Parents</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-100 rounded-2xl shadow-sm">
            <CardHeader className="text-center pb-0">
              <div className="inline-flex items-center px-3 py-1 w-fit rounded-full bg-white text-green-600 text-xs font-medium">
                {academicYear}
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <h2 className="text-3xl font-bold">
                {staffCount.toLocaleString()}
              </h2>
              <p className="text-sm text-gray-600">Staffs</p>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welcome back, {forename}!
          </h1>
          <p className="mt-3 text-xl text-gray-600">Your {content.title}</p>
          <p className="mt-2 text-lg text-gray-500">{content.description}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {content.actions.map((action) => (
            <Card
              key={action.href}
              className="hover:shadow-xl transition-shadow duration-300 flex-shrink-0 min-w-[250px] snap-center"
            >
              <CardHeader className="flex items-center space-x-4">
                <action.icon className="h-6 w-6 text-indigo-600" />
                <CardTitle>{action.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={action.href}>Go to {action.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Lessons */}
        {role === "GUARDIAN" ? (
          <GuardianUpcomingLessons
            students={students}
            allUpcomingLessons={allUpcomingLessons}
          />
        ) : (
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Upcoming Lessons</CardTitle>
              <CardDescription>Your next sessions at a glance.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingLessons.length === 0 ? (
                <p className="text-gray-600">No upcoming lessons scheduled.</p>
              ) : (
                <ul className="space-y-4">
                  {upcomingLessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex flex-wrap justify-between items-center border-b pb-2 gap-2"
                    >
                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold truncate">
                          {lesson.lesson.title}
                        </h3>
                        <p
                          className="text-sm text-gray-500 truncate"
                          suppressHydrationWarning
                        >
                          {format(
                            new Date(lesson.start),
                            "MMMM d, yyyy - h:mm a"
                          )}
                        </p>
                      </div>
                      <Button variant="ghost" asChild className="flex-shrink-0">
                        <Link href={`/lessons/${lesson.lesson.id}`}>
                          Details
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <div className="flex justify-center">
        <RightColumn
          initialEvents={initialEvents.map((e) => ({
            id: e.id,
            title: e.title,
            start: e.start.toISOString(),
            end: e.end.toISOString(),
          }))}
          initialAnnouncements={initialAnnouncements}
        />
      </div>
    </div>
  );
};

export default Home;
