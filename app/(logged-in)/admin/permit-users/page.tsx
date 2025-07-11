import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/prisma-singleton";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import React from "react";

const PermitUsersPage = async () => {
  const users = await prisma.user.findMany({
    where: {
      activated: null,
      emailVerified: {
        not: null, // Ensure the user has verified their email
      },
    },
    select: {
      id: true,
      forename: true,
      surname: true,
      email: true,
      role: true,
    },
  });
  const permitUser = async (formData: FormData) => {
    "use server";
    const userId = formData.get("userId");
    const role = formData.get("role") as string;
    if (
      typeof role !== "string" ||
      !["ADMIN", "GUARDIAN", "STUDENT", "TEACHER"].includes(role)
    ) {
      throw new Error("Invalid role");
    }
    if (typeof userId !== "string") {
      throw new Error("Invalid user ID");
    }
    await prisma.user.update({
      where: { id: userId },
      data: { activated: new Date(), role: role as Role },
    });
    revalidatePath("/admin/permit-users");
    return;
  };

  if (users.length === 0) {
    return <p>No users to permit.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Forename</TableHead>
          <TableHead>Surname</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const formId = `permit-user-${user.id}`;
          return (
            <TableRow key={user.id}>
              <TableCell>{user.forename}</TableCell>
              <TableCell>{user.surname}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <form id={formId} action={permitUser}>
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="border rounded p-2 w-full"
                  >
                    <option value="ADMIN">admin</option>
                    <option value="GUARDIAN">guardian</option>
                    <option value="STUDENT">student</option>
                    <option value="TEACHER">teacher</option>
                  </select>
                  <input type="hidden" name="userId" value={user.id} />
                </form>
              </TableCell>
              <TableCell>
                <Button type="submit" form={formId} size="sm">
                  Permit
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default PermitUsersPage;
