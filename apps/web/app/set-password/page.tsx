"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      const supabase = await getClient();

      // Update password via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setStatus("error");
        return;
      }

      // Mark password as set in profile (upsert in case profile doesn't exist)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            password_set_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      // Redirect to home
      router.push("/");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setStatus("error");
    }
  }

  return (
    <>
      <h1>Set your password</h1>
      <p className="lede">
        Create a password so you can sign in without waiting for an email each
        time.
      </p>

      <form className="card" onSubmit={onSubmit}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Type it again"
        />

        <p>
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Saving..." : "Set password"}
          </button>
        </p>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </>
  );
}
