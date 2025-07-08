// app/admin-schedule/page.tsx
import SearchForm from "./search-form";
import UserSchedule from "@/components/user-schedule";
import { prisma } from "@/prisma-singleton";

type Props = {
  searchParams: Promise<{ forename?: string; surname?: string }>;
};

export default async function AdminSchedule({ searchParams }: Props) {
  const { forename = "", surname = "" } = await searchParams;

  // only hit the DB if they've actually searched
  const users =
    forename || surname
      ? await prisma.user.findMany({
          where: {
            AND: [
              { forename: { contains: forename, mode: "insensitive" } },
              { surname: { contains: surname, mode: "insensitive" } },
            ],
          },
          include: {
            lessons: {
              include: { lesson: true },
              orderBy: { lessonId: "asc" },
            },
          },
        })
      : [];

  return (
    <div className="p-6">
      <SearchForm />

      {(forename || surname) &&
        (users.length > 0 ? (
          users.map((user) => (
            <UserSchedule
              key={user.id}
              user={{
                id: user.id,
                forename: user.forename,
                surname: user.surname,
                lessons: user.lessons.map((ev) => ({
                  lessonId: ev.lessonId,
                  lesson: ev.lesson,
                  deleteAction: "/admin/schedule",
                })),
              }}
            />
          ))
        ) : (
          <p className="text-red-600">
            No users found matching “{forename} {surname}”.
          </p>
        ))}
    </div>
  );
}
