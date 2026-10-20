import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Ensure data folder exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "careerpilot.db");
let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
    // Enable foreign keys and WAL mode for reliability and concurrency
    dbInstance.exec("PRAGMA foreign_keys = ON;");
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, "utf-8");
    db.exec(sql);
  }
  try {
    const count = db.prepare("SELECT COUNT(*) as c FROM users;").get() as { c: number };
    if (count.c === 0) {
      setTimeout(() => {
        import("./seed").then(m => m.seedDatabase()).catch(console.error);
      }, 0);
    }
  } catch {
    // schema might be creating
  }
}

// Ensure unique IDs
export function generateId(): string {
  return crypto.randomUUID();
}

// ---------------- USER REPOSITORY ----------------
export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const usersRepo = {
  create(data: { email: string; password_hash: string; salt: string; name: string; role?: string }): UserRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, name, role)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    const record = stmt.get(id, data.email.toLowerCase().trim(), data.password_hash, data.salt, data.name, data.role || "job_seeker") as UserRecord;
    
    // Auto-create initial blank profile
    const profileStmt = db.prepare(`
      INSERT OR IGNORE INTO user_profiles (user_id, headline, current_stage, target_role, skills_data)
      VALUES (?, '', 'student', '', '[]');
    `);
    profileStmt.run(id);

    return record;
  },

  findByEmail(email: string): UserRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE email = ? LIMIT 1;");
    const user = stmt.get(email.toLowerCase().trim()) as UserRecord | undefined;
    return user || null;
  },

  findById(id: string): UserRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1;");
    const user = stmt.get(id) as UserRecord | undefined;
    return user || null;
  },

  count(): number {
    const db = getDatabase();
    const stmt = db.prepare("SELECT COUNT(*) as count FROM users;");
    const result = stmt.get() as { count: number };
    return result.count;
  }
};

// ---------------- PROFILE REPOSITORY ----------------
export interface UserProfileRecord {
  user_id: string;
  headline: string | null;
  phone: string | null;
  location: string | null;
  current_stage: string;
  target_role: string | null;
  target_industry: string | null;
  experience_level: string;
  education_data: string | null;
  skills_data: string | null;
  projects_data: string | null;
  certifications_data: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  bio: string | null;
  onboarding_completed: number;
  created_at: string;
  updated_at: string;
}

export const profilesRepo = {
  getByUserId(userId: string): UserProfileRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM user_profiles WHERE user_id = ?;");
    const profile = stmt.get(userId) as UserProfileRecord | undefined;
    return profile || null;
  },

  upsert(userId: string, data: Partial<UserProfileRecord>): UserProfileRecord {
    const db = getDatabase();
    const existing = this.getByUserId(userId);
    
    if (existing) {
      const stmt = db.prepare(`
        UPDATE user_profiles SET
          headline = COALESCE(?, headline),
          phone = COALESCE(?, phone),
          location = COALESCE(?, location),
          current_stage = COALESCE(?, current_stage),
          target_role = COALESCE(?, target_role),
          target_industry = COALESCE(?, target_industry),
          experience_level = COALESCE(?, experience_level),
          education_data = COALESCE(?, education_data),
          skills_data = COALESCE(?, skills_data),
          projects_data = COALESCE(?, projects_data),
          certifications_data = COALESCE(?, certifications_data),
          portfolio_url = COALESCE(?, portfolio_url),
          linkedin_url = COALESCE(?, linkedin_url),
          github_url = COALESCE(?, github_url),
          bio = COALESCE(?, bio),
          onboarding_completed = COALESCE(?, onboarding_completed),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        RETURNING *;
      `);
      return stmt.get(
        data.headline ?? null,
        data.phone ?? null,
        data.location ?? null,
        data.current_stage ?? null,
        data.target_role ?? null,
        data.target_industry ?? null,
        data.experience_level ?? null,
        data.education_data ?? null,
        data.skills_data ?? null,
        data.projects_data ?? null,
        data.certifications_data ?? null,
        data.portfolio_url ?? null,
        data.linkedin_url ?? null,
        data.github_url ?? null,
        data.bio ?? null,
        data.onboarding_completed ?? null,
        userId
      ) as UserProfileRecord;
    } else {
      const stmt = db.prepare(`
        INSERT INTO user_profiles (
          user_id, headline, phone, location, current_stage, target_role,
          target_industry, experience_level, education_data, skills_data,
          projects_data, certifications_data, portfolio_url, linkedin_url,
          github_url, bio, onboarding_completed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *;
      `);
      return stmt.get(
        userId,
        data.headline ?? "",
        data.phone ?? "",
        data.location ?? "",
        data.current_stage ?? "student",
        data.target_role ?? "",
        data.target_industry ?? "",
        data.experience_level ?? "entry",
        data.education_data ?? "[]",
        data.skills_data ?? "[]",
        data.projects_data ?? "[]",
        data.certifications_data ?? "[]",
        data.portfolio_url ?? "",
        data.linkedin_url ?? "",
        data.github_url ?? "",
        data.bio ?? "",
        data.onboarding_completed ?? 1
      ) as UserProfileRecord;
    }
  }
};

// ---------------- RESUME & ANALYSIS REPOSITORY ----------------
export interface ResumeRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  raw_text: string;
  parsed_json: string | null;
  created_at: string;
}

export interface ResumeAnalysisRecord {
  id: string;
  user_id: string;
  resume_id: string | null;
  overall_score: number;
  summary: string;
  skills_detected: string;
  strengths: string;
  weaknesses: string;
  improvements: string;
  keyword_gaps: string;
  formatting_score: number;
  impact_score: number;
  skills_score: number;
  recommended_roles: string;
  ai_provider: string;
  created_at: string;
}

export const resumesRepo = {
  create(data: { user_id: string; file_name: string; file_type: string; raw_text: string; parsed_json?: string }): ResumeRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO resumes (id, user_id, file_name, file_type, raw_text, parsed_json)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    return stmt.get(id, data.user_id, data.file_name, data.file_type, data.raw_text, data.parsed_json || null) as ResumeRecord;
  },

  listByUserId(userId: string): ResumeRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC;");
    return stmt.all(userId) as unknown as ResumeRecord[];
  },

  getById(id: string, userId: string): ResumeRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM resumes WHERE id = ? AND user_id = ?;");
    const res = stmt.get(id, userId) as ResumeRecord | undefined;
    return res || null;
  },

  delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM resumes WHERE id = ? AND user_id = ?;");
    stmt.run(id, userId);
    return true;
  }
};

export const resumeAnalysesRepo = {
  create(data: Omit<ResumeAnalysisRecord, "id" | "created_at">): ResumeAnalysisRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO resume_analyses (
        id, user_id, resume_id, overall_score, summary, skills_detected,
        strengths, weaknesses, improvements, keyword_gaps, formatting_score,
        impact_score, skills_score, recommended_roles, ai_provider
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    return stmt.get(
      id, data.user_id, data.resume_id, data.overall_score, data.summary,
      data.skills_detected, data.strengths, data.weaknesses, data.improvements,
      data.keyword_gaps, data.formatting_score, data.impact_score, data.skills_score,
      data.recommended_roles, data.ai_provider
    ) as ResumeAnalysisRecord;
  },

  listByUserId(userId: string): ResumeAnalysisRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC;");
    return stmt.all(userId) as unknown as ResumeAnalysisRecord[];
  },

  getLatest(userId: string): ResumeAnalysisRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;");
    const res = stmt.get(userId) as ResumeAnalysisRecord | undefined;
    return res || null;
  },

  getById(id: string, userId: string): ResumeAnalysisRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?;");
    const res = stmt.get(id, userId) as ResumeAnalysisRecord | undefined;
    return res || null;
  }
};

// ---------------- JOB MATCH REPOSITORY ----------------
export interface JobMatchRecord {
  id: string;
  user_id: string;
  job_title: string;
  company: string | null;
  job_description: string;
  match_score: number;
  matched_skills: string;
  missing_skills: string;
  partially_matched: string;
  strengths_for_role: string;
  recommendations: string;
  tailored_bullet_points: string;
  interview_prep_questions: string;
  ai_provider: string;
  created_at: string;
}

export const jobMatchesRepo = {
  create(data: Omit<JobMatchRecord, "id" | "created_at">): JobMatchRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO job_matches (
        id, user_id, job_title, company, job_description, match_score,
        matched_skills, missing_skills, partially_matched, strengths_for_role,
        recommendations, tailored_bullet_points, interview_prep_questions, ai_provider
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    return stmt.get(
      id, data.user_id, data.job_title, data.company, data.job_description,
      data.match_score, data.matched_skills, data.missing_skills,
      data.partially_matched, data.strengths_for_role, data.recommendations,
      data.tailored_bullet_points, data.interview_prep_questions, data.ai_provider
    ) as JobMatchRecord;
  },

  listByUserId(userId: string): JobMatchRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM job_matches WHERE user_id = ? ORDER BY created_at DESC;");
    return stmt.all(userId) as unknown as JobMatchRecord[];
  },

  getById(id: string, userId: string): JobMatchRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM job_matches WHERE id = ? AND user_id = ?;");
    const res = stmt.get(id, userId) as JobMatchRecord | undefined;
    return res || null;
  },

  delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM job_matches WHERE id = ? AND user_id = ?;");
    stmt.run(id, userId);
    return true;
  }
};

// ---------------- ROADMAP REPOSITORY ----------------
export interface RoadmapRecord {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  timeframe_months: number;
  weekly_hours: number;
  skill_categories: string;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface MilestoneRecord {
  id: string;
  roadmap_id: string;
  milestone_order: number;
  title: string;
  category: string;
  description: string;
  estimated_weeks: number;
  learning_resources: string;
  project_task: string;
  is_completed: number;
  deadline_date: string | null;
  created_at: string;
}

export const roadmapsRepo = {
  create(data: Omit<RoadmapRecord, "id" | "progress_percent" | "created_at" | "updated_at">): RoadmapRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO career_roadmaps (id, user_id, title, target_role, timeframe_months, weekly_hours, skill_categories)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    return stmt.get(id, data.user_id, data.title, data.target_role, data.timeframe_months, data.weekly_hours, data.skill_categories) as RoadmapRecord;
  },

  listByUserId(userId: string): RoadmapRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM career_roadmaps WHERE user_id = ? ORDER BY created_at DESC;");
    return stmt.all(userId) as unknown as RoadmapRecord[];
  },

  getById(id: string, userId: string): (RoadmapRecord & { milestones: MilestoneRecord[] }) | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM career_roadmaps WHERE id = ? AND user_id = ?;");
    const roadmap = stmt.get(id, userId) as RoadmapRecord | undefined;
    if (!roadmap) return null;

    const mStmt = db.prepare("SELECT * FROM roadmap_milestones WHERE roadmap_id = ? ORDER BY milestone_order ASC;");
    const milestones = mStmt.all(id) as unknown as MilestoneRecord[];

    return { ...roadmap, milestones };
  },

  delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM career_roadmaps WHERE id = ? AND user_id = ?;");
    stmt.run(id, userId);
    return true;
  },

  recalcProgress(roadmapId: string): number {
    const db = getDatabase();
    const countStmt = db.prepare("SELECT COUNT(*) as total, SUM(is_completed) as completed FROM roadmap_milestones WHERE roadmap_id = ?;");
    const stats = countStmt.get(roadmapId) as { total: number; completed: number | null };
    const pct = stats.total > 0 ? Math.round(((stats.completed || 0) / stats.total) * 100) : 0;
    
    db.prepare("UPDATE career_roadmaps SET progress_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;").run(pct, roadmapId);
    return pct;
  }
};

export const milestonesRepo = {
  createBatch(roadmapId: string, milestones: Array<Omit<MilestoneRecord, "id" | "roadmap_id" | "is_completed" | "created_at">>): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO roadmap_milestones (
        id, roadmap_id, milestone_order, title, category, description,
        estimated_weeks, learning_resources, project_task, deadline_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);
    for (const m of milestones) {
      stmt.run(
        generateId(), roadmapId, m.milestone_order, m.title, m.category,
        m.description, m.estimated_weeks, m.learning_resources, m.project_task,
        m.deadline_date || null
      );
    }
  },

  toggleCompleted(milestoneId: string, isCompleted: boolean): boolean {
    const db = getDatabase();
    const stmt = db.prepare("UPDATE roadmap_milestones SET is_completed = ? WHERE id = ?;");
    stmt.run(isCompleted ? 1 : 0, milestoneId);

    const m = db.prepare("SELECT roadmap_id FROM roadmap_milestones WHERE id = ?;").get(milestoneId) as { roadmap_id: string } | undefined;
    if (m) {
      roadmapsRepo.recalcProgress(m.roadmap_id);
    }
    return true;
  },

  add(data: Omit<MilestoneRecord, "id" | "created_at">): MilestoneRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO roadmap_milestones (
        id, roadmap_id, milestone_order, title, category, description,
        estimated_weeks, learning_resources, project_task, is_completed, deadline_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    const record = stmt.get(
      id, data.roadmap_id, data.milestone_order, data.title, data.category,
      data.description, data.estimated_weeks, data.learning_resources,
      data.project_task, data.is_completed ?? 0, data.deadline_date || null
    ) as MilestoneRecord;

    roadmapsRepo.recalcProgress(data.roadmap_id);
    return record;
  },

  delete(milestoneId: string): boolean {
    const db = getDatabase();
    const m = db.prepare("SELECT roadmap_id FROM roadmap_milestones WHERE id = ?;").get(milestoneId) as { roadmap_id: string } | undefined;
    db.prepare("DELETE FROM roadmap_milestones WHERE id = ?;").run(milestoneId);
    if (m) {
      roadmapsRepo.recalcProgress(m.roadmap_id);
    }
    return true;
  }
};

// ---------------- INTERVIEW REPOSITORY ----------------
export interface InterviewSessionRecord {
  id: string;
  user_id: string;
  role_title: string;
  category: string;
  difficulty: string;
  total_questions: number;
  current_index: number;
  is_completed: number;
  overall_score: number;
  overall_summary: string | null;
  ai_provider: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewAnswerRecord {
  id: string;
  session_id: string;
  question_number: number;
  question_text: string;
  category: string;
  user_answer: string | null;
  score: number | null;
  relevance_score: number | null;
  clarity_score: number | null;
  structure_score: number | null;
  technical_score: number | null;
  feedback: string | null;
  exemplary_answer: string | null;
  improvement_tips: string | null;
  created_at: string;
}

export const interviewsRepo = {
  createSession(data: Omit<InterviewSessionRecord, "id" | "current_index" | "is_completed" | "overall_score" | "overall_summary" | "created_at" | "updated_at">): InterviewSessionRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO interview_sessions (id, user_id, role_title, category, difficulty, total_questions, ai_provider)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    return stmt.get(id, data.user_id, data.role_title, data.category, data.difficulty, data.total_questions, data.ai_provider) as InterviewSessionRecord;
  },

  listByUserId(userId: string): InterviewSessionRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC;");
    return stmt.all(userId) as unknown as InterviewSessionRecord[];
  },

  getSession(id: string, userId: string): (InterviewSessionRecord & { questions: InterviewAnswerRecord[] }) | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?;");
    const session = stmt.get(id, userId) as InterviewSessionRecord | undefined;
    if (!session) return null;

    const qStmt = db.prepare("SELECT * FROM interview_answers WHERE session_id = ? ORDER BY question_number ASC;");
    const questions = qStmt.all(id) as unknown as InterviewAnswerRecord[];

    return { ...session, questions };
  },

  createQuestions(sessionId: string, questions: Array<{ question_number: number; question_text: string; category: string }>): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO interview_answers (id, session_id, question_number, question_text, category)
      VALUES (?, ?, ?, ?, ?);
    `);
    for (const q of questions) {
      stmt.run(generateId(), sessionId, q.question_number, q.question_text, q.category);
    }
  },

  saveAnswer(answerId: string, data: {
    user_answer: string;
    score: number;
    relevance_score: number;
    clarity_score: number;
    structure_score: number;
    technical_score: number;
    feedback: string;
    exemplary_answer: string;
    improvement_tips: string;
  }): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE interview_answers SET
        user_answer = ?,
        score = ?,
        relevance_score = ?,
        clarity_score = ?,
        structure_score = ?,
        technical_score = ?,
        feedback = ?,
        exemplary_answer = ?,
        improvement_tips = ?
      WHERE id = ?;
    `);
    stmt.run(
      data.user_answer, data.score, data.relevance_score, data.clarity_score,
      data.structure_score, data.technical_score, data.feedback,
      data.exemplary_answer, data.improvement_tips, answerId
    );
  },

  advanceOrComplete(sessionId: string, currentIndex: number, totalQuestions: number): void {
    const db = getDatabase();
    const nextIndex = currentIndex + 1;
    const isCompleted = nextIndex >= totalQuestions ? 1 : 0;

    // Recalculate average score if completed
    let avgScore = 0;
    if (isCompleted) {
      const avgStmt = db.prepare("SELECT AVG(score) as avg_score FROM interview_answers WHERE session_id = ? AND score IS NOT NULL;");
      const res = avgStmt.get(sessionId) as { avg_score: number | null };
      avgScore = Math.round(res.avg_score || 0);
    }

    db.prepare(`
      UPDATE interview_sessions SET
        current_index = ?,
        is_completed = ?,
        overall_score = CASE WHEN ? = 1 THEN ? ELSE overall_score END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `).run(nextIndex, isCompleted, isCompleted, avgScore, sessionId);
  }
};

// ---------------- JOB APPLICATION TRACKER REPOSITORY ----------------
export interface JobApplicationRecord {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  location: string | null;
  employment_type: string;
  job_url: string | null;
  salary_range: string | null;
  status: string;
  application_date: string | null;
  follow_up_date: string | null;
  interview_date: string | null;
  notes: string | null;
  contact_person: string | null;
  resume_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJobApplicationInput {
  user_id: string;
  job_title: string;
  company: string;
  location?: string | null;
  employment_type?: string;
  job_url?: string | null;
  salary_range?: string | null;
  status?: string;
  application_date?: string | null;
  follow_up_date?: string | null;
  interview_date?: string | null;
  notes?: string | null;
  contact_person?: string | null;
  resume_version?: string | null;
}

export const applicationsRepo = {
  create(data: CreateJobApplicationInput): JobApplicationRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO job_applications (
        id, user_id, job_title, company, location, employment_type,
        job_url, salary_range, status, application_date, follow_up_date,
        interview_date, notes, contact_person, resume_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    const app = stmt.get(
      id, data.user_id, data.job_title, data.company, data.location || null,
      data.employment_type || "full_time", data.job_url || null,
      data.salary_range || null, data.status || "applied",
      data.application_date || new Date().toISOString().split("T")[0],
      data.follow_up_date || null, data.interview_date || null,
      data.notes || null, data.contact_person || null, data.resume_version || null
    ) as JobApplicationRecord;

    // Auto-create reminder if follow-up date is provided
    if (data.follow_up_date) {
      remindersRepo.create({
        user_id: data.user_id,
        application_id: id,
        title: `Follow up with ${data.company} (${data.job_title})`,
        due_date: data.follow_up_date,
        reminder_type: "follow_up"
      });
    }

    return app;
  },

  listByUserId(userId: string): JobApplicationRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC;");
    return stmt.all(userId) as unknown as JobApplicationRecord[];
  },

  getById(id: string, userId: string): JobApplicationRecord | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM job_applications WHERE id = ? AND user_id = ?;");
    const res = stmt.get(id, userId) as JobApplicationRecord | undefined;
    return res || null;
  },

  update(id: string, userId: string, data: Partial<JobApplicationRecord>): JobApplicationRecord | null {
    const db = getDatabase();
    const existing = this.getById(id, userId);
    if (!existing) return null;

    const stmt = db.prepare(`
      UPDATE job_applications SET
        job_title = COALESCE(?, job_title),
        company = COALESCE(?, company),
        location = COALESCE(?, location),
        employment_type = COALESCE(?, employment_type),
        job_url = COALESCE(?, job_url),
        salary_range = COALESCE(?, salary_range),
        status = COALESCE(?, status),
        application_date = COALESCE(?, application_date),
        follow_up_date = COALESCE(?, follow_up_date),
        interview_date = COALESCE(?, interview_date),
        notes = COALESCE(?, notes),
        contact_person = COALESCE(?, contact_person),
        resume_version = COALESCE(?, resume_version),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
      RETURNING *;
    `);

    return stmt.get(
      data.job_title ?? null,
      data.company ?? null,
      data.location ?? null,
      data.employment_type ?? null,
      data.job_url ?? null,
      data.salary_range ?? null,
      data.status ?? null,
      data.application_date ?? null,
      data.follow_up_date ?? null,
      data.interview_date ?? null,
      data.notes ?? null,
      data.contact_person ?? null,
      data.resume_version ?? null,
      id,
      userId
    ) as JobApplicationRecord;
  },

  delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM job_applications WHERE id = ? AND user_id = ?;");
    stmt.run(id, userId);
    return true;
  }
};

// ---------------- REMINDERS REPOSITORY ----------------
export interface ReminderRecord {
  id: string;
  user_id: string;
  application_id: string | null;
  title: string;
  due_date: string;
  is_completed: number;
  reminder_type: string;
  created_at: string;
}

export const remindersRepo = {
  create(data: Omit<ReminderRecord, "id" | "is_completed" | "created_at">): ReminderRecord {
    const db = getDatabase();
    const id = generateId();
    const stmt = db.prepare(`
      INSERT INTO reminders (id, user_id, application_id, title, due_date, reminder_type)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *;
    `);
    return stmt.get(id, data.user_id, data.application_id || null, data.title, data.due_date, data.reminder_type || "follow_up") as ReminderRecord;
  },

  listByUserId(userId: string): ReminderRecord[] {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM reminders WHERE user_id = ? ORDER BY due_date ASC;");
    return stmt.all(userId) as unknown as ReminderRecord[];
  },

  toggleCompleted(id: string, userId: string, isCompleted: boolean): boolean {
    const db = getDatabase();
    const stmt = db.prepare("UPDATE reminders SET is_completed = ? WHERE id = ? AND user_id = ?;");
    stmt.run(isCompleted ? 1 : 0, id, userId);
    return true;
  },

  delete(id: string, userId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM reminders WHERE id = ? AND user_id = ?;");
    stmt.run(id, userId);
    return true;
  }
};

// ---------------- AUDIT LOG REPOSITORY ----------------
export const auditRepo = {
  log(userId: string | null, action: string, entityType: string, entityId?: string, details?: string, ip?: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);
    stmt.run(generateId(), userId, action, entityType, entityId || null, details || null, ip || null);
  }
};

// ---------------- DASHBOARD AGGREGATOR ----------------
export const dashboardRepo = {
  getStats(userId: string) {
    const db = getDatabase();

    // 1. Applications by status
    const appRows = db.prepare("SELECT status, COUNT(*) as count FROM job_applications WHERE user_id = ? GROUP BY status;").all(userId) as unknown as Array<{ status: string; count: number }>;
    const appStats: Record<string, number> = {
      interested: 0,
      preparing: 0,
      applied: 0,
      assessment: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0
    };
    let totalApplications = 0;
    for (const r of appRows) {
      if (appStats[r.status] !== undefined) {
        appStats[r.status] = r.count;
      }
      totalApplications += r.count;
    }

    // 2. Latest resume score
    const latestAnalysis = db.prepare("SELECT overall_score, formatting_score, impact_score, skills_score, created_at FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;").get(userId) as { overall_score: number; formatting_score: number; impact_score: number; skills_score: number; created_at: string } | undefined;

    // 3. Roadmap progress
    const roadmap = db.prepare("SELECT title, target_role, progress_percent FROM career_roadmaps WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1;").get(userId) as { title: string; target_role: string; progress_percent: number } | undefined;

    // 4. Interview session stats
    const interviewCount = db.prepare("SELECT COUNT(*) as total, AVG(overall_score) as avg_score FROM interview_sessions WHERE user_id = ? AND is_completed = 1;").get(userId) as { total: number; avg_score: number | null };

    // 5. Upcoming reminders
    const reminders = db.prepare("SELECT * FROM reminders WHERE user_id = ? AND is_completed = 0 ORDER BY due_date ASC LIMIT 5;").all(userId) as unknown as ReminderRecord[];

    // 6. Profile completion check
    const profile = profilesRepo.getByUserId(userId);
    let profilePercent = 20; // Base for registering
    if (profile) {
      if (profile.headline && profile.headline.length > 3) profilePercent += 15;
      if (profile.target_role && profile.target_role.length > 2) profilePercent += 15;
      if (profile.skills_data && JSON.parse(profile.skills_data || "[]").length > 0) profilePercent += 20;
      if (profile.education_data && JSON.parse(profile.education_data || "[]").length > 0) profilePercent += 15;
      if (profile.bio && profile.bio.length > 10) profilePercent += 15;
    }

    return {
      totalApplications,
      applicationsByStatus: appStats,
      activeInterviews: appStats.interview,
      offersReceived: appStats.offer,
      latestResumeScore: latestAnalysis?.overall_score || null,
      resumeBreakdown: latestAnalysis || null,
      activeRoadmap: roadmap || null,
      completedInterviewsCount: interviewCount.total || 0,
      averageInterviewScore: Math.round(interviewCount.avg_score || 0),
      upcomingReminders: reminders,
      profileCompletionPercent: Math.min(profilePercent, 100)
    };
  }
};
