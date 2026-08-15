import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { cookieName, password, tokenFor } from "../lib/auth";

export const metadata: Metadata = {
  title: "AJAX",
  description: "LinkedIn assistant for Jerome Ng. Never edits live LinkedIn.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const authed = jar.get(cookieName())?.value === tokenFor(password());

  return (
    <html lang="en-GB">
      <body>
        <header className="app">
          <Link href="/">
            <strong>AJAX</strong>
          </Link>
          {authed ? (
            <nav className="app">
              <Link href="/profile">Profile</Link>
              <Link href="/apply">Apply</Link>
              <Link href="/voice">Voice</Link>
              <Link href="/week">This week</Link>
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
