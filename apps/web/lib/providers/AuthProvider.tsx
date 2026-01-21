"use client";

import { createContext, ReactNode, useContext } from "react";
import { useSession } from "../auth-client";

interface User {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  xp: number;
  image?: string | null;
  emailVerified?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  const user = session?.user as unknown as User | null;

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
