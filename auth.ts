import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma-singleton";
import authConfig from "./auth.config";

declare module "next-auth" {
  interface User {
    forename?: string;
    surname?: string;
    role?: string;
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
        session.user.role = token.role as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const updatedUser = await prisma.user.findUnique({
        where: {
          id: token.sub as string,
        },
      });
      if (!updatedUser?.id) return token;

      token.id = updatedUser.id;
      token.forename = updatedUser.forename;
      token.surname = updatedUser.surname;
      token.role = updatedUser.role;
      token.image = updatedUser.image;

      return token;
    },
  },
  ...authConfig,
});
