"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "password" | "magic-link";

function getHashError(): string {
  if (typeof window === "undefined") return "";

  const hash = window.location.hash;
  if (!hash) return "";

  const params = new URLSearchParams(hash.slice(1));
  const errorCode = params.get("error_code");
  const errorDesc = params.get("error_description");

  if (errorCode === "otp_expired" || errorDesc?.includes("expired")) {
    return "This sign-in link has expired or has already been used. Please request a new link or sign in with your password.";
  }
  if (errorCode === "access_denied") {
    return "Access was denied. Please request a new sign-in link or use your password.";
  }
  if (params.get("error")) {
    return errorDesc?.replace(/\+/g, " ") || "Sign-in failed. Please try again.";
  }

  return "";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  // Handle errors from URL (query params and hash fragment)
  useEffect(() => {
    const hashError = getHashError();
    if (hashError) {
      setError(hashError);
      // Clear the hash to prevent showing error on refresh
      if (window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      return;
    }

    if (urlError === "auth") {
      setError("Sign-in failed. Please try again.");
    } else if (urlError === "config") {
      setError("Authentication is not configured. Contact the administrator.");
    }
  }, [urlError]);

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign-in failed. Please try again.");
        setStatus("error");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach the sign-in service. Please try again.");
      setStatus("error");
    }
  }

  async function onMagicLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  if (status === "sent") {
    return (
      <>
        <h1>Check your inbox</h1>
        <div className="card">
          <p className="success">
            We have sent a sign-in link to <strong>{email}</strong>.
          </p>
          <p className="meta">
            Click the link in the email to sign in. You can close this tab.
          </p>
        </div>
        <p className="meta" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="link"
            onClick={() => {
              setStatus("idle");
              setError("");
            }}
          >
            Try a different email
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Sign in</h1>
      <p className="lede">
        {mode === "password"
          ? "Enter your email and password."
          : "Enter your email to receive a sign-in link."}
      </p>

      {mode === "password" ? (
        <form className="card" onSubmit={onPasswordSubmit}>
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

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />

          <p>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
          </p>
          {error ? <p className="error">{error}</p> : null}

          <p className="meta" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode("magic-link");
                setError("");
              }}
            >
              Forgot password? Email me a link
            </button>
          </p>
          <p className="meta">
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode("magic-link");
                setError("");
              }}
            >
              First time? Sign in with email link
            </button>
          </p>
        </form>
      ) : (
        <form className="card" onSubmit={onMagicLinkSubmit}>
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
              {status === "loading" ? "Sending..." : "Send sign-in link"}
            </button>
          </p>
          {error ? <p className="error">{error}</p> : null}

          <p className="meta" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode("password");
                setError("");
              }}
            >
              Sign in with password instead
            </button>
          </p>
        </form>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <>
          <h1>Sign in</h1>
          <p className="lede">Loading...</p>
        </>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
