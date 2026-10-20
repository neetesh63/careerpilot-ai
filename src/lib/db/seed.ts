import { getDatabase, usersRepo, profilesRepo, resumesRepo, resumeAnalysesRepo, jobMatchesRepo, roadmapsRepo, milestonesRepo, interviewsRepo, applicationsRepo, remindersRepo } from "./index";
import { hashPassword } from "../auth/crypto";

export function seedDatabase(): void {
  const db = getDatabase();
  console.log("🌱 Checking database seed status...");

  const existingDemo = usersRepo.findByEmail("demo@careerpilot.ai");
  if (existingDemo) {
    console.log("✓ Demo user already exists. Skipping seed.");
    return;
  }

  console.log("🌱 Seeding CareerPilot AI demo account & realistic initial data...");

  // 1. Create Demo User
  const { salt, hash } = hashPassword("Demo@12345");
  const demoUser = usersRepo.create({
    email: "demo@careerpilot.ai",
    password_hash: hash,
    salt,
    name: "Alex Morgan",
    role: "job_seeker"
  });

  const userId = demoUser.id;

  // 2. Create Rich Profile
  profilesRepo.upsert(userId, {
    headline: "Aspiring Full-Stack Software Engineer | React, Next.js & Node.js Enthusiast",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA (Open to Remote)",
    current_stage: "fresh_grad",
    target_role: "Full-Stack Software Engineer",
    target_industry: "Technology / SaaS / FinTech",
    experience_level: "entry",
    education_data: JSON.stringify([
      {
        institution: "State University of Technology",
        degree: "Bachelor of Science",
        field: "Computer Science",
        gradYear: "2025"
      }
    ]),
    skills_data: JSON.stringify([
      "TypeScript", "JavaScript", "React", "Next.js", "Node.js",
      "Express", "PostgreSQL", "SQLite", "Tailwind CSS", "Git",
      "RESTful APIs", "Docker", "Unit Testing", "System Design Basics"
    ]),
    projects_data: JSON.stringify([
      {
        title: "CloudFlow Task Manager",
        description: "Full-stack project management web app with drag-and-drop Kanban, user auth, and real-time updates.",
        techStack: "Next.js, TypeScript, Tailwind, SQLite",
        link: "https://github.com/alexmorgan/cloudflow"
      },
      {
        title: "E-Commerce Microservices Demo",
        description: "RESTful product catalog and checkout service built with Node.js, Docker containers, and automated Jest tests.",
        techStack: "Node.js, Express, PostgreSQL, Docker",
        link: "https://github.com/alexmorgan/ecommerce-microservices"
      }
    ]),
    certifications_data: JSON.stringify([
      {
        name: "Meta Front-End Developer Professional Certificate",
        issuer: "Coursera / Meta",
        year: "2024"
      }
    ]),
    portfolio_url: "https://alexmorgan.dev",
    linkedin_url: "https://linkedin.com/in/alexmorgandev",
    github_url: "https://github.com/alexmorgandev",
    bio: "Passionate computer science graduate eager to build modern, high-performance web applications and scalable APIs.",
    onboarding_completed: 1
  });

  // 3. Create Sample Resume & Analysis
  const sampleResumeText = `
Alex Morgan
San Francisco, CA | alex@alexmorgan.dev | (555) 234-5678 | github.com/alexmorgandev

EDUCATION
State University of Technology — B.S. in Computer Science (GPA: 3.8/4.0) | May 2025
Relevant Coursework: Data Structures, Algorithms, Database Systems, Web Development, Software Engineering

SKILLS
- Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
- Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Jest
- Tools & Cloud: Git, Docker, SQLite, PostgreSQL, Postman, Vercel

PROJECTS
CloudFlow Task Manager (Full-Stack Next.js Project) | 2024
- Built a responsive task management platform supporting 100+ simulated users using Next.js App Router and Tailwind CSS.
- Designed relational SQLite database schema with prepared statements, reducing query response times by 35%.
- Implemented secure cookie-based session authentication with PBKDF2 password hashing.

E-Commerce API & Microservices | 2024
- Engineered containerized RESTful API backend handling product catalogs and order transactions using Node.js and Express.
- Wrote 40+ unit and integration tests achieving 88% test coverage using Jest and Supertest.
- Configured Docker Compose environments for automated local developer onboarding.
  `.trim();

  const resume = resumesRepo.create({
    user_id: userId,
    file_name: "Alex_Morgan_Resume_2025.txt",
    file_type: "text/plain",
    raw_text: sampleResumeText,
    parsed_json: JSON.stringify({
      skills: ["TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Express", "Tailwind CSS", "Docker", "SQL"],
      education: ["B.S. in Computer Science, State University of Technology"],
      projects: ["CloudFlow Task Manager", "E-Commerce API & Microservices"]
    })
  });

  resumeAnalysesRepo.create({
    user_id: userId,
    resume_id: resume.id,
    overall_score: 84,
    summary: "Strong entry-level technical resume with clear project accomplishments, modern technology stack, and quantifiable metrics.",
    skills_detected: JSON.stringify(["TypeScript", "React", "Next.js", "Node.js", "Express", "Docker", "SQL", "Git", "Jest"]),
    strengths: JSON.stringify([
      "Quantifiable metrics in project descriptions (e.g., 'reducing query response times by 35%', '88% test coverage')",
      "Modern full-stack technical competencies aligned with in-demand 2025/2026 industry requirements",
      "Clean, readable layout with strong emphasis on relevant engineering projects"
    ]),
    weaknesses: JSON.stringify([
      "Missing dedicated Work Experience or Internship section",
      "Could highlight cloud deployment platforms (AWS/GCP/Azure) more prominently"
    ]),
    improvements: JSON.stringify([
      {
        section: "Projects - CloudFlow",
        suggestion: "Specify the exact user authentication security standards (e.g., HttpOnly cookies, CSRF protection).",
        before: "Implemented secure cookie-based session authentication with PBKDF2 password hashing.",
        after: "Architected secure session authentication leveraging cryptographic PBKDF2 hashing and HttpOnly SameSite cookies."
      },
      {
        section: "Skills",
        suggestion: "Group skills into distinct categories (Languages, Frameworks, Cloud & DevOps, Methodologies) to enhance ATS scanability.",
        before: "TypeScript, JavaScript, Python, SQL, HTML5, CSS3, React, Next.js...",
        after: "Frontend: React, Next.js, Tailwind CSS | Backend: Node.js, Express, REST APIs | Data & Tools: PostgreSQL, Docker, Git"
      }
    ]),
    keyword_gaps: JSON.stringify(["CI/CD", "Cloud Architecture", "Agile / Scrum", "Redis Caching"]),
    formatting_score: 90,
    impact_score: 82,
    skills_score: 80,
    recommended_roles: JSON.stringify(["Junior Full-Stack Engineer", "Frontend React Developer", "Software Engineer - Applications"]),
    ai_provider: "heuristic"
  });

  // 4. Create Sample Job Match
  jobMatchesRepo.create({
    user_id: userId,
    job_title: "Junior Full-Stack Engineer",
    company: "Apex Tech Innovations",
    job_description: "We are seeking a Junior Full-Stack Engineer to join our growing product team. Requirements: 0-2 years experience with TypeScript, React, Node.js, and relational databases. Experience with Docker, automated unit testing, and agile collaboration is a strong plus.",
    match_score: 88,
    matched_skills: JSON.stringify(["TypeScript", "React", "Node.js", "Relational Databases", "Docker", "Unit Testing"]),
    missing_skills: JSON.stringify(["Agile/Scrum Experience", "Production Cloud Deployment"]),
    partially_matched: JSON.stringify(["CI/CD Pipeline Experience"]),
    strengths_for_role: JSON.stringify([
      "Direct hands-on experience building full-stack applications with TypeScript, React, and Node.js",
      "Demonstrated ability to write automated test suites (88% coverage with Jest)",
      "Familiarity with containerization using Docker"
    ]),
    recommendations: JSON.stringify([
      "Add a bullet point on your resume explaining your collaboration process (Git PR reviews, issues, agile sprints)",
      "Deploy one of your projects live to a cloud platform (e.g., Vercel, Railway, Render) and add the live URL"
    ]),
    tailored_bullet_points: JSON.stringify([
      "Collaborated using Git branch workflows, peer code reviews, and structured commit conventions across full-stack deliverables.",
      "Developed end-to-end features spanning React UI components, Node.js REST endpoints, and schema-validated SQL transactions."
    ]),
    interview_prep_questions: JSON.stringify([
      "Can you walk us through the architecture of CloudFlow and why you chose Next.js?",
      "How do you approach unit and integration testing in a Node.js backend?",
      "Explain the difference between synchronous and asynchronous code in Node.js event loop."
    ]),
    ai_provider: "heuristic"
  });

  // 5. Create Sample Roadmap
  const roadmap = roadmapsRepo.create({
    user_id: userId,
    title: "Full-Stack Software Engineer Fast-Track",
    target_role: "Full-Stack Software Engineer",
    timeframe_months: 6,
    weekly_hours: 12,
    skill_categories: JSON.stringify([
      "Advanced TypeScript & React",
      "Scalable Backend & Databases",
      "DevOps, Docker & CI/CD",
      "System Design & Interview Readiness"
    ])
  });

  milestonesRepo.createBatch(roadmap.id, [
    {
      milestone_order: 1,
      title: "Master Modern React Patterns & State Management",
      category: "Frontend",
      description: "Deepen knowledge of React 19 hooks, server components, optimistic updates, and accessible UI patterns.",
      estimated_weeks: 3,
      learning_resources: JSON.stringify([
        { name: "Official React Documentation", url: "https://react.dev", type: "Docs" },
        { name: "Next.js App Router Guide", url: "https://nextjs.org/docs", type: "Docs" }
      ]),
      project_task: "Build an interactive real-time dashboard component with responsive layouts and keyboard accessibility.",
      deadline_date: "2026-11-15"
    },
    {
      milestone_order: 2,
      title: "Production Backend Architecture & Database Optimization",
      category: "Backend",
      description: "Learn indexing strategies, connection pooling, ACID transaction guarantees, and caching with Redis.",
      estimated_weeks: 4,
      learning_resources: JSON.stringify([
        { name: "Use The Index, Luke (SQL Indexing Guide)", url: "https://use-the-index-luke.com", type: "Guide" },
        { name: "Prisma & PostgreSQL Best Practices", url: "https://www.prisma.io/docs", type: "Docs" }
      ]),
      project_task: "Build an API rate limiter and cache layer with latency metrics benchmarking.",
      deadline_date: "2026-12-15"
    },
    {
      milestone_order: 3,
      title: "Containerization & Automated CI/CD Pipelines",
      category: "DevOps",
      description: "Configure multi-stage Docker builds, GitHub Actions workflows, linting, and automated testing.",
      estimated_weeks: 3,
      learning_resources: JSON.stringify([
        { name: "Docker Official Get Started Tutorial", url: "https://docs.docker.com/get-started/", type: "Tutorial" },
        { name: "GitHub Actions Quickstart", url: "https://docs.github.com/en/actions", type: "Docs" }
      ]),
      project_task: "Create a GitHub Actions workflow that runs linting, unit tests, and builds a production Docker container on every PR.",
      deadline_date: "2027-01-10"
    },
    {
      milestone_order: 4,
      title: "System Design Fundamentals & Behavioral Preparation",
      category: "Interviews",
      description: "Learn high-level system design patterns (load balancers, horizontal scaling, caching) and STAR-format behavioral responses.",
      estimated_weeks: 4,
      learning_resources: JSON.stringify([
        { name: "System Design Primer by Donne Martin", url: "https://github.com/donnemartin/system-design-primer", type: "Repository" }
      ]),
      project_task: "Design and diagram a URL shortener service with capacity estimation and failure mode analysis.",
      deadline_date: "2027-02-15"
    }
  ]);

  // Mark milestone 1 as completed to show initial progress
  const firstM = db.prepare("SELECT id FROM roadmap_milestones WHERE roadmap_id = ? AND milestone_order = 1;").get(roadmap.id) as { id: string } | undefined;
  if (firstM) {
    milestonesRepo.toggleCompleted(firstM.id, true);
  }

  // 6. Create Sample Job Applications
  applicationsRepo.create({
    user_id: userId,
    job_title: "Junior Full-Stack Engineer",
    company: "Apex Tech Innovations",
    location: "San Francisco, CA (Hybrid)",
    employment_type: "full_time",
    salary_range: "$85,000 - $95,000",
    status: "interview",
    application_date: "2026-10-10",
    follow_up_date: "2026-10-24",
    interview_date: "2026-10-26",
    notes: "Completed initial recruiter phone screen. Technical round scheduled for Oct 26 focusing on React and system APIs.",
    contact_person: "Sarah Jenkins (Senior Talent Partner)"
  });

  applicationsRepo.create({
    user_id: userId,
    job_title: "Associate Software Engineer",
    company: "CloudScale Systems",
    location: "Remote",
    employment_type: "full_time",
    salary_range: "$80,000 - $90,000",
    status: "assessment",
    application_date: "2026-10-12",
    follow_up_date: "2026-10-22",
    notes: "Submitted online coding assessment (HackerRank). Awaiting feedback."
  });

  applicationsRepo.create({
    user_id: userId,
    job_title: "Frontend Developer (Next.js)",
    company: "Vibrant UI Labs",
    location: "San Jose, CA",
    employment_type: "full_time",
    salary_range: "$90,000 - $100,000",
    status: "applied",
    application_date: "2026-10-15",
    follow_up_date: "2026-10-28",
    notes: "Applied directly on company careers portal with tailored resume."
  });

  applicationsRepo.create({
    user_id: userId,
    job_title: "Software Engineering Intern",
    company: "Nova Digital Health",
    location: "Remote",
    employment_type: "internship",
    salary_range: "$45/hr",
    status: "offer",
    application_date: "2026-09-20",
    notes: "Received written offer for Spring 2027 internship! Evaluating start date."
  });

  // 7. Create Sample Interview Session
  const session = interviewsRepo.createSession({
    user_id: userId,
    role_title: "Junior Full-Stack Engineer",
    category: "technical",
    difficulty: "entry",
    total_questions: 3,
    ai_provider: "heuristic"
  });

  interviewsRepo.createQuestions(session.id, [
    {
      question_number: 1,
      question_text: "What is the Virtual DOM in React, and how does React determine when to re-render a component?",
      category: "technical"
    },
    {
      question_number: 2,
      question_text: "Explain the difference between SQL relational databases and NoSQL document databases. When would you prefer a relational database?",
      category: "technical"
    },
    {
      question_number: 3,
      question_text: "Describe a challenging bug you encountered in a project, how you diagnosed the root cause, and how you resolved it.",
      category: "behavioral"
    }
  ]);

  // Pre-fill answer for question 1 to demonstrate saved history
  const q1 = db.prepare("SELECT id FROM interview_answers WHERE session_id = ? AND question_number = 1;").get(session.id) as { id: string } | undefined;
  if (q1) {
    interviewsRepo.saveAnswer(q1.id, {
      user_answer: "The Virtual DOM is an in-memory representation of the real DOM. When state or props change, React creates a new virtual DOM tree and compares it with the previous one using a diffing algorithm (reconciliation). It then calculates the minimal number of updates needed and batches those changes to the real DOM, which makes DOM updates efficient.",
      score: 92,
      relevance_score: 95,
      clarity_score: 90,
      structure_score: 92,
      technical_score: 90,
      feedback: "Excellent, concise explanation. You correctly identified reconciliation, diffing, and batching.",
      exemplary_answer: "The Virtual DOM is a lightweight JavaScript representation of the actual DOM in memory. React uses reconciliation to diff old and new VDOM trees, selectively updating only mutated nodes to optimize render performance.",
      improvement_tips: JSON.stringify([
        "Mention React 18/19 compiler optimizations and concurrent rendering as modern enhancements."
      ])
    });
    interviewsRepo.advanceOrComplete(session.id, 0, 3);
  }

  console.log("✅ CareerPilot AI database seeded successfully with rich demo data!");
}
