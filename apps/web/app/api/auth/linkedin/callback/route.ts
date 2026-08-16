import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/linkedin/callback`;
const ENCRYPTION_KEY = process.env.SUPABASE_ENCRYPTION_KEY;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/profile?linkedin_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/profile?linkedin_error=missing_params`);
  }

  const user = await getUser();
  if (!user || user.id !== state) {
    return NextResponse.redirect(`${origin}/profile?linkedin_error=invalid_state`);
  }

  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    return NextResponse.redirect(`${origin}/profile?linkedin_error=not_configured`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", errorText);
      return NextResponse.redirect(`${origin}/profile?linkedin_error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch user profile from LinkedIn
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error("LinkedIn profile fetch failed:", await profileResponse.text());
      return NextResponse.redirect(`${origin}/profile?linkedin_error=profile_fetch_failed`);
    }

    const profileData = await profileResponse.json();

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Use admin client to encrypt and store tokens
    // We use service role key here to bypass RLS for encryption
    const cookieStore = await cookies();
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {}, // No-op for admin client
        },
      }
    );

    // Encrypt tokens using pgcrypto
    if (!ENCRYPTION_KEY) {
      console.error("SUPABASE_ENCRYPTION_KEY not set");
      return NextResponse.redirect(`${origin}/profile?linkedin_error=encryption_not_configured`);
    }

    // Store the connection with encrypted tokens
    const { error: upsertError } = await supabaseAdmin.rpc("upsert_linkedin_connection", {
      p_user_id: user.id,
      p_linkedin_sub: profileData.sub,
      p_access_token: access_token,
      p_refresh_token: refresh_token || null,
      p_expires_at: expiresAt,
      p_profile_snapshot: profileData,
      p_encryption_key: ENCRYPTION_KEY,
    });

    if (upsertError) {
      console.error("Failed to store LinkedIn connection:", upsertError);
      return NextResponse.redirect(`${origin}/profile?linkedin_error=storage_failed`);
    }

    return NextResponse.redirect(`${origin}/profile?linkedin_success=true`);
  } catch (err) {
    console.error("LinkedIn OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/profile?linkedin_error=unknown`);
  }
}
