"use client";

import { useSearchParams } from "next/navigation";
import type { Json } from "@/lib/supabase/types";

type LinkedInProfile = {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
};

type Props = {
  connection: {
    linkedin_sub: string;
    profile_snapshot: Json | null;
    last_synced_at: string | null;
    expires_at: string | null;
  } | null;
};

function isLinkedInProfile(obj: Json | null): obj is LinkedInProfile {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return true;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LinkedInConnection({ connection }: Props) {
  const searchParams = useSearchParams();
  const linkedinError = searchParams.get("linkedin_error");
  const linkedinSuccess = searchParams.get("linkedin_success");

  const hasCredentials = !!process.env.NEXT_PUBLIC_LINKEDIN_CONFIGURED;

  return (
    <div className="card linkedin-connection">
      <h3>LinkedIn Connection</h3>

      {linkedinError && (
        <p className="error">
          Failed to connect LinkedIn:{" "}
          {linkedinError === "not_configured"
            ? "LinkedIn integration requires LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables."
            : linkedinError.replace(/_/g, " ")}
        </p>
      )}

      {linkedinSuccess && (
        <p className="success">LinkedIn account connected successfully.</p>
      )}

      {connection ? (
        <div className="linkedin-info">
          <p className="status-line">
            <span className="status-dot active" /> Connected
          </p>
          {isLinkedInProfile(connection.profile_snapshot) && (
            <div className="profile-preview">
              {connection.profile_snapshot.picture && (
                <img
                  src={connection.profile_snapshot.picture}
                  alt="LinkedIn profile"
                  className="linkedin-avatar"
                />
              )}
              <div>
                <strong>
                  {connection.profile_snapshot.name ||
                    `${connection.profile_snapshot.given_name || ""} ${connection.profile_snapshot.family_name || ""}`.trim() ||
                    "LinkedIn User"}
                </strong>
                {connection.profile_snapshot.email && (
                  <p className="meta">{connection.profile_snapshot.email}</p>
                )}
              </div>
            </div>
          )}
          {connection.last_synced_at && (
            <p className="meta">Last synced: {formatDate(connection.last_synced_at)}</p>
          )}
          <p className="meta">
            <a href="/api/auth/linkedin" className="button secondary small">
              Refresh connection
            </a>
          </p>
        </div>
      ) : (
        <div className="linkedin-connect">
          <p className="meta">
            Connect your LinkedIn account to fetch your profile snapshot. This uses the official
            LinkedIn API and only reads your profile information. AJAX cannot write to your
            LinkedIn profile.
          </p>
          <a href="/api/auth/linkedin" className="button">
            Connect LinkedIn
          </a>
          <p className="meta linkedin-scopes">
            Scopes requested: <code>openid</code>, <code>profile</code>, <code>email</code>
          </p>
        </div>
      )}

      <details className="linkedin-faq">
        <summary>What can LinkedIn "scan" do?</summary>
        <ul>
          <li>Fetch your basic profile: name, headline, picture</li>
          <li>Fetch your email (if you grant the scope)</li>
          <li>Store a snapshot for reference in cover letters</li>
        </ul>
        <p>
          <strong>Cannot:</strong> write to your headline, About, Featured, or Experience. The
          LinkedIn API does not allow that. AJAX will never scrape linkedin.com or store session
          cookies.
        </p>
      </details>
    </div>
  );
}
