// components/types.ts
import type { Lesson } from "@prisma/client";

export interface UserWithLessons {
  id: string;
  forename: string;
  surname: string;
  lessons: Array<{
    lessonId: number;
    deleteAction: string; // e.g. "/admin/schedule"
    lesson: Lesson;
  }>;
}
