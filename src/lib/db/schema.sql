-- CareerPilot AI Relational Database Schema
-- Designed for high data integrity, strict foreign keys, indexing, and cascade rules

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'job_seeker',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    headline TEXT,
    phone TEXT,
    location TEXT,
    current_stage TEXT DEFAULT 'student', -- student, fresh_grad, career_changer, job_seeker
    target_role TEXT,
    target_industry TEXT,
    experience_level TEXT DEFAULT 'entry', -- entry, mid, senior
    education_data TEXT, -- JSON array: [{ institution, degree, field, gradYear }]
    skills_data TEXT, -- JSON array: string[]
    projects_data TEXT, -- JSON array: [{ title, description, techStack, link }]
    certifications_data TEXT, -- JSON array: [{ name, issuer, year }]
    portfolio_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    bio TEXT,
    onboarding_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    parsed_json TEXT, -- JSON extracted sections
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resume_analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    resume_id TEXT,
    overall_score INTEGER NOT NULL,
    summary TEXT NOT NULL,
    skills_detected TEXT NOT NULL, -- JSON array
    strengths TEXT NOT NULL, -- JSON array
    weaknesses TEXT NOT NULL, -- JSON array
    improvements TEXT NOT NULL, -- JSON array: [{ section, suggestion, before, after }]
    keyword_gaps TEXT NOT NULL, -- JSON array
    formatting_score INTEGER NOT NULL,
    impact_score INTEGER NOT NULL,
    skills_score INTEGER NOT NULL,
    recommended_roles TEXT NOT NULL, -- JSON array
    ai_provider TEXT DEFAULT 'heuristic', -- gemini, openai, heuristic
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS job_matches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT,
    job_description TEXT NOT NULL,
    match_score INTEGER NOT NULL,
    matched_skills TEXT NOT NULL, -- JSON array
    missing_skills TEXT NOT NULL, -- JSON array
    partially_matched TEXT NOT NULL, -- JSON array
    strengths_for_role TEXT NOT NULL, -- JSON array
    recommendations TEXT NOT NULL, -- JSON array
    tailored_bullet_points TEXT NOT NULL, -- JSON array
    interview_prep_questions TEXT NOT NULL, -- JSON array
    ai_provider TEXT DEFAULT 'heuristic',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_roadmaps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_role TEXT NOT NULL,
    timeframe_months INTEGER DEFAULT 6,
    weekly_hours INTEGER DEFAULT 10,
    skill_categories TEXT NOT NULL, -- JSON array
    progress_percent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id TEXT PRIMARY KEY,
    roadmap_id TEXT NOT NULL,
    milestone_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_weeks INTEGER NOT NULL,
    learning_resources TEXT NOT NULL, -- JSON array: [{ name, url, type }]
    project_task TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    deadline_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(roadmap_id) REFERENCES career_roadmaps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interview_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role_title TEXT NOT NULL,
    category TEXT NOT NULL, -- technical, behavioral, situational, system_design
    difficulty TEXT NOT NULL, -- entry, mid, senior
    total_questions INTEGER NOT NULL,
    current_index INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    overall_score INTEGER DEFAULT 0,
    overall_summary TEXT,
    ai_provider TEXT DEFAULT 'heuristic',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interview_answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    user_answer TEXT,
    score INTEGER,
    relevance_score INTEGER,
    clarity_score INTEGER,
    structure_score INTEGER,
    technical_score INTEGER,
    feedback TEXT,
    exemplary_answer TEXT,
    improvement_tips TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    employment_type TEXT DEFAULT 'full_time', -- full_time, part_time, contract, internship, remote
    job_url TEXT,
    salary_range TEXT,
    status TEXT DEFAULT 'applied', -- interested, preparing, applied, assessment, interview, offer, rejected, withdrawn
    application_date TEXT,
    follow_up_date TEXT,
    interview_date TEXT,
    notes TEXT,
    contact_person TEXT,
    resume_version TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    application_id TEXT,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    reminder_type TEXT DEFAULT 'follow_up', -- follow_up, interview, prep, milestone
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_id ON career_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_roadmap_id ON roadmap_milestones(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session_id ON interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
