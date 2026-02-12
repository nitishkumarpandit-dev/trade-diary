import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = [
        "/dashboard",
        "/trades",
        "/strategies",
        "/analytics",
        "/psychology",
        "/settings",
      ];
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      const isOnProtectedPath = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      if (isOnProtectedPath) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      }

      // Allow access to other pages
      return true;
    },
  },
} satisfies NextAuthConfig;
