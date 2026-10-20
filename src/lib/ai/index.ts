import { heuristicEngine } from "./heuristic";
import type { ResumeAnalysisResult, JobMatchResult, RoadmapResult, InterviewQuestionItem, InterviewEvaluationResult } from "./types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export const aiService = {
  getProviderStatus(): { activeProvider: "gemini" | "openai" | "heuristic"; hasApiKey: boolean; info: string } {
    if (GEMINI_API_KEY) {
      return { activeProvider: "gemini", hasApiKey: true, info: "Connected to Google Gemini AI API" };
    }
    if (OPENAI_API_KEY) {
      return { activeProvider: "openai", hasApiKey: true, info: "Connected to OpenAI API" };
    }
    return {
      activeProvider: "heuristic",
      hasApiKey: false,
      info: "Running on CareerPilot Deterministic Heuristic Engine (No API key required)"
    };
  },

  async analyzeResume(resumeText: string): Promise<ResumeAnalysisResult> {
    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are an expert technical recruiter and resume auditor. Analyze the following resume text and respond ONLY with a valid JSON object matching this schema:
{
  "overallScore": number (0-100),
  "summary": string,
  "skillsDetected": string[],
  "strengths": string[],
  "weaknesses": string[],
  "improvements": [{"section": string, "suggestion": string, "before": string, "after": string}],
  "keywordGaps": string[],
  "formattingScore": number,
  "impactScore": number,
  "skillsScore": number,
  "recommendedRoles": string[]
}

Resume Content:
${resumeText.slice(0, 8000)}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return { ...parsed, provider: "gemini" };
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to heuristic engine:", err);
      }
    }

    // Default or Fallback: Heuristic Engine
    return heuristicEngine.analyzeResume(resumeText);
  },

  async matchJob(jobDescription: string, resumeTextOrSkills: string | string[], jobTitle?: string, company?: string): Promise<JobMatchResult> {
    if (GEMINI_API_KEY) {
      try {
        const userText = Array.isArray(resumeTextOrSkills) ? resumeTextOrSkills.join(", ") : resumeTextOrSkills;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are an expert career advisor. Compare the candidate profile against the job description. Return ONLY a valid JSON object matching this schema:
{
  "matchScore": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "partiallyMatched": string[],
  "strengthsForRole": string[],
  "recommendations": string[],
  "tailoredBulletPoints": string[],
  "interviewPrepQuestions": string[]
}

Candidate:
${userText.slice(0, 4000)}

Job Title: ${jobTitle || "Role"} | Company: ${company || "Company"}
Job Description:
${jobDescription.slice(0, 4000)}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return { ...parsed, provider: "gemini" };
          }
        }
      } catch (err) {
        console.warn("Gemini API match failed, using heuristic engine:", err);
      }
    }

    return heuristicEngine.matchJob(jobDescription, resumeTextOrSkills, jobTitle, company);
  },

  async generateRoadmap(targetRole: string, experienceLevel?: string, weeklyHours?: number): Promise<RoadmapResult> {
    return heuristicEngine.generateRoadmap(targetRole, experienceLevel, weeklyHours);
  },

  async generateInterviewQuestions(role: string, category: "technical" | "behavioral" | "situational" | "system_design", difficulty = "entry", count = 3): Promise<InterviewQuestionItem[]> {
    return heuristicEngine.generateInterviewQuestions(role, category, difficulty, count);
  },

  async evaluateInterviewAnswer(questionText: string, userAnswer: string, category: string): Promise<InterviewEvaluationResult> {
    return heuristicEngine.evaluateInterviewAnswer(questionText, userAnswer, category);
  }
};
