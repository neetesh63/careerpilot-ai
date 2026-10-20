import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { resumesRepo, auditRepo } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = resumesRepo.listByUserId(auth.user.id);
    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("List resumes error:", error);
    return NextResponse.json({ error: "Failed to fetch resumes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let rawText = "";
    let fileName = "Resume_" + new Date().toISOString().split("T")[0] + ".txt";
    let fileType = "text/plain";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      rawText = body.rawText || body.text || "";
      if (body.fileName) fileName = body.fileName;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const textParam = formData.get("rawText") as string | null;

      if (file) {
        fileName = file.name;
        fileType = file.type || "text/plain";
        // Check size limit: 5MB
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: "File exceeds 5MB size limit." }, { status: 400 });
        }
        rawText = await file.text();
      } else if (textParam) {
        rawText = textParam;
      }
    }

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ error: "Resume content must contain at least 50 characters of readable text." }, { status: 400 });
    }

    const cleanText = rawText.trim().slice(0, 50000); // 50k character max limit

    const resume = resumesRepo.create({
      user_id: auth.user.id,
      file_name: fileName,
      file_type: fileType,
      raw_text: cleanText
    });

    auditRepo.log(auth.user.id, "UPLOAD", "RESUME", resume.id, `Uploaded resume ${fileName}`);

    return NextResponse.json({ success: true, resume }, { status: 201 });
  } catch (error) {
    console.error("Upload resume error:", error);
    return NextResponse.json({ error: "Failed to process resume." }, { status: 500 });
  }
}
