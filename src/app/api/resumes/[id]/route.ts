import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { resumesRepo, auditRepo } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const resume = resumesRepo.getById(id, auth.user.id);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Get resume error:", error);
    return NextResponse.json({ error: "Failed to fetch resume." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const resume = resumesRepo.getById(id, auth.user.id);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    resumesRepo.delete(id, auth.user.id);
    auditRepo.log(auth.user.id, "DELETE", "RESUME", id, "User deleted resume");

    return NextResponse.json({ success: true, message: "Resume deleted." });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume." }, { status: 500 });
  }
}
