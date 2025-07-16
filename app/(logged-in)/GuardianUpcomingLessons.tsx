"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

interface Student {
  id: string;
  forename: string;
}

interface LessonOccurrence {
  id: number;
  start: Date;
  end: Date;
  lesson: {
    id: number;
    title: string;
    users?: { userId: string }[];
  };
}

interface GuardianUpcomingLessonsProps {
  students: Student[];
  allUpcomingLessons: LessonOccurrence[];
}

const GuardianUpcomingLessons = ({
  students,
  allUpcomingLessons,
}: GuardianUpcomingLessonsProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id || ""
  );

  if (students.length === 0) {
    return null;
  }

  const filteredLessons = allUpcomingLessons.filter((lessonOcc) =>
    lessonOcc.lesson.users?.some((u) => u.userId === selectedStudentId)
  );

  const upcoming = filteredLessons
    .filter((lesson) => {
      const day = new Date(lesson.start).getDay();
      return day >= 1 && day <= 5;
    })
    .slice(0, 3);

  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Upcoming Lessons</CardTitle>
        <CardDescription>Your next sessions at a glance.</CardDescription>
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.forename}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-gray-600">No upcoming lessons scheduled.</p>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((lesson) => (
              <li
                key={lesson.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <h3 className="font-semibold">{lesson.lesson.title}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(lesson.start), "MMMM d, yyyy - h:mm a")}
                  </p>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/lessons/${lesson.lesson.id}`}>Details</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default GuardianUpcomingLessons;
