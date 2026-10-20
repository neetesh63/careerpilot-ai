import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { interviewsRepo } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({
      session: {
        ...session,
        questions: session.questions.map(q => ({
          ...q,
          improvement_tips: q.improvement_tips ? JSON.parse(q.improvement_tips) : []
        }))
      }
    });
  } catch (error) {
    console.error("Get interview session error:", error);
    return NextResponse.json({ error: "Failed to fetch interview session." }, { status: 500 });
  }
}
