import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive.metadata.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      // Domain restriction: only allow @maeilfoods.com emails
      if (profile?.email?.endsWith("@maeilfoods.com")) {
        return true
      }
      return false
    },
    async jwt({ token, account, profile }) {
      // On initial sign-in, persist the OAuth tokens
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.picture = profile?.picture
      }
      return token
    },
    async session({ session, token }) {
      // Expose access token and user info to client session
      session.accessToken = token.accessToken as string
      session.user.image = token.picture as string
      return session
    },
  },
})
