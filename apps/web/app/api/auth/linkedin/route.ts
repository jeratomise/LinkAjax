import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/linkedin/callback`;

// LinkedIn OAuth scopes for profile read
const SCOPES = ["openid", "profile", "email"];

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!LINKEDIN_CLIENT_ID) {
    return NextResponse.json(
      {
        error: "LinkedIn integration not configured",
        message: "Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to your environment variables.",
      },
      { status: 501 }
    );
  }

  // Generate OAuth URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    scope: SCOPES.join(" "),
    state: user.id, // Use user ID as state for CSRF protection
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
