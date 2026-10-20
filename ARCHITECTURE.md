# CAREERPILOT AI — SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATION

**Application:** CareerPilot AI  
**Framework:** Next.js 16 (App Router) + React 19 + TypeScript  
**Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens  
**Database:** SQLite (`node:sqlite` Native DatabaseSync)  
**Security:** PBKDF2 (100k rounds) + HMAC-SHA256 Signed Sessions  
**AI Engine:** Google Gemini API with Deterministic 250+ Skill Heuristic Fallback  

---

## 1. System Overview

CareerPilot AI is an autonomous career development platform engineered to guide job seekers, recent graduates, and software engineers from initial skill discovery to job offer acquisition. The platform unifies resume auditing, job description gap analysis, personalized skill roadmaps, AI mock interview preparation, and full-lifecycle job application tracking into a coherent, high-performance SaaS.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                    │
│   Landing Page (/) • Auth (/login, /register) • Onboarding   │
│   Dashboard Shell (/dashboard, /resume-analyzer, /roadmap,  │
│   /job-matching, /interview-prep, /applications, /profile)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      REST API Handlers       │ │     Security & Session     │
│   14 Endpoints (/api/*)      │ │   PBKDF2 Hashing (100k)    │
│   Validated Request DTOs     │ │   HMAC-SHA256 Tokens       │
│   Status Codes & JSON Resp   │ │   HttpOnly SameSite Cookie │
└──────────────┬───────────────┘ └────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 AI Intelligence Layer                       │
│  Dual-Engine: Gemini API + Fallback Deterministic Engine    │
│  250+ Skill Ontology • STAR Rubric • Roadmap Milestones     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Database Repository Layer (db/index.ts)         │
│  Node 24 `node:sqlite` • Write-Ahead Logging (WAL) Mode     │
│  10 Relational Tables • Foreign Keys • Cascade Deletions    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Layered Architecture

### 2.1 Presentation Layer (Client Pages & UI System)
- **App Router Directory:** [`src/app`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/app)
- **Design Tokens:** Deep Midnight (`#17162E`), Deep Surface (`#22213F`), Electric Violet (`#7667F7`), and Soft Ivory (`#F8F7F2`).
- **Dashboard Shell:** [`src/components/layout/DashboardShell.tsx`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/components/layout/DashboardShell.tsx) provides unified navigation, authenticated route guards, user profile status display, and responsive desktop/mobile drawers.
- **Component Primitives:** Accessible modals ([`Modal.tsx`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/components/ui/Modal.tsx)), status badges ([`Badge.tsx`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/components/ui/Badge.tsx)), and alerts ([`Alert.tsx`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/components/ui/Alert.tsx)).

### 2.2 Security & Authentication Layer
- **File:** [`src/lib/auth/crypto.ts`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/lib/auth/crypto.ts) and [`src/lib/auth/session.ts`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/lib/auth/session.ts)
- **Password Protection:** PBKDF2 with 100,000 iterations, 64-byte salt, sha512 digest.
- **Session Mechanism:** Stateless HMAC-SHA256 signed tokens stored in `careerpilot_session` cookies:
  - Cookie attributes: `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 7 days`.
  - Format: `<userId>.<timestamp>.<hexSignature>`.
  - Verification: Cryptographic timing-safe comparison to prevent timing attacks.

### 2.3 AI Intelligence & Heuristic Orchestration Layer
- **File:** [`src/lib/ai/index.ts`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/lib/ai/index.ts) and [`src/lib/ai/heuristic.ts`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/lib/ai/heuristic.ts)
- **Dual Mode Operation:**
  1. **Google Gemini Engine:** Invoked via REST request when `GEMINI_API_KEY` is defined.
  2. **Deterministic Heuristic Engine:** Instant zero-cost offline engine that:
     - Parses resumes and calculates dimension scores: Impact (quantifiable achievements), Brevity, Technical Skills, and Formatting Clarity.
     - Performs set-intersection skill matching against job descriptions and provides automated bullet rewrites.
     - Generates 3-phase career milestones with verified documentation links (MDN, React, Kubernetes, AWS).
     - Generates technical and STAR behavioral interview questions with 4-dimension scoring (Situation/Task, Action, Result, Delivery).

### 2.4 Persistence & Database Layer
- **File:** [`src/lib/db/index.ts`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/lib/db/index.ts)
- **Engine:** Built-in Node.js v24 `node:sqlite` (`DatabaseSync`).
- **Pragmas Enabled:**
  - `PRAGMA journal_mode = WAL;` (Concurrent reads without locking writes)
  - `PRAGMA foreign_keys = ON;` (Referential integrity enforced at engine level)
  - `PRAGMA busy_timeout = 5000;` (Prevents lock contention errors)
- **Auto-Initialization & Seeding:** On first boot, tables are verified from [`src/lib/db/schema.sql`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/lib/db/schema.sql), and rich seed data is injected from [`src/lib/db/seed.ts`](file:///c:/Users/hp/Desktop/CAREERPILOT%20AI/src/lib/db/seed.ts) if no users exist.

---

## 3. Database Schema Overview

```sql
users (id, email, password_hash, password_salt, name, role, created_at, updated_at)
  ├── user_profiles (id, user_id, title, target_role, bio, experience_years, skills, education, links)
  ├── resumes (id, user_id, title, content, target_role, created_at)
  │     └── resume_analyses (id, resume_id, overall_score, impact_score, brevity_score, style_score, skills_score, summary, key_strengths, improvements, extracted_skills)
  ├── job_matches (id, user_id, job_title, company_name, job_description, match_score, matching_skills, missing_skills, recommendations, tailored_bullet_points)
  ├── career_roadmaps (id, user_id, target_role, estimated_weeks, progress, summary)
  │     └── roadmap_milestones (id, roadmap_id, order_index, title, description, skills_covered, status, estimated_hours, resources)
  ├── interview_sessions (id, user_id, target_role, session_type, status, overall_score, summary)
  │     └── interview_answers (id, session_id, question_id, question_text, user_answer, feedback, score, dimensions)
  ├── job_applications (id, user_id, company_name, job_title, status, salary_range, location, application_date, interview_date, notes)
  ├── reminders (id, user_id, application_id, title, reminder_date, is_completed)
  └── audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
```

---

## 4. API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new candidate account |
| `POST` | `/api/auth/login` | Authenticate user & set session cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Fetch currently authenticated user |
| `GET`, `PUT` | `/api/profile` | Get or update candidate profile & skills |
| `GET`, `POST` | `/api/resumes` | List resumes or save new resume text |
| `POST` | `/api/resumes/analyze` | Run AI audit on resume content |
| `GET`, `POST` | `/api/job-matches` | Run AI job match vs resume/profile |
| `GET`, `POST` | `/api/roadmaps` | Generate personalized career roadmap |
| `PATCH` | `/api/roadmaps/[id]/milestones/[mId]` | Toggle milestone completion |
| `GET`, `POST` | `/api/interviews` | Create AI mock interview session |
| `POST` | `/api/interviews/[id]/answer` | Submit interview answer & get rubric scores |
| `GET`, `POST` | `/api/applications` | List or create tracked job applications |
| `GET` | `/api/applications/export` | Export applications to CSV |
| `GET` | `/api/dashboard` | Real-time aggregated stats & alerts |

---

## 5. Security & Data Protection Guarantees
1. **Password Salt Isolation:** Every user password utilizes a distinct 64-byte cryptographically secure random salt generated via `crypto.randomBytes(64)`.
2. **Deterministic Token Signatures:** Signatures cannot be forged without knowing the local `AUTH_SECRET`.
3. **Session Replay Immunity:** Timestamps embedded inside the session token enforce automatic 7-day expiration.
4. **Relational Isolation:** All queries filter on `user_id = ?`, preventing unauthorized cross-tenant data access.
5. **SQL Injection Defense:** All SQLite queries execute through prepared statements with parameter binding.
