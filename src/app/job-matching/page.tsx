"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Target, Sparkles, CheckCircle2, AlertTriangle, Briefcase, Trash2, ArrowRight, Layers } from "lucide-react";

interface JobMatchItem {
  id: string;
  job_title: string;
  company: string | null;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  partially_matched: string[];
  strengths_for_role: string[];
  recommendations: string[];
  tailored_bullet_points: string[];
  interview_prep_questions: string[];
  created_at: string;
}

export default function JobMatchingPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [matches, setMatches] = useState<JobMatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<JobMatchItem | null>(null);

  const fetchMatches = () => {
    fetch("/api/job-matches")
      .then(res => res.json())
      .then(data => {
        if (data.matches) {
          setMatches(data.matches);
          if (data.matches.length > 0 && !selectedMatch) {
            setSelectedMatch(data.matches[0]);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription || jobDescription.trim().length < 30) {
      setError("Please paste a job description with at least 30 characters.");
      return;
    }

    setError(null);
    setMatching(true);

    try {
      const res = await fetch("/api/job-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle || "Target Role",
          company: company || "Target Company",
          jobDescription
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Job match failed.");
        setMatching(false);
        return;
      }

      setSelectedMatch(data.match);
      fetchMatches();
      setJobDescription("");
      setJobTitle("");
      setCompany("");
      setMatching(false);
    } catch {
      setError("Failed to run match analysis.");
      setMatching(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/job-matches/${id}`, { method: "DELETE" });
      if (selectedMatch?.id === id) {
        setSelectedMatch(null);
      }
      fetchMatches();
    } catch (err) {
      console.error("Delete job match error:", err);
    }
  };

  return (
    <DashboardShell
      title="Job Description Matching & Gap Analysis"
      description="Compare your credentials against target job postings to uncover gaps and generate tailored bullet points."
    >
      <div className="space-y-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#16856B]" />
                Job Posting Details
              </h2>

              {error && (
                <Alert type="error" title="Input Notice">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleRunMatch} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#25243A] mb-1">Target Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Associate Full-Stack Engineer"
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#25243A] mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Acme Cloud Corp"
                    className="w-full px-3.5 py-2 text-xs bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#25243A] mb-1">Job Description Requirements</label>
                  <textarea
                    rows={8}
                    required
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder="Paste job description requirements, responsibilities, and tech stack here..."
                    className="w-full p-3 text-xs bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7] font-mono leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={matching}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#16856B] hover:bg-[#16856B]/90 shadow-md shadow-[#16856B]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {matching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Comparing Profile & Gaps...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Run Job Description Match
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Past Matches List */}
            {matches.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">Saved Job Matches ({matches.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {matches.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        selectedMatch?.id === m.id
                          ? "border-[#7667F7] bg-[#EAE7FF]/30 font-semibold"
                          : "border-[#E7E5EF] hover:bg-[#F8F7F2]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[#17162E]">{m.job_title} {m.company ? `(${m.company})` : ""}</p>
                        <p className="text-[10px] text-[#6F6D82]">{m.match_score}% Match</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(m.id);
                        }}
                        className="text-[#6F6D82] hover:text-[#C43D50] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {selectedMatch ? (
              <div className="space-y-4">
                {/* Score Card */}
                <div className="p-6 rounded-2xl bg-[#17162E] text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedMatch.job_title}</h3>
                      <p className="text-xs text-[#A19FB6]">{selectedMatch.company || "Target Opportunity"}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#16856B]/30 text-[#EAE7FF] border border-[#16856B]/40">
                      {selectedMatch.match_score >= 75 ? "High Fit" : "Moderate Alignment"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{selectedMatch.match_score}%</span>
                    <span className="text-xs text-[#A19FB6]">Skill & Requirement Overlap</span>
                  </div>

                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#16856B] h-full"
                      style={{ width: `${selectedMatch.match_score}%` }}
                    />
                  </div>
                </div>

                {/* Skills Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Matched Skills */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-2.5">
                    <h4 className="text-xs font-bold text-[#16856B] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Matched Required Skills ({selectedMatch.matched_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMatch.matched_skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#16856B]/10 text-[#16856B] border border-[#16856B]/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-2.5">
                    <h4 className="text-xs font-bold text-[#C43D50] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Identified Skill Gaps ({selectedMatch.missing_skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMatch.missing_skills.length > 0 ? (
                        selectedMatch.missing_skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#C43D50]/10 text-[#C43D50] border border-[#C43D50]/20">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#16856B]">Zero gaps identified!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tailored Bullet Points */}
                <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">Tailored Resume Bullet Points</h3>
                  <div className="space-y-2">
                    {selectedMatch.tailored_bullet_points.map((pt, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#F8F7F2]/60 border border-[#E7E5EF] text-xs text-[#25243A] leading-relaxed">
                        • {pt}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Prep Questions */}
                <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">Probable Interview Questions For This Role</h3>
                  <div className="space-y-2">
                    {selectedMatch.interview_prep_questions.map((q, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#EAE7FF]/30 border border-[#7667F7]/20 text-xs text-[#25243A] font-medium">
                        Q{i+1}: {q}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white border border-[#E7E5EF] text-center space-y-3 shadow-sm">
                <Target className="w-12 h-12 text-[#16856B] mx-auto opacity-70" />
                <h3 className="text-base font-bold text-[#17162E]">No Job Match Selected</h3>
                <p className="text-xs text-[#6F6D82] max-w-sm mx-auto">
                  Paste a job description on the left to extract skills, evaluate overlap, and generate tailored resume points.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
