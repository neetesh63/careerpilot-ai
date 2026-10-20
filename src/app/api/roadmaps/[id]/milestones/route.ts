import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { roadmapsRepo, milestonesRepo } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const roadmap = roadmapsRepo.getById(id, auth.user.id);
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found." }, { status: 404 });
    }

    const body = await req.json();
    const { title, category, description, estimatedWeeks, projectTask, deadlineDate } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const nextOrder = roadmap.milestones.length + 1;
    const milestone = milestonesRepo.add({
      roadmap_id: id,
      milestone_order: nextOrder,
      title: String(title).trim(),
      category: category ? String(category).trim() : "Custom",
      description: String(description).trim(),
      estimated_weeks: estimatedWeeks ? Number(estimatedWeeks) : 2,
      learning_resources: JSON.stringify(body.learningResources || []),
      project_task: projectTask ? String(projectTask).trim() : "Complete milestone learning deliverables.",
      is_completed: 0,
      deadline_date: deadlineDate || null
    });

    return NextResponse.json({ success: true, milestone }, { status: 201 });
  } catch (error) {
    console.error("Add milestone error:", error);
    return NextResponse.json({ error: "Failed to add milestone." }, { status: 500 });
  }
}
