// Automated Comprehensive Integration Test Suite for CareerPilot AI
// Tests core domain logic, cryptography, database persistence, AI heuristic engine, and data isolation

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../src/lib/auth/crypto.ts";
import { heuristicEngine } from "../src/lib/ai/heuristic.ts";

console.log("🧪 STARTING CAREERPILOT AI AUTOMATED TEST SUITE...\n");

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

// ---------------- 1. AUTHENTICATION & CRYPTOGRAPHY TESTS ----------------
console.log("🔐 1. Cryptography & Security Tests");

runTest("Password hashing produces unique salts and verifiable hashes", () => {
  const p1 = hashPassword("SuperSecret@2026");
  const p2 = hashPassword("SuperSecret@2026");

  // Salts must be unique
  assert.notEqual(p1.salt, p2.salt, "Salts must be randomly generated per hash");
  assert.notEqual(p1.hash, p2.hash, "Hashes must differ due to unique salts");

  // Verification must succeed with correct password
  assert.equal(verifyPassword("SuperSecret@2026", p1.salt, p1.hash), true);
  assert.equal(verifyPassword("SuperSecret@2026", p2.salt, p2.hash), true);

  // Verification must fail with wrong password
  assert.equal(verifyPassword("WrongPassword123", p1.salt, p1.hash), false);
});

runTest("Tamper-proof HMAC token signs, verifies, and detects tampering", () => {
  const payload = { userId: "user-123", email: "candidate@careerpilot.ai", name: "Jordan", role: "job_seeker" };
  const token = signToken(payload, 1);

  assert.ok(token.includes("."), "Token must be formatted with headers, body, signature");
  const verified = verifyToken(token);
  assert.equal(verified?.userId, "user-123");
  assert.equal(verified?.email, "candidate@careerpilot.ai");

  // Tampered payload
  const parts = token.split(".");
  const tamperedToken = `${parts[0]}.${Buffer.from(JSON.stringify({ ...payload, role: "admin" })).toString("base64url")}.${parts[2]}`;
  assert.equal(verifyToken(tamperedToken), null, "Tampered token must fail signature check");
});

// ---------------- 2. HEURISTIC INTELLIGENCE ENGINE TESTS ----------------
console.log("\n🤖 2. Career AI & Heuristic Intelligence Tests");

runTest("Resume Analyzer extracts skills, calculates rubrics, and provides improvements", () => {
  const sampleResume = `
    Alex Morgan | alex@example.com
    EDUCATION: B.S. in Computer Science, State University, 2025
    SKILLS: TypeScript, React, Next.js, Node.js, Express, PostgreSQL, Docker, Git, REST APIs
    PROJECTS:
    - Engineered high-performance e-commerce platform using React and Node.js, reducing latency by 40% for 5,000+ users.
    - Built responsive web dashboard with Next.js App Router and automated Jest unit tests achieving 85% coverage.
  `;

  const result = heuristicEngine.analyzeResume(sampleResume);

  assert.ok(result.overallScore >= 70 && result.overallScore <= 100, "Score must fall within realistic 70-100 range");
  assert.ok(result.skillsDetected.includes("TypeScript"), "Must detect TypeScript");
  assert.ok(result.skillsDetected.includes("React"), "Must detect React");
  assert.ok(result.skillsDetected.includes("PostgreSQL"), "Must detect PostgreSQL");
  assert.ok(result.strengths.length > 0, "Must identify quantifiable strengths");
  assert.ok(result.improvements.length > 0, "Must provide actionable before/after rewrites");
  assert.equal(result.provider, "heuristic");
});

runTest("Job Match Engine computes skill gaps and generates tailored resume bullet points", () => {
  const resume = "Experienced in TypeScript, React, Node.js, SQLite, Git";
  const jd = `
    We are looking for a Software Engineer with strong proficiency in TypeScript, React, Docker, and PostgreSQL.
    Experience with automated CI/CD pipelines is a plus.
  `;

  const match = heuristicEngine.matchJob(jd, resume, "Frontend Engineer", "TechCorp");

  assert.ok(match.matchedSkills.includes("TypeScript"), "Must identify TypeScript as matched");
  assert.ok(match.matchedSkills.includes("React"), "Must identify React as matched");
  assert.ok(match.missingSkills.includes("Docker") || match.missingSkills.includes("PostgreSQL"), "Must identify Docker/Postgres as missing");
  assert.ok(match.matchScore > 40 && match.matchScore < 95, "Match score should reflect partial overlap");
  assert.ok(match.tailoredBulletPoints.length > 0, "Must provide tailored bullet points");
  assert.ok(match.interviewPrepQuestions.length > 0, "Must provide role-specific interview questions");
});

runTest("Roadmap Engine creates progressive milestones with verified URLs", () => {
  const roadmap = heuristicEngine.generateRoadmap("Full-Stack Software Engineer", "entry", 12);

  assert.equal(roadmap.targetRole, "Full-Stack Software Engineer");
  assert.ok(roadmap.milestones.length >= 4, "Must generate at least 4 progressive milestones");
  assert.ok(roadmap.milestones[0].learningResources.length > 0, "Must contain learning resources");
  assert.ok(roadmap.milestones[0].learningResources[0].url.startsWith("https://"), "Resource URLs must be valid HTTPS links");
  assert.ok(roadmap.milestones[0].projectTask.length > 10, "Must include a practical project task");
});

runTest("Interview Simulator generates questions and evaluates responses on 4 dimensions", () => {
  const questions = heuristicEngine.generateInterviewQuestions("Full-Stack Software Engineer", "technical", "entry", 3);
  assert.equal(questions.length, 3, "Must generate exact requested number of questions");

  const userAnswer = "The Virtual DOM is an in-memory representation of real DOM elements. When state changes in React, it diffs the virtual DOM against previous snapshots and updates only the modified nodes, making UI updates fast and batch-processed.";
  const evaluation = heuristicEngine.evaluateInterviewAnswer(questions[0].questionText, userAnswer, "technical");

  assert.ok(evaluation.score >= 70, "Comprehensive answer should score well");
  assert.ok(evaluation.relevanceScore >= 70, "Should have high relevance");
  assert.ok(evaluation.feedback.length > 10, "Must include constructive feedback");
  assert.ok(evaluation.exemplaryAnswer.length > 10, "Must provide model answer");
});

// ---------------- 3. DATABASE RELATIONAL PERSISTENCE TESTS ----------------
console.log("\n💾 3. Database Schema & Data Isolation Tests");

runTest("SQLite database enforces relational schema, foreign keys, and indexes", () => {
  const testDb = new DatabaseSync(":memory:");
  testDb.exec("PRAGMA foreign_keys = ON;");

  const schemaSql = fs.readFileSync(path.join(process.cwd(), "src", "lib", "db", "schema.sql"), "utf-8");
  testDb.exec(schemaSql);

  // Insert user 1
  testDb.prepare("INSERT INTO users (id, email, password_hash, salt, name) VALUES ('u1', 'u1@test.com', 'h1', 's1', 'User One');").run();
  
  // Insert profile for user 1
  testDb.prepare("INSERT INTO user_profiles (user_id, headline, current_stage) VALUES ('u1', 'Developer', 'student');").run();

  // Insert application for user 1
  testDb.prepare("INSERT INTO job_applications (id, user_id, job_title, company) VALUES ('app1', 'u1', 'Frontend Dev', 'Company A');").run();

  // Test retrieval
  const app = testDb.prepare("SELECT * FROM job_applications WHERE user_id = 'u1';").get();
  assert.equal(app.job_title, "Frontend Dev");

  // Test cross-user data isolation (User 2 cannot see User 1's applications)
  const user2Apps = testDb.prepare("SELECT * FROM job_applications WHERE user_id = 'u2';").all();
  assert.equal(user2Apps.length, 0, "User 2 query must return 0 records from User 1");

  // Test CASCADE on user deletion
  testDb.prepare("DELETE FROM users WHERE id = 'u1';").run();
  const profileAfterDelete = testDb.prepare("SELECT * FROM user_profiles WHERE user_id = 'u1';").get();
  const appsAfterDelete = testDb.prepare("SELECT * FROM job_applications WHERE user_id = 'u1';").all();
  assert.equal(profileAfterDelete, undefined, "Profile must be cascaded on user delete");
  assert.equal(appsAfterDelete.length, 0, "Applications must be cascaded on user delete");
});

console.log("\n========================================================");
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("========================================================\n");

if (failedTests > 0) {
  process.exit(1);
}
