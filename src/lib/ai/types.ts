// Types and Schemas for AI Career Intelligence

export interface ResumeAnalysisResult {
  overallScore: number; // 0-100
  summary: string;
  skillsDetected: string[];
  strengths: string[];
  weaknesses: string[];
  improvements: Array<{
    section: string;
    suggestion: string;
    before?: string;
    after?: string;
  }>;
  keywordGaps: string[];
  formattingScore: number;
  impactScore: number;
  skillsScore: number;
  recommendedRoles: string[];
  provider: "gemini" | "openai" | "heuristic";
}

export interface JobMatchResult {
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  partiallyMatched: string[];
  strengthsForRole: string[];
  recommendations: string[];
  tailoredBulletPoints: string[];
  interviewPrepQuestions: string[];
  provider: "gemini" | "openai" | "heuristic";
}

export interface MilestoneItem {
  milestoneOrder: number;
  title: string;
  category: string;
  description: string;
  estimatedWeeks: number;
  learningResources: Array<{
    name: string;
    url: string;
    type: "Docs" | "Course" | "Tutorial" | "Book" | "Guide";
  }>;
  projectTask: string;
  deadlineDate?: string;
}

export interface RoadmapResult {
  title: string;
  targetRole: string;
  timeframeMonths: number;
  weeklyHours: number;
  skillCategories: string[];
  milestones: MilestoneItem[];
  provider: "gemini" | "openai" | "heuristic";
}

export interface InterviewQuestionItem {
  questionNumber: number;
  questionText: string;
  category: "technical" | "behavioral" | "situational" | "system_design";
  contextTip?: string;
}

export interface InterviewEvaluationResult {
  score: number; // 0-100
  relevanceScore: number;
  clarityScore: number;
  structureScore: number;
  technicalScore: number;
  feedback: string;
  exemplaryAnswer: string;
  improvementTips: string[];
  provider: "gemini" | "openai" | "heuristic";
}
