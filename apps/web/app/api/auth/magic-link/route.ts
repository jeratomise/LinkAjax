import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured. Contact the administrator." },
        { status: 503 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: emailLower,
      options: {
        redirectTo: `${siteUrl}/api/auth/callback`,
      },
    });

    if (error) {
      console.error("Supabase generateLink error:", error);
      return NextResponse.json(
        { error: "Failed to generate sign-in link" },
        { status: 500 }
      );
    }

    const magicLink = data.properties?.action_link;
    if (!magicLink) {
      console.error("No action_link in response:", data);
      return NextResponse.json(
        { error: "Failed to generate sign-in link" },
        { status: 500 }
      );
    }

    const fromAddress = process.env.RESEND_FROM || "AJAX <noreply@resend.dev>";

    const { error: sendError } = await resend.emails.send({
      from: fromAddress,
      to: emailLower,
      subject: "Sign in to AJAX",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background: #f5f5f5;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h1 style="margin: 0 0 24px; font-size: 24px; color: #333;">Sign in to AJAX</h1>
            <p style="margin: 0 0 24px; color: #555; line-height: 1.5;">
              Click the button below to sign in. This link expires in 1 hour.
            </p>
            <a href="${magicLink}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Sign in to AJAX
            </a>
            <p style="margin: 24px 0 0; color: #888; font-size: 14px; line-height: 1.5;">
              If you did not request this email, you can safely ignore it.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Sign in to AJAX\n\nClick this link to sign in: ${magicLink}\n\nThis link expires in 1 hour.\n\nIf you did not request this email, you can safely ignore it.`,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Magic link error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
