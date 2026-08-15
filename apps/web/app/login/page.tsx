"use client";

import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: fd.get("password") }),
    });
    if (!res.ok) {
      setError("Wrong password.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <>
      <h1>Sign in</h1>
      <p className="lede">Single-user dashboard. Set AJAX_PASSWORD in the environment.</p>
      <form className="card" onSubmit={onSubmit}>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        <p>
          <button type="submit">Enter</button>
        </p>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </>
  );
}
