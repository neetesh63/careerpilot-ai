import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { roadmapsRepo, auditRepo } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({
      roadmap: {
        ...roadmap,
        skill_categories: JSON.parse(roadmap.skill_categories || "[]"),
        milestones: roadmap.milestones.map(m => ({
          ...m,
          learning_resources: JSON.parse(m.learning_resources || "[]")
        }))
      }
    });
  } catch (error) {
    console.error("Get roadmap error:", error);
    return NextResponse.json({ error: "Failed to fetch roadmap." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    roadmapsRepo.delete(id, auth.user.id);
    auditRepo.log(auth.user.id, "DELETE", "ROADMAP", id, "User deleted roadmap");

    return NextResponse.json({ success: true, message: "Roadmap deleted." });
  } catch (error) {
    console.error("Delete roadmap error:", error);
    return NextResponse.json({ error: "Failed to delete roadmap." }, { status: 500 });
  }
}
