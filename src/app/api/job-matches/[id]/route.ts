import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { jobMatchesRepo, auditRepo } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const match = jobMatchesRepo.getById(id, auth.user.id);
    if (!match) {
      return NextResponse.json({ error: "Job match not found." }, { status: 404 });
    }

    return NextResponse.json({
      match: {
        ...match,
        matched_skills: JSON.parse(match.matched_skills || "[]"),
        missing_skills: JSON.parse(match.missing_skills || "[]"),
        partially_matched: JSON.parse(match.partially_matched || "[]"),
        strengths_for_role: JSON.parse(match.strengths_for_role || "[]"),
        recommendations: JSON.parse(match.recommendations || "[]"),
        tailored_bullet_points: JSON.parse(match.tailored_bullet_points || "[]"),
        interview_prep_questions: JSON.parse(match.interview_prep_questions || "[]")
      }
    });
  } catch (error) {
    console.error("Get job match error:", error);
    return NextResponse.json({ error: "Failed to fetch job match." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const match = jobMatchesRepo.getById(id, auth.user.id);
    if (!match) {
      return NextResponse.json({ error: "Job match not found." }, { status: 404 });
    }

    jobMatchesRepo.delete(id, auth.user.id);
    auditRepo.log(auth.user.id, "DELETE", "JOB_MATCH", id, "User deleted job match");

    return NextResponse.json({ success: true, message: "Job match deleted." });
  } catch (error) {
    console.error("Delete job match error:", error);
    return NextResponse.json({ error: "Failed to delete job match." }, { status: 500 });
  }
}
