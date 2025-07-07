import { auth } from "@/auth";
import { prisma } from "@/prisma-singleton";
import { notFound } from "next/navigation";
import React from "react";

const StudentPage = async () => {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "STUDENT") {
    return notFound();
  }
  const guardians = await prisma.user.findMany({
    where: {
      role: "GUARDIAN",
    },
  });
  const addGuardian = async (formData: FormData) => {
    "use server";
    const guardianId = formData.get("guardianId") as string;
    await prisma.studentGuardian.create({
      data: {
        student: { connect: { id: session.user?.id } },
        guardian: { connect: { id: guardianId } },
      },
    });
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Guardians</h1>
      <p className="mb-4">You can add guardians who can view your schedule.</p>
      <ul className="list-disc pl-5 mb-4">
        {guardians.map((guardian) => (
          <li key={guardian.id} className="mb-2">
            {guardian.forename} {guardian.surname}
            <form action={addGuardian}>
              <input type="hidden" name="guardianId" value={guardian.id} />
              <button
                type="submit"
                className="ml-2 text-blue-500 hover:underline"
              >
                Add
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentPage;
