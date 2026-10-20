import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { remindersRepo } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = remindersRepo.listByUserId(auth.user.id);
    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("List reminders error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, dueDate, reminderType, applicationId } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: "Title and due date are required." }, { status: 400 });
    }

    const reminder = remindersRepo.create({
      user_id: auth.user.id,
      application_id: applicationId || null,
      title: String(title).trim(),
      due_date: String(dueDate).trim(),
      reminder_type: reminderType || "follow_up"
    });

    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch (error) {
    console.error("Create reminder error:", error);
    return NextResponse.json({ error: "Failed to create reminder." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isCompleted } = body;

    if (!id) {
      return NextResponse.json({ error: "Reminder ID is required." }, { status: 400 });
    }

    remindersRepo.toggleCompleted(id, auth.user.id, Boolean(isCompleted));
    return NextResponse.json({ success: true, is_completed: isCompleted ? 1 : 0 });
  } catch (error) {
    console.error("Toggle reminder error:", error);
    return NextResponse.json({ error: "Failed to update reminder." }, { status: 500 });
  }
}
