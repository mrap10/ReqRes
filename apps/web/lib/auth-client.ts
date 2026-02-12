import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
  session: {
    // to avoid refetching /get-session on every tab focus
    staleTime: 5 * 60,
    fetchOnWindowFocus: true,
  },
});

export const { signIn, signUp, signOut, useSession, sendVerificationEmail } = authClient;

export const requestPasswordReset = authClient.requestPasswordReset;
export const resetPassword = authClient.resetPassword;
