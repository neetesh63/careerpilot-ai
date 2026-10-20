import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { interviewsRepo } from "@/lib/db";
import { aiService } from "@/lib/ai";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const session = interviewsRepo.getSession(id, auth.user.id);
    if (!session) {
      return NextResponse.json({ error: "Interview session not found." }, { status: 404 });
    }

    const body = await req.json();
    const { answerId, userAnswer } = body;

    if (!answerId || !userAnswer || String(userAnswer).trim().length < 5) {
      return NextResponse.json({ error: "A substantive written answer is required." }, { status: 400 });
    }

    const question = session.questions.find(q => q.id === answerId);
    if (!question) {
      return NextResponse.json({ error: "Interview question not found in this session." }, { status: 404 });
    }

    // Evaluate answer with AI / Heuristic engine
    const evaluation = await aiService.evaluateInterviewAnswer(
      question.question_text,
      String(userAnswer).trim(),
      question.category
    );

    // Save answer evaluation
    interviewsRepo.saveAnswer(answerId, {
      user_answer: String(userAnswer).trim(),
      score: evaluation.score,
      relevance_score: evaluation.relevanceScore,
      clarity_score: evaluation.clarityScore,
      structure_score: evaluation.structureScore,
      technical_score: evaluation.technicalScore,
      feedback: evaluation.feedback,
      exemplary_answer: evaluation.exemplaryAnswer,
      improvement_tips: JSON.stringify(evaluation.improvementTips)
    });

    // Advance session or complete
    interviewsRepo.advanceOrComplete(session.id, session.current_index, session.total_questions);

    const updatedSession = interviewsRepo.getSession(session.id, auth.user.id);

    return NextResponse.json({
      success: true,
      evaluation,
      session: updatedSession
    });
  } catch (error) {
    console.error("Submit interview answer error:", error);
    return NextResponse.json({ error: "Failed to evaluate interview answer." }, { status: 500 });
  }
}
