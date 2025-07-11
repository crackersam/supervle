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
    if (typeof userId !== "string") {
      throw new Error("Invalid user ID");
    }
    await prisma.user.update({
      where: { id: userId },
      data: { activated: new Date() },
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
        {users.map((user) => (
          <TableRow key={user.email}>
            <TableCell>{user.forename}</TableCell>
            <TableCell>{user.surname}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <form action={permitUser}>
                <input type="hidden" name="userId" value={user.id} />
                <Button type="submit" size="sm">
                  Permit
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PermitUsersPage;
