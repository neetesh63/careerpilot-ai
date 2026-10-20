import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { applicationsRepo } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = applicationsRepo.listByUserId(auth.user.id);

    // Build CSV
    const headers = [
      "Job Title",
      "Company",
      "Location",
      "Employment Type",
      "Status",
      "Salary Range",
      "Application Date",
      "Follow Up Date",
      "Interview Date",
      "Notes",
      "Job URL"
    ];

    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = applications.map(a => [
      escapeCsv(a.job_title),
      escapeCsv(a.company),
      escapeCsv(a.location),
      escapeCsv(a.employment_type),
      escapeCsv(a.status),
      escapeCsv(a.salary_range),
      escapeCsv(a.application_date),
      escapeCsv(a.follow_up_date),
      escapeCsv(a.interview_date),
      escapeCsv(a.notes),
      escapeCsv(a.job_url)
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="careerpilot_applications_${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Export applications error:", error);
    return NextResponse.json({ error: "Failed to export applications." }, { status: 500 });
  }
}
