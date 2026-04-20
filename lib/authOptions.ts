import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/drive",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();
        const email = user.email;
        if (!email) return true;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          await User.create({
            email: email,
            name: user.name || "User",
            image: user.image || "",
            plan: "free",
            creditsRemaining: 800,
            lastReset: new Date(),
          });
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return true;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
