"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  MessagesSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Award,
  ChevronRight,
  BookOpen,
  Send,
  HelpCircle,
  Cpu
} from "lucide-react";

interface QuestionAnswer {
  id: string;
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
  improvement_tips: string[];
}

interface InterviewSession {
  id: string;
  role_title: string;
  category: string;
  difficulty: string;
  total_questions: number;
  current_index: number;
  is_completed: number;
  overall_score: number;
  ai_provider: string;
  questions: QuestionAnswer[];
}

export default function InterviewPrepPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  // New session form
  const [roleTitle, setRoleTitle] = useState("");
  const [category, setCategory] = useState<"technical" | "behavioral" | "situational" | "system_design">("technical");
  const [difficulty, setDifficulty] = useState("entry");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [starting, setStarting] = useState(false);

  // Answer submission
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<any | null>(null);

  const fetchSessions = () => {
    fetch("/api/interviews")
      .then(res => res.json())
      .then(async data => {
        if (data.sessions && data.sessions.length > 0) {
          setSessions(data.sessions);
          if (!activeSession) {
            const firstId = data.sessions[0].id;
            const fullRes = await fetch(`/api/interviews/${firstId}`);
            const fullData = await fullRes.json();
            setActiveSession(fullData.session);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleTitle: roleTitle || "Full-Stack Software Engineer",
          category,
          difficulty,
          totalQuestions
        })
      });

      const data = await res.json();
      if (res.ok && data.session) {
        setActiveSession(data.session);
        setLastEvaluation(null);
        setUserAnswer("");
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const handleSelectSession = async (id: string) => {
    try {
      const res = await fetch(`/api/interviews/${id}`);
      const data = await res.json();
      setActiveSession(data.session);
      setLastEvaluation(null);
      setUserAnswer("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !currentQuestion) return;

    if (!userAnswer || userAnswer.trim().length < 5) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/interviews/${activeSession.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId: currentQuestion.id,
          userAnswer
        })
      });

      const data = await res.json();
      if (res.ok) {
        setLastEvaluation(data.evaluation);
        setActiveSession(data.session);
        setUserAnswer("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = activeSession?.questions[activeSession.current_index];
  const isCompleted = activeSession?.is_completed === 1;

  return (
    <DashboardShell
      title="AI Interview Practice Simulator"
      description="Interactive real-time interview questions with multidimensional scoring and exemplary answers."
    >
      <div className="space-y-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Start Session & Past Sessions */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7667F7]" />
                New Practice Session
              </h2>

              <form onSubmit={handleStartSession} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#25243A] mb-1">Target Role</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    placeholder="e.g. Full-Stack Engineer"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#25243A] mb-1">Question Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                  >
                    <option value="technical">Technical Fundamentals</option>
                    <option value="behavioral">Behavioral (STAR Method)</option>
                    <option value="situational">Situational Scenarios</option>
                    <option value="system_design">System Architecture</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#25243A] mb-1">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                    >
                      <option value="entry">Entry-Level</option>
                      <option value="mid">Mid-Level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#25243A] mb-1">Questions</label>
                    <select
                      value={totalQuestions}
                      onChange={e => setTotalQuestions(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-[#E7E5EF]"
                    >
                      <option value={2}>2 Questions</option>
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={starting}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-sm transition-all disabled:opacity-50"
                >
                  {starting ? "Generating Session..." : "Start Practice Session"}
                </button>
              </form>
            </div>

            {/* Past Sessions List */}
            {sessions.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">Session History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        activeSession?.id === s.id
                          ? "border-[#7667F7] bg-[#EAE7FF]/30 font-semibold"
                          : "border-[#E7E5EF] hover:bg-[#F8F7F2]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[#17162E]">{s.role_title}</p>
                        <p className="text-[10px] text-[#6F6D82] capitalize">{s.category} • {s.is_completed ? "Completed" : "In Progress"}</p>
                      </div>
                      {s.is_completed ? (
                        <span className="text-xs font-bold text-[#16856B]">{s.overall_score}%</span>
                      ) : (
                        <span className="text-[10px] text-[#A96513]">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Active Simulation Arena */}
          <div className="lg:col-span-8 space-y-4">
            {activeSession ? (
              <div className="space-y-4">
                {/* Session Header */}
                <div className="p-5 rounded-2xl bg-[#17162E] text-white shadow-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#7667F7]/30 text-[#EAE7FF] uppercase tracking-wide">
                        {activeSession.category}
                      </span>
                      <span className="text-xs text-[#A19FB6] capitalize">• {activeSession.difficulty} Level</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{activeSession.role_title}</h2>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#A19FB6] block">Progress</span>
                    <span className="text-sm font-extrabold text-white">
                      {isCompleted ? "Completed" : `Question ${activeSession.current_index + 1} of ${activeSession.total_questions}`}
                    </span>
                  </div>
                </div>

                {/* Completed Session Summary */}
                {isCompleted ? (
                  <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-6">
                    <div className="text-center space-y-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-[#16856B]/15 text-[#16856B] flex items-center justify-center mx-auto">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-[#17162E]">Interview Practice Session Completed!</h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-extrabold text-[#16856B]">{activeSession.overall_score}%</span>
                        <span className="text-xs text-[#6F6D82]">Overall Performance Average</span>
                      </div>
                    </div>

                    {/* All Answer Review */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">Review Questions & Feedback</h4>
                      {activeSession.questions.map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-xl border border-[#E7E5EF] bg-[#F8F7F2]/40 space-y-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold text-[#7667F7]">Q{idx + 1}: {q.question_text}</span>
                            <span className="text-xs font-bold text-[#16856B] shrink-0">{q.score}%</span>
                          </div>

                          {q.user_answer && (
                            <div className="text-xs text-[#25243A] bg-white p-3 rounded-lg border border-[#E7E5EF]">
                              <strong>Your Answer:</strong> {q.user_answer}
                            </div>
                          )}

                          {q.feedback && (
                            <div className="text-xs text-[#6F6D82] bg-[#EAE7FF]/30 p-3 rounded-lg border border-[#7667F7]/20">
                              <strong className="text-[#7667F7]">Feedback:</strong> {q.feedback}
                            </div>
                          )}

                          {q.exemplary_answer && (
                            <div className="text-xs text-[#16856B] bg-[#16856B]/5 p-3 rounded-lg border border-[#16856B]/20">
                              <strong className="text-[#16856B]">Model Answer:</strong> {q.exemplary_answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* In Progress: Active Question */
                  <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-6">
                    {currentQuestion && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-[#7667F7] uppercase tracking-wider">
                            Question {currentQuestion.question_number}
                          </span>
                          <h3 className="text-base font-bold text-[#17162E] leading-relaxed">
                            {currentQuestion.question_text}
                          </h3>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#EAE7FF]/40 border border-[#7667F7]/20 flex items-start gap-2.5 text-xs text-[#25243A]">
                          <HelpCircle className="w-4 h-4 text-[#7667F7] shrink-0 mt-0.5" />
                          <div>
                            <strong>Interview Coaching Tip:</strong> Structure your response clearly. For behavioral questions, use Situation, Task, Action, Result (STAR). For technical questions, mention system trade-offs.
                          </div>
                        </div>

                        {/* Answer Input */}
                        <form onSubmit={handleSubmitAnswer} className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#25243A] mb-1">Your Written Response</label>
                            <textarea
                              rows={6}
                              required
                              value={userAnswer}
                              onChange={e => setUserAnswer(e.target.value)}
                              placeholder="Type your structured answer here (minimum 15-30 words recommended for accurate evaluation)..."
                              className="w-full p-3.5 text-xs bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7] leading-relaxed"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[#6F6D82]">
                              Word count: {userAnswer.trim().split(/\s+/).filter(Boolean).length}
                            </span>
                            <button
                              type="submit"
                              disabled={submitting || userAnswer.trim().length < 5}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25 disabled:opacity-50 transition-all"
                            >
                              {submitting ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Scoring Response...
                                </>
                              ) : (
                                <>
                                  Submit Answer
                                  <Send className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white border border-[#E7E5EF] text-center space-y-3 shadow-sm">
                <MessagesSquare className="w-12 h-12 text-[#7667F7] mx-auto opacity-70" />
                <h3 className="text-base font-bold text-[#17162E]">No Active Interview Practice</h3>
                <p className="text-xs text-[#6F6D82] max-w-sm mx-auto">
                  Select a category on the left to start a focused practice session with real-time feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
