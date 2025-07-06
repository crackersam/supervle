"use server";

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma-singleton";
import { resetPasswordSchema } from "@/schemas/password-reset";
import * as bcrypt from "bcrypt-ts-edge";

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password, confirmPassword, token } }) => {
    if (password !== confirmPassword) {
      return {
        error: "Passwords do not match",
      };
    }
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token,
      },
      include: {
        user: true,
      },
    });

    if (!tokenRecord || !tokenRecord.user) {
      return {
        error: "Invalid token",
      };
    }

    const user = tokenRecord.user;

    if (!user) {
      return {
        error: "Invalid token",
      };
    }
    // Check if the token is expired
    const now = new Date();
    if (tokenRecord.expires < now) {
      return {
        error: "Token expired",
      };
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: undefined,
        password: hashedPassword,
      },
    });
    // Delete the token
    await prisma.passwordResetToken.delete({
      where: {
        userId: user.id,
      },
    });
    return {
      success: "Password reset successfully",
      email: user.email,
      password: password,
    };
  });
