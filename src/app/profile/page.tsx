"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Alert } from "@/components/ui/Alert";
import { User, Briefcase, GraduationCap, Link2, Sparkles, Plus, Trash2, CheckCircle2, Target } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form State
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [currentStage, setCurrentStage] = useState("student");
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Education items
  const [education, setEducation] = useState<Array<{ institution: string; degree: string; field: string; gradYear: string }>>([]);

  // Projects
  const [projects, setProjects] = useState<Array<{ title: string; description: string; techStack: string; link: string }>>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          const p = data.profile;
          setHeadline(p.headline || "");
          setPhone(p.phone || "");
          setLocation(p.location || "");
          setCurrentStage(p.current_stage || "student");
          setTargetRole(p.target_role || "");
          setTargetIndustry(p.target_industry || "");
          setExperienceLevel(p.experience_level || "entry");
          setBio(p.bio || "");
          setLinkedinUrl(p.linkedin_url || "");
          setGithubUrl(p.github_url || "");
          setPortfolioUrl(p.portfolio_url || "");
          setSkills(JSON.parse(p.skills_data || "[]"));
          setEducation(JSON.parse(p.education_data || "[]"));
          setProjects(JSON.parse(p.projects_data || "[]"));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { institution: "", degree: "B.S.", field: "Computer Science", gradYear: "2026" }
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { title: "", description: "", techStack: "", link: "" }
    ]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          phone,
          location,
          current_stage: currentStage,
          target_role: targetRole,
          target_industry: targetIndustry,
          experience_level: experienceLevel,
          skills_data: skills,
          education_data: education,
          projects_data: projects,
          bio,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          portfolio_url: portfolioUrl,
          onboarding_completed: 1
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      title="Career Profile"
      description="Manage your professional background, target goals, and skill competencies."
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {savedSuccess && (
          <Alert type="success" title="Profile Updated Successfully!">
            Your career profile changes have been saved and applied to your roadmaps and job matching models.
          </Alert>
        )}

        {/* Section 1: Target Career Focus */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#7667F7]" />
            Career Focus & Current Stage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Full-Stack Software Engineer"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Target Industry</label>
              <input
                type="text"
                value={targetIndustry}
                onChange={e => setTargetIndustry(e.target.value)}
                placeholder="e.g. Technology / SaaS / FinTech"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Current Career Stage</label>
              <select
                value={currentStage}
                onChange={e => setCurrentStage(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
              >
                <option value="student">College Student</option>
                <option value="fresh_grad">Recent Graduate</option>
                <option value="career_changer">Career Changer</option>
                <option value="job_seeker">Active Job Seeker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
              >
                <option value="entry">Entry-Level (0-2 years)</option>
                <option value="mid">Mid-Level (2-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Details & Narrative */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
            <User className="w-4 h-4 text-[#7667F7]" />
            Personal Details & Professional Headline
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="e.g. Aspiring Software Engineer | React, Next.js & Node.js Enthusiast"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (Open to Remote)"
                  className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Career Bio / Summary</label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Brief summary of your professional journey, passion, and engineering aspirations..."
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7667F7]" />
            Skills & Competencies
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Add Skill (Type and hit Enter)</label>
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="e.g. TypeScript, Docker, PostgreSQL, REST APIs..."
              className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF] focus:outline-none focus:ring-2 focus:ring-[#7667F7] mb-3"
            />

            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAE7FF] text-[#7667F7] border border-[#7667F7]/30"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-[#C43D50] ml-0.5 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Education */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#7667F7]" />
              Education History
            </h2>
            <button
              type="button"
              onClick={handleAddEducation}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#7667F7] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Institution
            </button>
          </div>

          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#E7E5EF] bg-[#F8F7F2]/50 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="absolute top-3 right-3 text-[#6F6D82] hover:text-[#C43D50]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6F6D82] mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={e => {
                        const copy = [...education];
                        copy[idx].institution = e.target.value;
                        setEducation(copy);
                      }}
                      placeholder="University Name"
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-[#E7E5EF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6F6D82] mb-1">Degree & Field</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={e => {
                        const copy = [...education];
                        copy[idx].degree = e.target.value;
                        setEducation(copy);
                      }}
                      placeholder="B.S. Computer Science"
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-[#E7E5EF]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Online Presence & Links */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#17162E] flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#7667F7]" />
            Online Portfolios & Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Portfolio Website</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://yourname.dev"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25 transition-all disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Career Profile"}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
