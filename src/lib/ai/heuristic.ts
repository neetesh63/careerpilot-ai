import type { ResumeAnalysisResult, JobMatchResult, RoadmapResult, InterviewQuestionItem, InterviewEvaluationResult, MilestoneItem } from "./types";

// Curated taxonomy of verified technical & professional skills
const SKILL_TAXONOMY = [
  // Languages
  "TypeScript", "JavaScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL", "HTML5", "CSS3",
  // Frontend
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "Redux", "Tailwind CSS", "Bootstrap", "Webpack", "Vite", "GraphQL", "REST APIs",
  // Backend & Databases
  "Node.js", "Express", "NestJS", "FastAPI", "Django", "Spring Boot", "ASP.NET", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Prisma",
  // Cloud & DevOps
  "Docker", "Kubernetes", "AWS", "Google Cloud", "GCP", "Azure", "CI/CD", "GitHub Actions", "Terraform", "Linux", "Nginx",
  // Testing & Quality
  "Jest", "Vitest", "Cypress", "Playwright", "Mocha", "Unit Testing", "Integration Testing", "TDD",
  // Methodologies & Soft Skills
  "Agile", "Scrum", "Git", "System Design", "Microservices", "Problem Solving", "Team Leadership", "Cross-functional Collaboration", "Communication"
];

// Curated verified resource URLs (no hallucinated links!)
const VERIFIED_RESOURCES = {
  frontend: [
    { name: "MDN Web Docs (JavaScript & Web APIs)", url: "https://developer.mozilla.org", type: "Docs" as const },
    { name: "Official React Documentation", url: "https://react.dev", type: "Docs" as const },
    { name: "Next.js App Router Documentation", url: "https://nextjs.org/docs", type: "Docs" as const }
  ],
  backend: [
    { name: "Node.js Official Documentation", url: "https://nodejs.org/en/docs", type: "Docs" as const },
    { name: "PostgreSQL Official Documentation", url: "https://www.postgresql.org/docs", type: "Docs" as const },
    { name: "Use The Index, Luke (SQL Indexing Guide)", url: "https://use-the-index-luke.com", type: "Guide" as const }
  ],
  devops: [
    { name: "Docker Official Get Started Guide", url: "https://docs.docker.com/get-started", type: "Docs" as const },
    { name: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", type: "Docs" as const }
  ],
  systemDesign: [
    { name: "The System Design Primer (Donne Martin)", url: "https://github.com/donnemartin/system-design-primer", type: "Guide" as const },
    { name: "OWASP Top Ten Security Project", url: "https://owasp.org/www-project-top-ten", type: "Docs" as const }
  ]
};

export const heuristicEngine = {
  // 1. Analyze Resume Text
  analyzeResume(resumeText: string): ResumeAnalysisResult {
    const textLower = resumeText.toLowerCase();

    // Detect skills
    const detectedSkills: string[] = [];
    for (const skill of SKILL_TAXONOMY) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(resumeText)) {
        detectedSkills.push(skill);
      }
    }

    // Section detection
    const hasEducation = /education|university|college|bachelor|master|degree|gpa/i.test(resumeText);
    const hasExperience = /experience|employment|work history|internship|job/i.test(resumeText);
    const hasProjects = /projects|portfolio|built|engineered|developed/i.test(resumeText);
    const hasSkills = /skills|technical skills|technologies|competencies/i.test(resumeText);

    // Metric / Quantification detection (numbers, percentages, metrics)
    const metricsMatches = resumeText.match(/\d+[\%|\+k|x|\s*(users|clients|ms|s|seconds|hours|percent|increase|reduction)]/gi) || [];
    const hasMetrics = metricsMatches.length >= 2;

    // Action verbs
    const actionVerbs = ["architected", "engineered", "built", "implemented", "optimized", "spearheaded", "developed", "designed", "reduced", "scaled", "automated"];
    const foundVerbs = actionVerbs.filter(v => textLower.includes(v));

    // Calculate transparent rubric scores
    let formattingScore = 70;
    if (hasEducation) formattingScore += 8;
    if (hasProjects) formattingScore += 8;
    if (hasSkills) formattingScore += 7;
    if (hasExperience) formattingScore += 7;
    formattingScore = Math.min(formattingScore, 98);

    let impactScore = 60;
    if (hasMetrics) impactScore += 18;
    if (foundVerbs.length >= 4) impactScore += 14;
    else if (foundVerbs.length >= 2) impactScore += 8;
    impactScore = Math.min(impactScore, 96);

    let skillsScore = Math.min(40 + detectedSkills.length * 5, 95);

    const overallScore = Math.round((formattingScore * 0.3) + (impactScore * 0.4) + (skillsScore * 0.3));

    // Compile strengths & weaknesses
    const strengths: string[] = [];
    if (detectedSkills.length >= 6) {
      strengths.push(`Identified strong core technical stack covering ${detectedSkills.slice(0, 5).join(", ")} and others.`);
    }
    if (hasMetrics) {
      strengths.push("Good inclusion of quantifiable results and business impact metrics in project descriptions.");
    }
    if (foundVerbs.length >= 3) {
      strengths.push(`Effective usage of active leadership verbs (${foundVerbs.slice(0, 3).join(", ")}).`);
    }
    if (strengths.length === 0) {
      strengths.push("Clear baseline structure that can be readily expanded with metrics and technical detail.");
    }

    const weaknesses: string[] = [];
    if (!hasMetrics) {
      weaknesses.push("Limited quantifiable metrics. Recruiters and hiring managers look for numbers that demonstrate scale, speed, or efficiency gains.");
    }
    if (!hasExperience) {
      weaknesses.push("No distinct Work Experience or Internship section detected. If you have internships or freelance work, give them prominence.");
    }
    if (foundVerbs.length < 3) {
      weaknesses.push("Relies on passive phrasing. Replace 'worked on' or 'responsible for' with punchy verbs like 'architected', 'spearheaded', or 'automated'.");
    }

    // Specific improvements
    const improvements = [
      {
        section: "Impact Statements",
        suggestion: "Rewrite project bullets to follow Google's X-Y-Z formula: 'Accomplished [X] as measured by [Y] by doing [Z]'.",
        before: "Built a web application for user tasks and connected database.",
        after: "Engineered responsive full-stack task manager handling 500+ daily actions, reducing task latency by 30% through index optimization."
      },
      {
        section: "Technical Skills",
        suggestion: "Categorize skills cleanly into Languages, Frameworks, Cloud & Databases to maximize ATS parse accuracy.",
        before: detectedSkills.slice(0, 6).join(", ") || "JavaScript, HTML, CSS",
        after: `Frontend: ${detectedSkills.filter(s => ["React", "Next.js", "TypeScript", "HTML5", "CSS3"].includes(s)).join(", ") || "React, TypeScript"} | Backend: ${detectedSkills.filter(s => ["Node.js", "Express", "SQL", "PostgreSQL", "Python"].includes(s)).join(", ") || "Node.js, PostgreSQL"}`
      }
    ];

    // Determine keyword gaps
    const commonModernKeywords = ["CI/CD", "Docker", "Unit Testing", "System Design", "Cloud Architecture", "Agile"];
    const keywordGaps = commonModernKeywords.filter(kw => !textLower.includes(kw.toLowerCase()));

    // Recommended roles
    const recommendedRoles: string[] = [];
    if (detectedSkills.includes("React") || detectedSkills.includes("Next.js") || detectedSkills.includes("HTML5")) {
      recommendedRoles.push("Frontend Developer");
    }
    if (detectedSkills.includes("Node.js") || detectedSkills.includes("Express") || detectedSkills.includes("SQL") || detectedSkills.includes("PostgreSQL")) {
      recommendedRoles.push("Backend Engineer");
    }
    if (recommendedRoles.length >= 2) {
      recommendedRoles.unshift("Full-Stack Software Engineer");
    }
    if (recommendedRoles.length === 0) {
      recommendedRoles.push("Junior Software Engineer", "Associate Application Developer");
    }

    return {
      overallScore,
      summary: `Your resume demonstrates solid foundational technical ability across ${detectedSkills.length} identified skills. Enhancing quantifiable metrics and active verbs will significantly elevate interview callbacks.`,
      skillsDetected: detectedSkills,
      strengths,
      weaknesses,
      improvements,
      keywordGaps,
      formattingScore,
      impactScore,
      skillsScore,
      recommendedRoles,
      provider: "heuristic"
    };
  },

  // 2. Analyze Job Description Match
  matchJob(jobDescription: string, resumeTextOrSkills: string | string[], jobTitle = "Target Role", company = "Company"): JobMatchResult {
    const textToCompare = Array.isArray(resumeTextOrSkills) ? resumeTextOrSkills.join(" ") : resumeTextOrSkills;
    const userTextLower = textToCompare.toLowerCase();
    const jdLower = jobDescription.toLowerCase();

    // Extract skills from JD
    const jdSkills: string[] = [];
    for (const skill of SKILL_TAXONOMY) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(jobDescription)) {
        jdSkills.push(skill);
      }
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of jdSkills) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(userTextLower)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    const matchRatio = jdSkills.length > 0 ? matchedSkills.length / jdSkills.length : 0.75;
    const matchScore = Math.round(Math.min(Math.max(25 + matchRatio * 70, 30), 98));

    const recommendations: string[] = [];
    if (missingSkills.length > 0) {
      recommendations.push(`Prioritize learning or highlighting hands-on exposure to ${missingSkills.slice(0, 3).join(", ")} before submitting.`);
    }
    recommendations.push(`Tailor your resume summary to mirror the primary focus of ${company}'s role.`);
    recommendations.push("Prepare concrete examples addressing the specific tools listed in the job description.");

    const tailoredBulletPoints = [
      `Engineered features utilizing ${matchedSkills.slice(0, 3).join(", ") || "modern technical stack"}, ensuring high code quality and responsive performance.`,
      `Collaborated across development workflows utilizing Git version control, structured code reviews, and automated testing.`
    ];

    const interviewPrepQuestions = [
      `How have you applied ${matchedSkills[0] || "your core technical skill"} in your previous projects?`,
      `The job requires experience with ${missingSkills[0] || "scalable system practices"}. How would you get up to speed quickly?`,
      `Why are you interested in joining ${company} for this ${jobTitle} position?`
    ];

    return {
      matchScore,
      matchedSkills,
      missingSkills,
      partiallyMatched: missingSkills.length > 2 ? [missingSkills[missingSkills.length - 1]] : [],
      strengthsForRole: matchedSkills.map(s => `Strong alignment with required capability: ${s}`),
      recommendations,
      tailoredBulletPoints,
      interviewPrepQuestions,
      provider: "heuristic"
    };
  },

  // 3. Generate Structured Career Roadmap
  generateRoadmap(targetRole: string, experienceLevel = "entry", weeklyHours = 10): RoadmapResult {
    const isFrontend = /front|react|ui|web/i.test(targetRole);
    const isData = /data|ai|machine|analytics/i.test(targetRole);

    let milestones: MilestoneItem[] = [];

    if (isFrontend) {
      milestones = [
        {
          milestoneOrder: 1,
          title: "Modern JavaScript (ES6+) & TypeScript Core",
          category: "Languages",
          description: "Master modern ECMAScript features, closures, promises, async/await, and TypeScript strict type annotations.",
          estimatedWeeks: 3,
          learningResources: VERIFIED_RESOURCES.frontend,
          projectTask: "Build a typed task management utility with strict interfaces, custom generics, and zero any types."
        },
        {
          milestoneOrder: 2,
          title: "Advanced React & Component Architecture",
          category: "Frameworks",
          description: "Deep dive into React 19 hooks, component composition, state machines, and render optimization.",
          estimatedWeeks: 4,
          learningResources: VERIFIED_RESOURCES.frontend,
          projectTask: "Create an interactive dashboard with filterable data tables, custom hooks, and memoized metrics."
        },
        {
          milestoneOrder: 3,
          title: "Next.js App Router, SSR & API Integration",
          category: "Full-Stack Web",
          description: "Learn server components, route handlers, server actions, streaming, and SEO metadata configuration.",
          estimatedWeeks: 4,
          learningResources: VERIFIED_RESOURCES.frontend,
          projectTask: "Build an e-commerce catalog featuring server-rendered product pages and client-side shopping cart."
        },
        {
          milestoneOrder: 4,
          title: "Frontend Testing, Accessibility & Performance Auditing",
          category: "Quality & Performance",
          description: "Implement automated unit testing with Vitest/Testing Library, WCAG 2.1 AA accessibility, and Core Web Vitals profiling.",
          estimatedWeeks: 3,
          learningResources: VERIFIED_RESOURCES.frontend,
          projectTask: "Audit an existing application, achieve 90+ Lighthouse score, and implement full keyboard navigation support."
        }
      ];
    } else {
      milestones = [
        {
          milestoneOrder: 1,
          title: "Advanced TypeScript & Modern Language Features",
          category: "Core Fundamentals",
          description: "Solidify object-oriented and functional patterns, asynchronous programming, error handling, and type safety.",
          estimatedWeeks: 3,
          learningResources: VERIFIED_RESOURCES.frontend,
          projectTask: "Build an extensible CLI tool or modular utility library with comprehensive unit tests."
        },
        {
          milestoneOrder: 2,
          title: "Scalable API Design & Relational Databases",
          category: "Backend & Data",
          description: "Design RESTful APIs, relational schema models, migrations, foreign key cascades, and query indexing.",
          estimatedWeeks: 4,
          learningResources: VERIFIED_RESOURCES.backend,
          projectTask: "Build a secure RESTful API with authentication, rate limiting, and relational SQLite/PostgreSQL storage."
        },
        {
          milestoneOrder: 3,
          title: "Docker Containerization & CI/CD Pipelines",
          category: "DevOps & Cloud",
          description: "Create lightweight multi-stage Dockerfiles, Docker Compose environments, and GitHub Actions test runners.",
          estimatedWeeks: 3,
          learningResources: VERIFIED_RESOURCES.devops,
          projectTask: "Containerize your API and frontend, write health check endpoints, and automate CI testing on pull requests."
        },
        {
          milestoneOrder: 4,
          title: "System Design Foundations & Technical Interview Prep",
          category: "System Design",
          description: "Understand caching strategies, load balancing, horizontal scaling, database sharding, and interview communication.",
          estimatedWeeks: 4,
          learningResources: VERIFIED_RESOURCES.systemDesign,
          projectTask: "Document a complete architecture design for a distributed rate-limiting service or notification pipeline."
        }
      ];
    }

    return {
      title: `${targetRole} Career Mastery Roadmap`,
      targetRole,
      timeframeMonths: Math.round(milestones.reduce((acc, m) => acc + m.estimatedWeeks, 0) / 4),
      weeklyHours,
      skillCategories: ["Core Fundamentals", "Frameworks & Architecture", "DevOps & Cloud", "System Design & Quality"],
      milestones,
      provider: "heuristic"
    };
  },

  // 4. Generate Interview Questions
  generateInterviewQuestions(role: string, category: "technical" | "behavioral" | "situational" | "system_design", difficulty = "entry", count = 3): InterviewQuestionItem[] {
    const questionBank: Record<string, string[]> = {
      technical: [
        "What is the difference between synchronous and asynchronous execution in Node.js, and how does the event loop handle I/O tasks?",
        "Explain how relational database indexing works. When would an index degrade performance instead of improving it?",
        "What are React Server Components (RSC), and how do they differ from traditional Client Components?",
        "How do you approach securing user authentication and preventing attacks such as XSS, CSRF, and SQL injection?",
        "Explain the concept of RESTful API idempotency. Which HTTP methods are idempotent and why?"
      ],
      behavioral: [
        "Tell me about a time you faced a difficult technical roadblock. How did you diagnose the problem and what was the resolution?",
        "Describe a situation where you had a disagreement with a team member or project partner. How did you reach a consensus?",
        "Give an example of a project where you had to learn an unfamiliar technology under tight deadlines. How did you prioritize?",
        "Can you share an experience where you received critical feedback on your code or work? How did you respond and improve?"
      ],
      situational: [
        "Imagine you discover a critical bug in production right before an important release. What exact steps would you take?",
        "If a project deadline is approaching and you realize you will not finish all planned features, how do you communicate with stakeholders?",
        "How would you handle a situation where a legacy system lacks automated tests and documentation, but needs a major new feature?"
      ],
      system_design: [
        "Design a high-throughput URL shortening service (like Bitly). What database schema and caching strategy would you select?",
        "How would you design an in-app notification system that scales to hundreds of thousands of concurrent users?",
        "Walk through the architecture of a real-time collaborative document editor or Kanban board."
      ]
    };

    const selectedPool = questionBank[category] || questionBank.technical;
    const shuffled = [...selectedPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map((q, idx) => ({
      questionNumber: idx + 1,
      questionText: q,
      category,
      contextTip: category === "behavioral" ? "Tip: Frame your answer using the STAR method (Situation, Task, Action, Result)." : "Tip: Focus on technical precision, trade-offs, and clear real-world examples."
    }));
  },

  // 5. Evaluate Interview Answer
  evaluateInterviewAnswer(questionText: string, userAnswer: string, category: string): InterviewEvaluationResult {
    const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
    const lowerAnswer = userAnswer.toLowerCase();

    // Word count thresholds
    let lengthScore = 50;
    if (wordCount >= 60 && wordCount <= 250) lengthScore = 90;
    else if (wordCount >= 30) lengthScore = 75;
    else if (wordCount < 15) lengthScore = 30;

    // Structure checks (STAR method indicators for behavioral)
    let structureScore = 70;
    if (category === "behavioral") {
      const starIndicators = ["situation", "task", "action", "result", "when", "challenge", "resolved", "outcome", "learned"];
      const matches = starIndicators.filter(i => lowerAnswer.includes(i));
      structureScore = Math.min(50 + matches.length * 10, 95);
    } else {
      if (lowerAnswer.includes("because") || lowerAnswer.includes("for example") || lowerAnswer.includes("trade-off") || lowerAnswer.includes("specifically")) {
        structureScore += 15;
      }
    }

    // Technical depth check
    let technicalScore = 70;
    const technicalKeywords = ["performance", "latency", "scale", "database", "query", "cache", "security", "async", "component", "memory", "state"];
    const foundKeywords = technicalKeywords.filter(k => lowerAnswer.includes(k));
    technicalScore = Math.min(60 + foundKeywords.length * 8, 95);

    const relevanceScore = wordCount > 20 ? 85 : 55;
    const clarityScore = wordCount > 25 ? 88 : 60;

    const overallScore = Math.round((lengthScore * 0.25) + (structureScore * 0.25) + (technicalScore * 0.25) + (relevanceScore * 0.25));

    const improvementTips: string[] = [];
    if (wordCount < 40) {
      improvementTips.push("Elaborate with more depth. In technical and behavioral interviews, concise answers under 40 words often lack supporting evidence.");
    }
    if (category === "behavioral" && !lowerAnswer.includes("result") && !lowerAnswer.includes("outcome")) {
      improvementTips.push("Always conclude behavioral answers with a quantifiable result or specific learning outcome.");
    }
    improvementTips.push("Cite specific technical trade-offs to demonstrate senior architectural awareness.");

    return {
      score: overallScore,
      relevanceScore,
      clarityScore,
      structureScore,
      technicalScore,
      feedback: wordCount > 30
        ? "Solid answer with clear communication. You addressed the core premise of the question with relevant details."
        : "Your answer touches on the right concept, but would benefit from greater elaboration and concrete project examples.",
      exemplaryAnswer: `In my experience, approaching this requires understanding both the functional requirements and system trade-offs. For instance, when designing or implementing this solution, I prioritize data integrity, maintainable abstractions, and measurable performance benchmarks before optimizing prematurely.`,
      improvementTips,
      provider: "heuristic"
    };
  }
};
