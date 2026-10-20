import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardRepo, profilesRepo, usersRepo } from "@/lib/db";
import { aiService } from "@/lib/ai";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = dashboardRepo.getStats(auth.user.id);
    const profile = profilesRepo.getByUserId(auth.user.id);
    const aiStatus = aiService.getProviderStatus();

    return NextResponse.json({
      user: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        targetRole: profile?.target_role || "Software Engineer",
        currentStage: profile?.current_stage || "student"
      },
      stats,
      aiStatus
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard metrics." }, { status: 500 });
  }
}
