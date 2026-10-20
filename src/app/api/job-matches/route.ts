import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { jobMatchesRepo, resumesRepo, profilesRepo, auditRepo } from "@/lib/db";
import { aiService } from "@/lib/ai";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matches = jobMatchesRepo.listByUserId(auth.user.id);
    const parsed = matches.map(m => ({
      ...m,
      matched_skills: JSON.parse(m.matched_skills || "[]"),
      missing_skills: JSON.parse(m.missing_skills || "[]"),
      partially_matched: JSON.parse(m.partially_matched || "[]"),
      strengths_for_role: JSON.parse(m.strengths_for_role || "[]"),
      recommendations: JSON.parse(m.recommendations || "[]"),
      tailored_bullet_points: JSON.parse(m.tailored_bullet_points || "[]"),
      interview_prep_questions: JSON.parse(m.interview_prep_questions || "[]")
    }));

    return NextResponse.json({ matches: parsed });
  } catch (error) {
    console.error("List job matches error:", error);
    return NextResponse.json({ error: "Failed to fetch job matches." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobTitle, company, jobDescription, resumeId } = body;

    if (!jobDescription || jobDescription.trim().length < 30) {
      return NextResponse.json({ error: "Please provide a job description with at least 30 characters." }, { status: 400 });
    }

    let candidateContext = "";
    if (resumeId) {
      const resume = resumesRepo.getById(resumeId, auth.user.id);
      if (resume) {
        candidateContext = resume.raw_text;
      }
    }

    if (!candidateContext) {
      // Check latest resume or profile
      const resumes = resumesRepo.listByUserId(auth.user.id);
      if (resumes.length > 0) {
        candidateContext = resumes[0].raw_text;
      } else {
        const profile = profilesRepo.getByUserId(auth.user.id);
        const skills = profile ? JSON.parse(profile.skills_data || "[]") : [];
        candidateContext = `Target Role: ${profile?.target_role || "Software Engineer"}. Skills: ${skills.join(", ")}. Experience Level: ${profile?.experience_level || "entry"}.`;
      }
    }

    const matchResult = await aiService.matchJob(
      jobDescription.trim(),
      candidateContext,
      jobTitle || "Target Role",
      company || "Target Company"
    );

    const saved = jobMatchesRepo.create({
      user_id: auth.user.id,
      job_title: jobTitle ? String(jobTitle).trim() : "Target Position",
      company: company ? String(company).trim() : null,
      job_description: jobDescription.trim(),
      match_score: matchResult.matchScore,
      matched_skills: JSON.stringify(matchResult.matchedSkills),
      missing_skills: JSON.stringify(matchResult.missingSkills),
      partially_matched: JSON.stringify(matchResult.partiallyMatched),
      strengths_for_role: JSON.stringify(matchResult.strengthsForRole),
      recommendations: JSON.stringify(matchResult.recommendations),
      tailored_bullet_points: JSON.stringify(matchResult.tailoredBulletPoints),
      interview_prep_questions: JSON.stringify(matchResult.interviewPrepQuestions),
      ai_provider: matchResult.provider
    });

    auditRepo.log(auth.user.id, "MATCH", "JOB", saved.id, `Matched job ${jobTitle} with score ${matchResult.matchScore}`);

    return NextResponse.json({
      success: true,
      match: {
        ...saved,
        matched_skills: matchResult.matchedSkills,
        missing_skills: matchResult.missingSkills,
        partially_matched: matchResult.partiallyMatched,
        strengths_for_role: matchResult.strengthsForRole,
        recommendations: matchResult.recommendations,
        tailored_bullet_points: matchResult.tailoredBulletPoints,
        interview_prep_questions: matchResult.interviewPrepQuestions
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create job match error:", error);
    return NextResponse.json({ error: "Failed to match job description." }, { status: 500 });
  }
}
