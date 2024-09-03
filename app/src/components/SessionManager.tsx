"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

export default function WrappedSessionManager() {
  return (
    <SessionProvider>
      <SessionManager />
    </SessionProvider>
  );
}

function SessionManager() {
  const { status } = useSession();

  return status === "authenticated" ? (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        signOut({ callbackUrl: "/" });
      }}
    >
      Logout
    </a>
  ) : (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        signIn();
      }}
    >
      Login
    </a>
  );
}
