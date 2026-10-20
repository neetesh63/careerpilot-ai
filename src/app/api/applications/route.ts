import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { applicationsRepo, auditRepo } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();

    let applications = applicationsRepo.listByUserId(auth.user.id);

    if (statusFilter && statusFilter !== "all") {
      applications = applications.filter(a => a.status === statusFilter);
    }

    if (query) {
      applications = applications.filter(a =>
        a.job_title.toLowerCase().includes(query) ||
        a.company.toLowerCase().includes(query) ||
        (a.location && a.location.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("List applications error:", error);
    return NextResponse.json({ error: "Failed to fetch job applications." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobTitle, company, location, employmentType, jobUrl, salaryRange, status, applicationDate, followUpDate, interviewDate, notes, contactPerson } = body;

    if (!jobTitle || !company) {
      return NextResponse.json({ error: "Job title and company name are required." }, { status: 400 });
    }

    const application = applicationsRepo.create({
      user_id: auth.user.id,
      job_title: String(jobTitle).trim(),
      company: String(company).trim(),
      location: location ? String(location).trim() : null,
      employment_type: employmentType || "full_time",
      job_url: jobUrl ? String(jobUrl).trim() : null,
      salary_range: salaryRange ? String(salaryRange).trim() : null,
      status: status || "applied",
      application_date: applicationDate || new Date().toISOString().split("T")[0],
      follow_up_date: followUpDate || null,
      interview_date: interviewDate || null,
      notes: notes ? String(notes).trim() : null,
      contact_person: contactPerson ? String(contactPerson).trim() : null,
      resume_version: body.resumeVersion || null
    });

    auditRepo.log(auth.user.id, "CREATE", "JOB_APPLICATION", application.id, `Created application for ${jobTitle} at ${company}`);

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json({ error: "Failed to save job application." }, { status: 500 });
  }
}
