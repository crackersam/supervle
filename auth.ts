import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma";
import authConfig from "./auth.config";

declare module "next-auth" {
  interface User {
    forename?: string;
    surname?: string;
    role?: string;

    stripeId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ session, token }) {
      // Add user id to the session object
      if (token.id) {
        session.user.id = token.id as string;
        session.user.forename = token.forename as string;
        session.user.surname = token.surname as string;
      }
      return session;
    },
    async jwt({ token }) {
      // Add user id to the JWT token
      const user = await prisma.user.findUnique({
        where: {
          email: token.email as string,
        },
      });
      if (user) {
        token.id = user.id;
        token.forename = user.forename;
        token.surname = user.surname;
      }
      return token;
    },
  },
  ...authConfig,
});
