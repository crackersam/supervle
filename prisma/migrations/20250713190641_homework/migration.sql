-- CreateTable
CREATE TABLE "Homework" (
    "id" SERIAL NOT NULL,
    "filePath" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "lessonOccurrenceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_lessonOccurrenceId_fkey" FOREIGN KEY ("lessonOccurrenceId") REFERENCES "LessonOccurrence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
