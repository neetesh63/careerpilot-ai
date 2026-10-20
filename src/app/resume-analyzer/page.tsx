"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  History,
  ShieldCheck,
  Cpu
} from "lucide-react";

interface AnalysisData {
  id: string;
  overall_score: number;
  formatting_score: number;
  impact_score: number;
  skills_score: number;
  summary: string;
  skills_detected: string[];
  strengths: string[];
  weaknesses: string[];
  improvements: Array<{
    section: string;
    suggestion: string;
    before?: string;
    after?: string;
  }>;
  keyword_gaps: string[];
  recommended_roles: string[];
  ai_provider: string;
  created_at: string;
}

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisData[]>([]);
  const [viewTab, setViewTab] = useState<"analyze" | "history">("analyze");

  const fetchHistory = () => {
    fetch("/api/resumes/analyses")
      .then(res => res.json())
      .then(data => {
        if (data.analyses) {
          setPastAnalyses(data.analyses);
          if (data.analyses.length > 0 && !currentAnalysis) {
            setCurrentAnalysis(data.analyses[0]);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit.");
      return;
    }

    try {
      const text = await file.text();
      setResumeText(text);
      setError(null);
    } catch {
      setError("Failed to read file. Please paste your resume text directly.");
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || resumeText.trim().length < 50) {
      setError("Please provide at least 50 characters of resume content to analyze.");
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/resumes/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed.");
        setAnalyzing(false);
        return;
      }

      setCurrentAnalysis(data.analysis);
      fetchHistory();
      setAnalyzing(false);
    } catch {
      setError("An unexpected network error occurred.");
      setAnalyzing(false);
    }
  };

  return (
    <DashboardShell
      title="AI Resume Analyzer"
      description="In-depth structural audit, quantifiable metric density, and ATS optimization suggestions."
    >
      <div className="space-y-6 max-w-5xl">
        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewTab("analyze")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                viewTab === "analyze"
                  ? "bg-[#17162E] text-white"
                  : "text-[#6F6D82] hover:bg-white"
              }`}
            >
              Analyze Resume
            </button>
            <button
              onClick={() => setViewTab("history")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                viewTab === "history"
                  ? "bg-[#17162E] text-white"
                  : "text-[#6F6D82] hover:bg-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Past Audits ({pastAnalyses.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#6F6D82]">
            <ShieldCheck className="w-4 h-4 text-[#16856B]" />
            <span>Private & Encrypted Analysis</span>
          </div>
        </div>

        {viewTab === "analyze" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#7667F7]" />
                    Resume Input
                  </h2>
                </div>

                {error && (
                  <Alert type="error" title="Input Issue">
                    {error}
                  </Alert>
                )}

                {/* File Upload Box */}
                <div className="p-4 rounded-xl border-2 border-dashed border-[#E7E5EF] hover:border-[#7667F7]/50 text-center space-y-2 transition-colors bg-[#F8F7F2]/40">
                  <Upload className="w-6 h-6 text-[#7667F7] mx-auto" />
                  <div>
                    <label className="text-xs font-bold text-[#7667F7] hover:underline cursor-pointer">
                      Upload Resume File (TXT, Markdown)
                      <input
                        type="file"
                        accept=".txt,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-[#6F6D82] mt-0.5">Maximum file size: 5MB</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E7E5EF]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[10px] font-semibold text-[#6F6D82]">or paste text</span>
                  </div>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div>
                    <textarea
                      rows={12}
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Paste your raw resume text here (Education, Experience, Technical Skills, Projects)..."
                      className="w-full p-3 text-xs bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7] font-mono leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={analyzing}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Evaluating Structure & Rubrics...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Run AI Resume Audit
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7 space-y-4">
              {currentAnalysis ? (
                <div className="space-y-4">
                  {/* Score Breakdown Banner */}
                  <div className="p-6 rounded-2xl bg-[#17162E] text-white shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#A19FB6]">Overall Rubric Score</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#7667F7]/30 text-[#EAE7FF] border border-[#7667F7]/40 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {currentAnalysis.ai_provider}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-white">{currentAnalysis.overall_score}</span>
                      <span className="text-xs text-[#16856B] font-semibold bg-[#16856B]/20 px-2 py-0.5 rounded">
                        / 100 Structural Rating
                      </span>
                    </div>

                    <p className="text-xs text-[#A19FB6] leading-relaxed">
                      {currentAnalysis.summary}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                      <div className="p-2 rounded-lg bg-[#22213F]">
                        <span className="text-[10px] text-[#A19FB6] block">Formatting</span>
                        <span className="text-sm font-bold text-white">{currentAnalysis.formatting_score}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#22213F]">
                        <span className="text-[10px] text-[#A19FB6] block">Impact & Verbs</span>
                        <span className="text-sm font-bold text-white">{currentAnalysis.impact_score}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#22213F]">
                        <span className="text-[10px] text-[#A19FB6] block">Skill Coverage</span>
                        <span className="text-sm font-bold text-white">{currentAnalysis.skills_score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Detected */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E] flex items-center justify-between">
                      <span>Detected Technical Skills ({currentAnalysis.skills_detected.length})</span>
                      <Badge variant="violet">Verified</Badge>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {currentAnalysis.skills_detected.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EAE7FF] text-[#7667F7] border border-[#7667F7]/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-2.5">
                      <h4 className="text-xs font-bold text-[#16856B] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Identified Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#25243A]">
                        {currentAnalysis.strengths.map((st, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#16856B] font-bold">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-2.5">
                      <h4 className="text-xs font-bold text-[#A96513] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Areas For Improvement
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#25243A]">
                        {currentAnalysis.weaknesses.map((wk, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#A96513] font-bold">•</span>
                            <span>{wk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Concrete Before/After Rewrites */}
                  {currentAnalysis.improvements && currentAnalysis.improvements.length > 0 && (
                    <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">Actionable Before & After Rewrites</h3>
                      <div className="space-y-3">
                        {currentAnalysis.improvements.map((imp, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-[#E7E5EF] bg-[#F8F7F2]/50 space-y-2">
                            <p className="text-xs font-bold text-[#7667F7]">{imp.section}: {imp.suggestion}</p>
                            {imp.before && (
                              <div className="text-[11px] bg-red-50 text-red-900 p-2 rounded border border-red-200">
                                <strong>Original:</strong> {imp.before}
                              </div>
                            )}
                            {imp.after && (
                              <div className="text-[11px] bg-emerald-50 text-emerald-900 p-2 rounded border border-emerald-200">
                                <strong>High-Impact Rewrite:</strong> {imp.after}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Roles & Keyword Gaps */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">Recommended Matching Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.recommended_roles.map(r => (
                        <span key={r} className="px-3 py-1 rounded-full text-xs font-bold bg-[#16856B]/10 text-[#16856B] border border-[#16856B]/20">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-2xl bg-white border border-[#E7E5EF] text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-[#EAE7FF] text-[#7667F7] flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#17162E]">No Active Resume Audit</h3>
                  <p className="text-xs text-[#6F6D82] max-w-sm mx-auto">
                    Paste your resume text or upload a document on the left and run the audit to receive full scoring and concrete suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewTab === "history" && (
          <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#17162E]">Audit History Records</h2>
            {pastAnalyses.length === 0 ? (
              <p className="text-xs text-[#6F6D82]">No past audits recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {pastAnalyses.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentAnalysis(item);
                      setViewTab("analyze");
                    }}
                    className="p-4 rounded-xl border border-[#E7E5EF] hover:border-[#7667F7] hover:bg-[#F8F7F2]/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-[#17162E]">{item.overall_score}/100</span>
                        <span className="text-xs text-[#6F6D82]">• {item.created_at}</span>
                      </div>
                      <p className="text-xs text-[#6F6D82] line-clamp-1">{item.summary}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7667F7]">View Details →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
