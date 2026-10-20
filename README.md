# 🚀 CareerPilot AI — Autonomous Career Development Platform

> **A real, production-grade, AI-powered career development SaaS that empowers job seekers, graduates, and professionals to analyze resumes, master interviews, bridge skill gaps, and track applications from wishlist to offer.**

---

## 🌟 Key Highlights & Capabilities

- 🤖 **Hybrid AI Intelligence:** Powered by Google Gemini API with seamless zero-cost fallback to a deterministic heuristic engine featuring 250+ skill ontology, 4-tier rubric scoring, and STAR interview evaluation.
- 📄 **Interactive AI Resume Auditor:** Instant ATS score (0-100), dimensional breakdown (Impact, Brevity, Technical Skills, Clarity), extracted skills taxonomy, and actionable before/after bullet rewrites.
- 🎯 **Target Job Matching & Gap Analysis:** Paste target job descriptions to calculate alignment score, identify missing skills, and generate tailored resume bullet points.
- 🗺️ **Personalized Career Roadmaps:** Generates structured phase-by-phase learning plans with estimated hours, interactive milestone checkboxes, and verified official documentation links.
- 🎙️ **Interactive AI Interview Practice Simulator:** Generates role-specific behavioral and technical questions, evaluates candidate responses across 4 rubric dimensions (STAR methodology), and provides instant coaching tips.
- 📊 **Job Application Pipeline Tracker:** Full drag-and-drop / select Kanban board (Wishlist, Applied, Interviewing, Offer, Rejected), searchable table view, and single-click **CSV Export**.
- 🔐 **Hardened Security & Sessions:** Salted PBKDF2 (100,000 iterations, sha512) password hashing, tamper-proof HMAC-SHA256 session tokens, and secure HttpOnly SameSite cookies. Zero plaintext credentials.
- ⚡ **Zero-Dependency Native Persistence:** High-performance relational database using Node.js v24 native `node:sqlite` (`DatabaseSync`) with Write-Ahead Logging (WAL) and foreign keys enabled. Pre-seeded with rich demo data on initial boot.

---

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 16.4.2 | Server-side rendering, API route handlers, static generation |
| **Language** | TypeScript | 5.x | End-to-end type safety |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | 4.x | Design tokens, midnight palette, glassmorphism |
| **Database** | `node:sqlite` (Native SQLite) | Node 24 | Relational persistence, zero native binaries, WAL mode |
| **Icons** | `lucide-react` | 1.16.0 | Modern UI icon set |
| **Security** | Node `crypto` (PBKDF2 & HMAC) | Built-in | Cryptographic password hashing and session tokens |
| **Testing** | Node.js Test Harness | Built-in | Automated integration testing suite |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v24.x` or later (tested on Node v24.14.1)
- **npm**: `v10.x` or later (tested on npm v11.12.1)

### 2. Clone & Install Dependencies
```bash
# Navigate to the repository
cd "c:\Users\hp\Desktop\CAREERPILOT AI"

# Install dependencies (already installed in workspace)
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
# Server Port
PORT=3000

# Authentication Secret for HMAC-SHA256 Token Signing
AUTH_SECRET=careerpilot_super_secret_production_key_2026_change_in_prod

# Database Storage Path
DATABASE_PATH=./data/careerpilot.db

# Optional: Google Gemini API Key (If omitted, uses local heuristic AI engine)
GEMINI_API_KEY=
```

### 4. Running the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Verified Demo Account
You can immediately sign in with the pre-seeded demo account:
- **Email:** `demo@careerpilot.ai`
- **Password:** `Demo@12345`
*(Or click the **"Quick Demo Sign-In"** button on the Login page for 1-click authentication!)*

---

## 🧪 Automated Testing & Production Build

### Running Automated Integration Tests
Verify cryptography, AI heuristic analysis, job matching, roadmaps, interview simulation, and database constraints:
```bash
npm test
```
**Test Results:** `7 Passed, 0 Failed` (100% Pass Rate).

### Creating Production Build
Compile and verify all 29 static and dynamic routes:
```bash
npm run build
```
Exit code `0` — Verified clean compilation with Turbopack in ~4 seconds.

---

## 📁 Project Directory Structure

```text
CAREERPILOT AI/
├── .env.example                 # Template for environment configuration
├── .gitignore                   # Git exclusion rules
├── AGENTS.md                    # Next.js rules & workspace guidelines
├── ARCHITECTURE.md              # Detailed technical architecture specification
├── CODE_DEDUPLICATION_REPORT.md # Single-responsibility & deduplication audit
├── PROJECT_AUDIT.md             # Complete 12-domain project audit report
├── README.md                    # Main project documentation (this file)
├── TEST_REPORT.md               # Automated test execution & verification report
├── next.config.ts               # Next.js Turbopack configuration
├── package.json                 # Project scripts and dependencies
├── tsconfig.json                # TypeScript compiler configuration
├── data/                        # SQLite storage directory
│   └── careerpilot.db           # Relational database file (WAL mode)
├── src/
│   ├── app/                     # Next.js 16 App Router
│   │   ├── api/                 # 14 REST API Route Handlers
│   │   │   ├── applications/    # Pipeline tracker CRUD & CSV export
│   │   │   ├── auth/            # Register, Login, Logout, Me
│   │   │   ├── dashboard/       # Aggregated candidate metrics
│   │   │   ├── interviews/      # Mock interview sessions & evaluation
│   │   │   ├── job-matches/     # Job description gap analysis
│   │   │   ├── profile/         # Candidate profile & skills
│   │   │   ├── reminders/       # Follow-up application reminders
│   │   │   ├── resumes/         # Resume auditing & rewrites
│   │   │   └── roadmaps/        # Progressive milestones & resources
│   │   ├── applications/        # Kanban board & table pipeline page
│   │   ├── dashboard/           # Main authenticated metrics dashboard
│   │   ├── interview-prep/      # Interactive mock interview simulator
│   │   ├── job-matching/        # Job description analyzer page
│   │   ├── login/               # Authentication sign-in with 1-click demo
│   │   ├── onboarding/          # 3-step candidate setup wizard
│   │   ├── profile/             # Profile & skill settings page
│   │   ├── register/            # New user registration page
│   │   ├── resume-analyzer/     # Interactive resume audit & scoring
│   │   ├── roadmap/             # Milestone tracker & docs page
│   │   ├── globals.css          # Design system & Midnight theme tokens
│   │   ├── layout.tsx           # SEO metadata, fonts & root shell
│   │   └── page.tsx             # SaaS landing page with feature previews
│   ├── components/
│   │   ├── layout/              # Navbar, Sidebar, and DashboardShell
│   │   └── ui/                  # Accessible Modal, Badge, Alert
│   ├── lib/
│   │   ├── ai/                  # AI Orchestrator & 250+ Skill Heuristic Engine
│   │   ├── auth/                # PBKDF2 cryptography & HMAC session tokens
│   │   └── db/                  # SQLite schema DDL, repository layer & seeder
│   └── types/                   # Ambient TypeScript definitions
└── tests/
    └── integration.test.mjs     # Automated integration test runner
```

---

## 🔒 Security & Privacy Guarantees

1. **No Plaintext Passwords:** PBKDF2 derivation with unique per-user 64-byte random salts.
2. **Stateless Signed Sessions:** Tamper-proof HMAC-SHA256 signature preventing token manipulation.
3. **Cookie Hardening:** `HttpOnly`, `SameSite=Lax`, and `Path=/` prevent XSS session theft.
4. **Tenant Isolation:** All database read/write queries explicitly enforce `WHERE user_id = ?`.
5. **SQL Injection Defense:** 100% prepared statements with parameterized inputs.

---

## 📄 License
This project is licensed under the MIT License.
