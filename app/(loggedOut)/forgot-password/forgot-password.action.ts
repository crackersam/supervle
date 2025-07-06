"use server";

import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/prisma-singleton";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/schemas/forgot-password";

export const forgotPassword = actionClient
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      const emailLower = email.toLowerCase();
      const user = await prisma.user.findUnique({
        where: {
          email: emailLower,
        },
      });

      if (!user) {
        return { success: "Password reset email sent" };
      }

      const expires = new Date();
      expires.setHours(expires.getHours() + 6);
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          token,
          expires,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      fetch(`${process.env.BASE_URL}/api/sendReset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          from: "admin@lecturetheplanet.com",
          subject: "Reset your password",
          forename: user.forename[0].toUpperCase() + user.forename.slice(1),
          token,
        }),
      });

      return { success: "Password reset email sent" };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { error: "An error occurred while processing your request" };
    }
  });
