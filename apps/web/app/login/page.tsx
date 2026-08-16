"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send magic link");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <h1>Sign in</h1>
      <p className="lede">
        Enter your email to receive a magic link. No password needed.
      </p>

      {status === "sent" ? (
        <div className="card">
          <p className="success">
            Check your inbox for a magic link from AJAX.
          </p>
          <p className="meta">
            Click the link in the email to sign in. You can close this tab.
          </p>
        </div>
      ) : (
        <form className="card" onSubmit={onSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <p>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send magic link"}
            </button>
          </p>
          {error ? <p className="error">{error}</p> : null}
        </form>
      )}
    </>
  );
}
