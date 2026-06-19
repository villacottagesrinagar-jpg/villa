import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowlist = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      if (allowlist.length === 0) return true; // dev: any Google account, change in prod
      return allowlist.includes(email);
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
