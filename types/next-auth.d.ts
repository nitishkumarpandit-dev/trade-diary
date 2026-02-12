import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    emailVerified?: Date | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      emailVerified?: Date | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    emailVerified?: Date | null;
  }
}
