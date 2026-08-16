"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getClient } from "@/lib/supabase/client";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "magiclink" | null;

  const [status, setStatus] = useState<
    "ready" | "verifying" | "success" | "error"
  >("ready");
  const [error, setError] = useState("");

  // Auto-verify on mount (email scanners won't execute JS, so this is safe)
  // But we also show a button as fallback
  useEffect(() => {
    if (tokenHash && type) {
      verifyToken();
    }
  }, [tokenHash, type]);

  async function verifyToken() {
    if (!tokenHash || !type) {
      setError("Invalid confirmation link.");
      setStatus("error");
      return;
    }

    setStatus("verifying");
    setError("");

    try {
      const supabase = await getClient();

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type === "email" ? "email" : "magiclink",
      });

      if (verifyError) {
        if (
          verifyError.message.includes("expired") ||
          verifyError.message.includes("invalid")
        ) {
          setError(
            "This link has expired or has already been used. Please request a new sign-in link."
          );
        } else {
          setError(verifyError.message);
        }
        setStatus("error");
        return;
      }

      if (!data.user) {
        setError("Verification failed. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");

      // Check if user needs to set password
      const { data: profile } = await supabase
        .from("profiles")
        .select("password_set_at")
        .eq("id", data.user.id)
        .single();

      if (!profile?.password_set_at) {
        router.push("/set-password");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setStatus("error");
    }
  }

  if (!tokenHash || !type) {
    return (
      <>
        <h1>Invalid link</h1>
        <div className="card">
          <p className="error">
            This confirmation link is invalid or incomplete.
          </p>
          <p style={{ marginTop: "1rem" }}>
            <a href="/login" className="button">
              Return to sign in
            </a>
          </p>
        </div>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <h1>Sign-in failed</h1>
        <div className="card">
          <p className="error">{error}</p>
          <p style={{ marginTop: "1rem" }}>
            <a href="/login" className="button">
              Return to sign in
            </a>
          </p>
        </div>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <h1>Signed in</h1>
        <div className="card">
          <p className="success">Redirecting you to AJAX...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Confirm sign-in</h1>
      <div className="card">
        {status === "verifying" ? (
          <p>Verifying your sign-in link...</p>
        ) : (
          <>
            <p>Click below to complete your sign-in to AJAX.</p>
            <p style={{ marginTop: "1rem" }}>
              <button onClick={verifyToken}>Continue to AJAX</button>
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <>
          <h1>Confirm sign-in</h1>
          <div className="card">
            <p>Loading...</p>
          </div>
        </>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
