import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import SessionManager from "@/components/SessionManager";
import { isAuthenticatedAsAdmin } from "@/auth";

import "./new.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "F1 Picks",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const canRecordResults = await isAuthenticatedAsAdmin();

  return (
    <html lang="en">
      <body className={inter.className}>
        <header style={{ display: "flex" }}>
          <h1 style={{ flex: 1 }}>🏁 F1 Picks</h1>
          <nav>
            <Link href="/">Rounds</Link> -{" "}
            {canRecordResults && (
              <>
                <Link href="/results">Results</Link>
                {" - "}
              </>
            )}
            <SessionManager />
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
