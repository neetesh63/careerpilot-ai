import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { profilesRepo, auditRepo } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = profilesRepo.getByUserId(auth.user.id);
    if (!profile) {
      profile = profilesRepo.upsert(auth.user.id, { current_stage: "student" });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updated = profilesRepo.upsert(auth.user.id, {
      headline: body.headline !== undefined ? String(body.headline).trim() : undefined,
      phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
      location: body.location !== undefined ? String(body.location).trim() : undefined,
      current_stage: body.current_stage !== undefined ? String(body.current_stage) : undefined,
      target_role: body.target_role !== undefined ? String(body.target_role).trim() : undefined,
      target_industry: body.target_industry !== undefined ? String(body.target_industry).trim() : undefined,
      experience_level: body.experience_level !== undefined ? String(body.experience_level) : undefined,
      education_data: body.education_data !== undefined ? (typeof body.education_data === "string" ? body.education_data : JSON.stringify(body.education_data)) : undefined,
      skills_data: body.skills_data !== undefined ? (typeof body.skills_data === "string" ? body.skills_data : JSON.stringify(body.skills_data)) : undefined,
      projects_data: body.projects_data !== undefined ? (typeof body.projects_data === "string" ? body.projects_data : JSON.stringify(body.projects_data)) : undefined,
      certifications_data: body.certifications_data !== undefined ? (typeof body.certifications_data === "string" ? body.certifications_data : JSON.stringify(body.certifications_data)) : undefined,
      portfolio_url: body.portfolio_url !== undefined ? String(body.portfolio_url).trim() : undefined,
      linkedin_url: body.linkedin_url !== undefined ? String(body.linkedin_url).trim() : undefined,
      github_url: body.github_url !== undefined ? String(body.github_url).trim() : undefined,
      bio: body.bio !== undefined ? String(body.bio).trim() : undefined,
      onboarding_completed: body.onboarding_completed !== undefined ? Number(body.onboarding_completed) : undefined
    });

    auditRepo.log(auth.user.id, "UPDATE", "USER_PROFILE", auth.user.id, "User updated career profile");

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
