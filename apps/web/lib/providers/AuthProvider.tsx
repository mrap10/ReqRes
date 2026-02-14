"use client";

import { createContext, ReactNode, useContext } from "react";
import { useSession } from "../auth-client";

interface User {
  id: string;
  name?: string | null;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  xp: number;
  image?: string | null;
  emailVerified?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BetterAuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified?: boolean | null;
    createdAt: Date;
    updatedAt: Date;
    username?: string;
    role?: string;
    xp?: number;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    [key: string]: unknown;
  };
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

function mapSessionToUser(session: BetterAuthSession | null): User | null {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name || null,
    email: session.user.email,
    username: session.user.username!,
    role: (session.user.role || "USER") as "USER" | "ADMIN",
    xp: session.user.xp || 0,
    image: session.user.image,
    emailVerified: session.user.emailVerified,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  };
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const user = mapSessionToUser(session as BetterAuthSession | null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
