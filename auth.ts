import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/prisma";
import * as bcrypt from "bcrypt-ts-edge";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      forename: string;
      surname: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    forename: string;
    surname: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
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
});
