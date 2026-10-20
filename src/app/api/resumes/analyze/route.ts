import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { resumesRepo, resumeAnalysesRepo, auditRepo } from "@/lib/db";
import { aiService } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, resumeText } = body;

    let textToAnalyze = "";
    let linkedResumeId: string | null = null;

    if (resumeId) {
      const resume = resumesRepo.getById(resumeId, auth.user.id);
      if (!resume) {
        return NextResponse.json({ error: "Selected resume not found." }, { status: 404 });
      }
      textToAnalyze = resume.raw_text;
      linkedResumeId = resume.id;
    } else if (resumeText) {
      textToAnalyze = String(resumeText).trim();
    } else {
      // Check latest resume
      const resumes = resumesRepo.listByUserId(auth.user.id);
      if (resumes.length > 0) {
        textToAnalyze = resumes[0].raw_text;
        linkedResumeId = resumes[0].id;
      }
    }

    if (!textToAnalyze || textToAnalyze.length < 50) {
      return NextResponse.json({ error: "Please provide a resume with at least 50 characters to analyze." }, { status: 400 });
    }

    // Run AI analysis
    const analysis = await aiService.analyzeResume(textToAnalyze);

    // Save analysis record in database
    const saved = resumeAnalysesRepo.create({
      user_id: auth.user.id,
      resume_id: linkedResumeId,
      overall_score: analysis.overallScore,
      summary: analysis.summary,
      skills_detected: JSON.stringify(analysis.skillsDetected),
      strengths: JSON.stringify(analysis.strengths),
      weaknesses: JSON.stringify(analysis.weaknesses),
      improvements: JSON.stringify(analysis.improvements),
      keyword_gaps: JSON.stringify(analysis.keywordGaps),
      formatting_score: analysis.formattingScore,
      impact_score: analysis.impactScore,
      skills_score: analysis.skillsScore,
      recommended_roles: JSON.stringify(analysis.recommendedRoles),
      ai_provider: analysis.provider
    });

    auditRepo.log(auth.user.id, "ANALYZE", "RESUME", saved.id, `Analyzed resume with score ${analysis.overallScore}`);

    return NextResponse.json({
      success: true,
      analysis: {
        ...saved,
        skills_detected: analysis.skillsDetected,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        improvements: analysis.improvements,
        keyword_gaps: analysis.keywordGaps,
        recommended_roles: analysis.recommendedRoles
      }
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json({ error: "Failed to complete resume analysis." }, { status: 500 });
  }
}
