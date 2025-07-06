import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as bcrypt from "bcrypt-ts-edge";
import { prisma } from "@/prisma-singleton";

export default {
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email as string,
          },
        });

        if (!user || !user.emailVerified) {
          return null; // No user found with this email
        }

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!validPassword) {
          return null; // Password does not match
        }

        // return user object with their profile data
        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
