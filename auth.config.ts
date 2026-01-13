import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "student@school.edu" },
      },
      async authorize(credentials) {
        if (!credentials?.email || typeof credentials.email !== "string") {
          return null;
        }

        const email = credentials.email.toLowerCase();

        // Verify it's a .edu email
        if (!email.endsWith(".edu")) {
          throw new Error("Only .edu email addresses are allowed");
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email },
          include: { school: true },
        });

        // If user doesn't exist, we'll need to handle registration
        // For now, return null (you'll implement registration flow later)
        if (!user) {
          throw new Error("User not found. Please register first.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnReview = nextUrl.pathname.startsWith("/review");

      // Protect dashboard and review pages
      if (isOnDashboard || isOnReview) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
