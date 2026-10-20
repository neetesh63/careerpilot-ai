"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, GraduationCap, Briefcase, Compass, Layers, Award } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Stage & Role
  const [currentStage, setCurrentStage] = useState("student");
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer");

  // Step 2: Experience & Skills
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [targetIndustry, setTargetIndustry] = useState("Technology / SaaS");
  const [skills, setSkills] = useState(["TypeScript", "React", "Node.js", "SQL", "Git"]);
  const [newSkill, setNewSkill] = useState("");

  // Step 3: Education & Links
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("B.S. in Computer Science");
  const [gradYear, setGradYear] = useState("2026");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_stage: currentStage,
          target_role: targetRole,
          target_industry: targetIndustry,
          experience_level: experienceLevel,
          skills_data: skills,
          education_data: institution ? [{ institution, degree, gradYear }] : [],
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          onboarding_completed: 1
        })
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE7FF] text-[#7667F7] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to CareerPilot AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17162E] tracking-tight">
            Personalize Your Career Journey
          </h1>
          <p className="text-xs text-[#6F6D82]">Step {step} of 3 — Tailoring roadmaps and interview simulations to your goals.</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E7E5EF] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#7667F7] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E7E5EF] shadow-xl shadow-black/5 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#17162E] mb-2">What best describes your current career stage?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "student", label: "College Student", desc: "Preparing for campus placements or internships", icon: GraduationCap },
                    { id: "fresh_grad", label: "Recent Graduate", desc: "Seeking first full-time professional role", icon: Award },
                    { id: "career_changer", label: "Career Changer", desc: "Pivoting into tech or a new domain", icon: Compass },
                    { id: "job_seeker", label: "Active Job Seeker", desc: "Ready to advance or change companies", icon: Briefcase }
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = currentStage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentStage(item.id)}
                        className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          isSelected
                            ? "border-[#7667F7] bg-[#EAE7FF]/30 ring-2 ring-[#7667F7]/20"
                            : "border-[#E7E5EF] hover:border-[#7667F7]/40 bg-[#F8F7F2]/50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-[#7667F7] text-white" : "bg-white text-[#6F6D82]"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#17162E]">{item.label}</p>
                          <p className="text-[11px] text-[#6F6D82] mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">What is your primary target role?</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Full-Stack Software Engineer, Frontend Developer, Data Analyst"
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                >
                  <option value="entry">Entry-Level (0 - 2 years)</option>
                  <option value="mid">Mid-Level (2 - 5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Target Industry</label>
                <input
                  type="text"
                  value={targetIndustry}
                  onChange={e => setTargetIndustry(e.target.value)}
                  placeholder="e.g. SaaS, FinTech, E-Commerce, HealthTech"
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Your Core Skills (Type & Press Enter)</label>
                <input
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="e.g. Python, Docker, Next.js, PostgreSQL..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7] mb-3"
                />

                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAE7FF] text-[#7667F7] border border-[#7667F7]/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-[#C43D50] ml-0.5 text-xs font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">College or University</label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. State University of Technology"
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Degree / Major</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={e => setDegree(e.target.value)}
                    placeholder="B.S. Computer Science"
                    className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Graduation Year</label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={e => setGradYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">LinkedIn Profile URL (Optional)</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">GitHub or Portfolio URL (Optional)</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E7E5EF]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6D82] hover:text-[#17162E]"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="text-xs text-[#6F6D82] hover:underline"
              >
                Skip for now
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#16856B] hover:bg-[#16856B]/90 shadow-md shadow-[#16856B]/25 disabled:opacity-50"
              >
                {saving ? "Finalizing Workspace..." : "Complete & Enter Dashboard"}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
