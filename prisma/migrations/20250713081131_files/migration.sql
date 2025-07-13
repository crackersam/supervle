-- CreateTable
CREATE TABLE "LessonOccurrence" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "occurrenceId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonOccurrence" ADD CONSTRAINT "LessonOccurrence_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "LessonOccurrence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
