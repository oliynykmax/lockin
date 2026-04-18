import { createAuthClient } from "better-auth/react";

const authBaseURL =
  typeof window === "undefined"
    ? "http://localhost:8788/api/auth"
    : new URL("/api/auth", window.location.origin).toString();

export const authClient = createAuthClient({
  baseURL: authBaseURL,
});

export const {
  useSession,
  signIn,
  signOut,
} = authClient;
