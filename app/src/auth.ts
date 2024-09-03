import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import db from "@/db";

export const config = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    jwt({ token, account, user }) {
      if (account) {
        token.id = user?.id;
      }

      return token;
    },
    session({ session, token }) {
      // @ts-ignore
      session.user.id = token.id;

      return session;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
} satisfies NextAuthOptions;

export function auth(
  ...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []
) {
  return getServerSession(...args, config);
}

export const isAuthenticatedAsAdmin = async () => {
  const userId = await getAuthenticatedUserId();
  return userId !== null && (await db.user.count({ where: { id: userId, isAdmin: true } })) === 1;
};

export const getAuthenticatedUserId = async (): Promise<string | null> => {
  // @ts-ignore
  return (await auth())?.user?.id ?? null;
};
