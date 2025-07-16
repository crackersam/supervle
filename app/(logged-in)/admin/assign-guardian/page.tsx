import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AssignForm from "./AssignForm";
import { prisma } from "@/prisma-singleton";

const AssignGuardianPage = async () => {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, forename: true, surname: true },
    orderBy: { forename: "asc" },
  });

  const guardians = await prisma.user.findMany({
    where: { role: "GUARDIAN" },
    select: { id: true, forename: true, surname: true },
    orderBy: { forename: "asc" },
  });

  const assignGuardian = async (studentId: string, guardianId: string) => {
    "use server";
    try {
      await prisma.studentGuardian.create({
        data: { studentId, guardianId },
      });
      return { success: true };
    } catch (error) {
      console.error("Error assigning guardian:", error);
      return {
        success: false,
        error: "Assignment failed. Possibly already assigned.",
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Assign Guardian to Student</CardTitle>
            <CardDescription>
              Select a student and a guardian to assign the relationship.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignForm
              students={students}
              guardians={guardians}
              assignGuardian={assignGuardian}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssignGuardianPage;
