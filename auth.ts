import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma-singleton";
import authConfig from "./auth.config";

declare module "next-auth" {
  interface User {
    forename?: string;
    surname?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,

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
    async jwt({ token, user }) {
      if (!user?.id) return token;
      token.id = user.id;
      token.forename = user.forename;
      token.surname = user.surname;

      return token;
    },
  },
  ...authConfig,
});
