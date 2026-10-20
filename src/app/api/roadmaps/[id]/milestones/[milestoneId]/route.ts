import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { roadmapsRepo, milestonesRepo } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, milestoneId } = await params;
    const roadmap = roadmapsRepo.getById(id, auth.user.id);
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found." }, { status: 404 });
    }

    const body = await req.json();
    const isCompleted = Boolean(body.isCompleted ?? body.is_completed);

    milestonesRepo.toggleCompleted(milestoneId, isCompleted);
    const updatedPct = roadmapsRepo.recalcProgress(id);

    return NextResponse.json({ success: true, is_completed: isCompleted ? 1 : 0, progress_percent: updatedPct });
  } catch (error) {
    console.error("Toggle milestone error:", error);
    return NextResponse.json({ error: "Failed to update milestone status." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, milestoneId } = await params;
    const roadmap = roadmapsRepo.getById(id, auth.user.id);
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found." }, { status: 404 });
    }

    milestonesRepo.delete(milestoneId);
    return NextResponse.json({ success: true, message: "Milestone removed." });
  } catch (error) {
    console.error("Delete milestone error:", error);
    return NextResponse.json({ error: "Failed to delete milestone." }, { status: 500 });
  }
}
