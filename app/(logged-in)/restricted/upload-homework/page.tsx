// app/homework/upload/page.tsx
import { prisma } from "@/prisma-singleton";
import { redirect } from "next/navigation";
import path from "path";
import { writeFile } from "fs/promises";
import { auth } from "@/auth";
import { format } from "date-fns";

export default async function UploadHomeworkPage() {
  // Get current teacher session
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }
  const teacherId = session.user.id;

  // Fetch occurrences for lessons the teacher is enrolled in
  const occurrences = await prisma.lessonOccurrence.findMany({
    where: {
      lesson: {
        users: {
          some: { userId: teacherId },
        },
      },
    },
    include: { lesson: true },
    orderBy: { start: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center">
          Upload Homework
        </h1>
        <form action={uploadHomework} className="space-y-5">
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700"
            >
              Homework File
            </label>
            <input
              type="file"
              name="file"
              id="file"
              accept=".pdf,.doc,.docx,.zip"
              required
              className="mt-2 block w-full p-2 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="lessonOccurrenceId"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson Occurrence
            </label>
            <select
              name="lessonOccurrenceId"
              id="lessonOccurrenceId"
              required
              className="mt-2 block w-full px-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a lesson</option>
              {occurrences.map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {occ.lesson.title} -{" "}
                  {format(new Date(occ.start), "dd/MM/yyyy")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700"
            >
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              required
              className="mt-2 block w-full px-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-6 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Upload Homework
          </button>
        </form>
      </div>
    </div>
  );
}

async function uploadHomework(formData: FormData) {
  "use server";

  const file = formData.get("file") as File;
  const dueDate = formData.get("dueDate") as string;
  const lessonOccurrenceId = formData.get("lessonOccurrenceId") as string;

  if (!file || !dueDate || !lessonOccurrenceId) {
    throw new Error("Missing required fields");
  }

  // Save file to public/uploads
  const data = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);
  await writeFile(uploadPath, data);

  // Create homework record in database
  await prisma.homework.create({
    data: {
      filePath: `/uploads/${fileName}`,
      dueDate: new Date(dueDate),
      lessonOccurrence: { connect: { id: parseInt(lessonOccurrenceId, 10) } },
    },
  });

  // Optionally redirect or handle post-upload UX here
  return;
}
