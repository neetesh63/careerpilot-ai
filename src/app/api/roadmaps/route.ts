import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { roadmapsRepo, milestonesRepo, profilesRepo, auditRepo } from "@/lib/db";
import { aiService } from "@/lib/ai";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roadmaps = roadmapsRepo.listByUserId(auth.user.id);
    const parsed = roadmaps.map(r => ({
      ...r,
      skill_categories: JSON.parse(r.skill_categories || "[]")
    }));

    return NextResponse.json({ roadmaps: parsed });
  } catch (error) {
    console.error("List roadmaps error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmaps." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let targetRole = body.targetRole ? String(body.targetRole).trim() : "";
    const weeklyHours = body.weeklyHours ? Number(body.weeklyHours) : 10;
    const timeframeMonths = body.timeframeMonths ? Number(body.timeframeMonths) : 6;

    if (!targetRole) {
      const profile = profilesRepo.getByUserId(auth.user.id);
      targetRole = profile?.target_role || "Full-Stack Software Engineer";
    }

    const generated = await aiService.generateRoadmap(targetRole, "entry", weeklyHours);

    // Save roadmap
    const roadmap = roadmapsRepo.create({
      user_id: auth.user.id,
      title: generated.title,
      target_role: generated.targetRole,
      timeframe_months: timeframeMonths,
      weekly_hours: weeklyHours,
      skill_categories: JSON.stringify(generated.skillCategories)
    });

    // Save milestones
    milestonesRepo.createBatch(
      roadmap.id,
      generated.milestones.map(m => ({
        milestone_order: m.milestoneOrder,
        title: m.title,
        category: m.category,
        description: m.description,
        estimated_weeks: m.estimatedWeeks,
        learning_resources: JSON.stringify(m.learningResources),
        project_task: m.projectTask,
        deadline_date: m.deadlineDate || null
      }))
    );

    auditRepo.log(auth.user.id, "GENERATE", "ROADMAP", roadmap.id, `Generated career roadmap for ${targetRole}`);

    const fullRoadmap = roadmapsRepo.getById(roadmap.id, auth.user.id);

    return NextResponse.json({
      success: true,
      roadmap: {
        ...fullRoadmap,
        skill_categories: generated.skillCategories,
        milestones: fullRoadmap?.milestones.map(m => ({
          ...m,
          learning_resources: JSON.parse(m.learning_resources || "[]")
        }))
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Generate roadmap error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap." }, { status: 500 });
  }
}
