import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isLoginRoute = nextUrl.pathname === '/login';
      
      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoginRoute) {
        if (isLoggedIn) return Response.redirect(new URL('/admin', nextUrl));
        return true;
      }

      return true;
    },
  },
  providers: [], // Edge compatible
} satisfies NextAuthConfig;
