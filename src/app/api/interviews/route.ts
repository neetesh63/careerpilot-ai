import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { interviewsRepo, profilesRepo, auditRepo } from "@/lib/db";
import { aiService } from "@/lib/ai";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = interviewsRepo.listByUserId(auth.user.id);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("List interview sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch interview sessions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let roleTitle = body.roleTitle ? String(body.roleTitle).trim() : "";
    const category = body.category || "technical"; // technical, behavioral, situational, system_design
    const difficulty = body.difficulty || "entry"; // entry, mid, senior
    const totalQuestions = body.totalQuestions ? Math.min(Math.max(Number(body.totalQuestions), 2), 6) : 3;

    if (!roleTitle) {
      const profile = profilesRepo.getByUserId(auth.user.id);
      roleTitle = profile?.target_role || "Full-Stack Software Engineer";
    }

    const questions = await aiService.generateInterviewQuestions(roleTitle, category, difficulty, totalQuestions);

    const session = interviewsRepo.createSession({
      user_id: auth.user.id,
      role_title: roleTitle,
      category,
      difficulty,
      total_questions: questions.length,
      ai_provider: "heuristic"
    });

    interviewsRepo.createQuestions(
      session.id,
      questions.map(q => ({
        question_number: q.questionNumber,
        question_text: q.questionText,
        category: q.category
      }))
    );

    auditRepo.log(auth.user.id, "START", "INTERVIEW_SESSION", session.id, `Started interview practice for ${roleTitle}`);

    const fullSession = interviewsRepo.getSession(session.id, auth.user.id);

    return NextResponse.json({ success: true, session: fullSession }, { status: 201 });
  } catch (error) {
    console.error("Start interview session error:", error);
    return NextResponse.json({ error: "Failed to initialize interview practice." }, { status: 500 });
  }
}
