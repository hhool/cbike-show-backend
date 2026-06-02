import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getPayload } from "payload";
import config from "@payload-config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Members",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        try {
          const payload = await getPayload({ config });
          const result = await payload.login({
            collection: "members",
            data: { email, password },
          });

          const user = result?.user as any;
          if (!user?.id) return null;

          return {
            id: String(user.id),
            email: user.email,
            name: user.email,
            tier: user.tier || "free",
            locale: user.locale || "zh",
          } as any;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.tier = (user as any).tier || "free";
        token.locale = (user as any).locale || "zh";
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user.id = token.uid;
      (session as any).user.tier = token.tier;
      (session as any).user.locale = token.locale;
      return session;
    },
  },
});
