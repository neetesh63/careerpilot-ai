import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { resumeAnalysesRepo } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = resumeAnalysesRepo.listByUserId(auth.user.id);

    const parsedAnalyses = analyses.map(a => ({
      ...a,
      skills_detected: JSON.parse(a.skills_detected || "[]"),
      strengths: JSON.parse(a.strengths || "[]"),
      weaknesses: JSON.parse(a.weaknesses || "[]"),
      improvements: JSON.parse(a.improvements || "[]"),
      keyword_gaps: JSON.parse(a.keyword_gaps || "[]"),
      recommended_roles: JSON.parse(a.recommended_roles || "[]")
    }));

    return NextResponse.json({ analyses: parsedAnalyses });
  } catch (error) {
    console.error("List resume analyses error:", error);
    return NextResponse.json({ error: "Failed to fetch analyses." }, { status: 500 });
  }
}
