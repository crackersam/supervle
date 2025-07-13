/*
  Warnings:

  - A unique constraint covering the columns `[lessonId,start]` on the table `LessonOccurrence` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LessonOccurrence_lessonId_start_key" ON "LessonOccurrence"("lessonId", "start");
