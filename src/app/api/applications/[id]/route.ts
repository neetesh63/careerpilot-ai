import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { applicationsRepo, auditRepo } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const application = applicationsRepo.getById(id, auth.user.id);
    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "Failed to fetch application." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = applicationsRepo.update(id, auth.user.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Application not found or unauthorized." }, { status: 404 });
    }

    auditRepo.log(auth.user.id, "UPDATE", "JOB_APPLICATION", id, `Updated application status to ${body.status || updated.status}`);

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = applicationsRepo.getById(id, auth.user.id);
    if (!existing) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    applicationsRepo.delete(id, auth.user.id);
    auditRepo.log(auth.user.id, "DELETE", "JOB_APPLICATION", id, "User deleted application");

    return NextResponse.json({ success: true, message: "Application removed." });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json({ error: "Failed to delete application." }, { status: 500 });
  }
}
