// app/homework/page.tsx
import Link from "next/link";
import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function HomeworkListPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }
  const { id: userId, role } = session.user;

  const homeworkItems = await prisma.homework.findMany({
    where: {
      lessonOccurrence: {
        lesson: {
          users: { some: { userId } },
        },
      },
    },
    include: {
      lessonOccurrence: {
        include: { lesson: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assigned Homework</h1>
      {homeworkItems.length === 0 ? (
        <p>No homework assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {homeworkItems.map((hw) => (
            <li
              key={hw.id}
              className="border rounded p-4 flex justify-between items-start"
            >
              <div>
                <h2 className="font-semibold text-lg">
                  {hw.lessonOccurrence.lesson.title}
                </h2>
                <p>
                  Assigned:{" "}
                  {format(new Date(hw.lessonOccurrence.start), "dd/MM/yyyy")}
                </p>
                <p>Due: {format(new Date(hw.dueDate), "dd/MM/yyyy")}</p>
                <Link
                  href={hw.filePath}
                  target="_blank"
                  className="mt-2 inline-block text-blue-600 hover:underline"
                >
                  Download Assignment
                </Link>
              </div>
              {(role === "TEACHER" || role === "ADMIN") && (
                <form action={deleteHomework} className="ml-4">
                  <input type="hidden" name="homeworkId" value={hw.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function deleteHomework(formData: FormData) {
  "use server";
  const homeworkId = formData.get("homeworkId") as string;
  if (!homeworkId) {
    throw new Error("Missing homework ID");
  }

  await prisma.homework.delete({
    where: { id: parseInt(homeworkId, 10) },
  });

  redirect("/homework");
}
