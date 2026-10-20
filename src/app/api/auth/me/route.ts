import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { profilesRepo } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const profile = profilesRepo.getByUserId(auth.user.id);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        role: auth.user.role
      },
      profile
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ authenticated: false, error: "Authentication check failed" }, { status: 500 });
  }
}
