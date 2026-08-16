import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "AJAX",
  description: "LinkedIn assistant for Jerome Ng. Never edits live LinkedIn.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html lang="en-GB">
      <body>
        <header className="app">
          <Link href="/">
            <strong>AJAX</strong>
          </Link>
          {user ? (
            <nav className="app">
              <Link href="/profile">Profile</Link>
              <Link href="/apply">Apply</Link>
              <Link href="/voice">Voice</Link>
              <Link href="/week">This week</Link>
              <span className="user-email">{user.email}</span>
              <SignOutButton />
            </nav>
          ) : (
            <span className="meta">LinkedIn unchanged</span>
          )}
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
