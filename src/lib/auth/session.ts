import { cookies } from "next/headers";
import { signToken, verifyToken, SessionPayload } from "./crypto";
import { usersRepo, UserRecord } from "../db";

export const COOKIE_NAME = "careerpilot_session";

export async function setSessionCookie(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const token = signToken(payload, 72); // 3 days
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 72 * 3600 // 3 days in seconds
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<{ user: UserRecord; session: SessionPayload } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = usersRepo.findById(payload.userId);
    if (!user) return null;

    return { user, session: payload };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<{ user: UserRecord; session: SessionPayload }> {
  const auth = await getCurrentUser();
  if (!auth) {
    throw new Error("UNAUTHORIZED");
  }
  return auth;
}
