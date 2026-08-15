import { cookies } from "next/headers";

const COOKIE = "ajax_session";

export function password() {
  return process.env.AJAX_PASSWORD || "change-me";
}

export function secret() {
  return process.env.AJAX_SESSION_SECRET || "change-me-too";
}

export function tokenFor(pw: string) {
  return Buffer.from(`${secret()}::${pw}`).toString("base64url");
}

export async function isAuthed() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === tokenFor(password());
}

export function cookieName() {
  return COOKIE;
}
