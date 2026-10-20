"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Layers
} from "lucide-react";

interface Milestone {
  id: string;
  milestone_order: number;
  title: string;
  category: string;
  description: string;
  estimated_weeks: number;
  learning_resources: Array<{ name: string; url: string; type: string }>;
  project_task: string;
  is_completed: number;
  deadline_date: string | null;
}

interface RoadmapItem {
  id: string;
  title: string;
  target_role: string;
  timeframe_months: number;
  weekly_hours: number;
  skill_categories: string[];
  progress_percent: number;
  milestones: Milestone[];
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // New roadmap modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [timeframeMonths, setTimeframeMonths] = useState(6);

  // Add custom milestone modal
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [mTitle, setMTitle] = useState("");
  const [mCategory, setMCategory] = useState("Core Skills");
  const [mDescription, setMDescription] = useState("");
  const [mWeeks, setMWeeks] = useState(2);
  const [mProject, setMProject] = useState("");

  const fetchRoadmaps = () => {
    fetch("/api/roadmaps")
      .then(res => res.json())
      .then(async data => {
        if (data.roadmaps && data.roadmaps.length > 0) {
          // Fetch full details of first roadmap
          const fullRes = await fetch(`/api/roadmaps/${data.roadmaps[0].id}`);
          const fullData = await fullRes.json();
          setActiveRoadmap(fullData.roadmap);
          setRoadmaps(data.roadmaps);
        } else {
          setActiveRoadmap(null);
          setRoadmaps([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleSelectRoadmap = async (id: string) => {
    try {
      const res = await fetch(`/api/roadmaps/${id}`);
      const data = await res.json();
      setActiveRoadmap(data.roadmap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          weeklyHours,
          timeframeMonths
        })
      });

      const data = await res.json();
      if (res.ok && data.roadmap) {
        setIsModalOpen(false);
        setActiveRoadmap(data.roadmap);
        fetchRoadmaps();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentState: number) => {
    if (!activeRoadmap) return;

    try {
      const res = await fetch(`/api/roadmaps/${activeRoadmap.id}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: currentState === 0 })
      });

      const data = await res.json();
      if (res.ok) {
        setActiveRoadmap({
          ...activeRoadmap,
          progress_percent: data.progress_percent,
          milestones: activeRoadmap.milestones.map(m =>
            m.id === milestoneId ? { ...m, is_completed: data.is_completed } : m
          )
        });
      }
    } catch (err) {
      console.error("Toggle milestone error:", err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoadmap) return;

    try {
      const res = await fetch(`/api/roadmaps/${activeRoadmap.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: mTitle,
          category: mCategory,
          description: mDescription,
          estimatedWeeks: mWeeks,
          projectTask: mProject
        })
      });

      if (res.ok) {
        setIsAddMilestoneOpen(false);
        handleSelectRoadmap(activeRoadmap.id);
        setMTitle("");
        setMDescription("");
        setMProject("");
      }
    } catch (err) {
      console.error("Add milestone error:", err);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!activeRoadmap) return;
    try {
      await fetch(`/api/roadmaps/${activeRoadmap.id}/milestones/${milestoneId}`, {
        method: "DELETE"
      });
      handleSelectRoadmap(activeRoadmap.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoadmap = async (id: string) => {
    try {
      await fetch(`/api/roadmaps/${id}`, { method: "DELETE" });
      fetchRoadmaps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell
      title="Personalized Career Roadmap"
      description="Step-by-step milestone tracking with verified learning resources and practical deliverables."
    >
      <div className="space-y-6 max-w-5xl">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E5EF] pb-4">
          <div className="flex items-center gap-3">
            {roadmaps.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelectRoadmap(r.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeRoadmap?.id === r.id
                    ? "bg-[#17162E] text-white"
                    : "bg-white text-[#6F6D82] border border-[#E7E5EF] hover:bg-[#F8F7F2]"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{r.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeRoadmap && (
              <button
                type="button"
                onClick={() => setIsAddMilestoneOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#E7E5EF] hover:bg-[#F8F7F2] text-[#25243A]"
              >
                <Plus className="w-3.5 h-3.5 text-[#7667F7]" />
                Add Milestone
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate New Roadmap
            </button>
          </div>
        </div>

        {activeRoadmap ? (
          <div className="space-y-6">
            {/* Roadmap Header Banner */}
            <div className="p-6 rounded-2xl bg-[#17162E] text-white shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeRoadmap.title}</h2>
                  <p className="text-xs text-[#A19FB6] mt-0.5">
                    Target Role: <strong className="text-white">{activeRoadmap.target_role}</strong> • {activeRoadmap.weekly_hours} hrs/week commitment
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#16856B]/30 text-[#EAE7FF] border border-[#16856B]/40">
                    {activeRoadmap.progress_percent}% Completed
                  </span>
                  <button
                    onClick={() => handleDeleteRoadmap(activeRoadmap.id)}
                    className="p-1.5 text-[#A19FB6] hover:text-[#C43D50] rounded-lg"
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#16856B] h-full transition-all duration-300"
                  style={{ width: `${activeRoadmap.progress_percent}%` }}
                />
              </div>

              {/* Category Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {activeRoadmap.skill_categories.map(cat => (
                  <span key={cat} className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-white/10 text-[#EAE7FF]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17162E]">
                Ordered Learning Milestones ({activeRoadmap.milestones.length})
              </h3>

              {activeRoadmap.milestones.map((milestone, idx) => {
                const isCompleted = milestone.is_completed === 1;
                return (
                  <div
                    key={milestone.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      isCompleted
                        ? "bg-white border-[#16856B]/30 shadow-sm opacity-90"
                        : "bg-white border-[#E7E5EF] shadow-md hover:border-[#7667F7]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleMilestone(milestone.id, milestone.is_completed)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isCompleted
                              ? "bg-[#16856B] border-[#16856B] text-white"
                              : "border-[#6F6D82]/40 hover:border-[#7667F7]"
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EAE7FF] text-[#7667F7]">
                              Milestone {idx + 1} • {milestone.category}
                            </span>
                            <span className="text-xs text-[#6F6D82] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#A96513]" /> ~{milestone.estimated_weeks} weeks
                            </span>
                            {milestone.deadline_date && (
                              <span className="text-xs text-[#6F6D82] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#7667F7]" /> Target: {milestone.deadline_date}
                              </span>
                            )}
                          </div>

                          <h4 className={`text-base font-bold text-[#17162E] ${isCompleted ? "line-through text-[#6F6D82]" : ""}`}>
                            {milestone.title}
                          </h4>

                          <p className="text-xs text-[#6F6D82] leading-relaxed">
                            {milestone.description}
                          </p>

                          {/* Project Deliverable */}
                          <div className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E7E5EF] text-xs text-[#25243A] space-y-1">
                            <strong className="text-[#17162E] block">🎯 Project Deliverable:</strong>
                            <p className="text-[#6F6D82]">{milestone.project_task}</p>
                          </div>

                          {/* Verified Resources Links */}
                          {milestone.learning_resources && milestone.learning_resources.length > 0 && (
                            <div className="pt-2">
                              <span className="text-[11px] font-bold text-[#17162E] block mb-1">
                                Verified Documentation & Tutorials:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {milestone.learning_resources.map((res, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EAE7FF]/60 hover:bg-[#EAE7FF] text-[#7667F7] border border-[#7667F7]/30 transition-colors"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>{res.name}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="text-[#6F6D82] hover:text-[#C43D50] p-1 shrink-0"
                        title="Remove milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white border border-[#E7E5EF] text-center space-y-3 shadow-sm">
            <Compass className="w-12 h-12 text-[#7667F7] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-[#17162E]">No Active Career Roadmap</h3>
            <p className="text-xs text-[#6F6D82] max-w-sm mx-auto">
              Generate a personalized milestone plan aligned with your target role and study availability.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Career Roadmap
            </button>
          </div>
        )}

        {/* Generate Roadmap Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Generate Personalized Career Roadmap"
          description="Build a milestone-driven roadmap customized to your career target."
        >
          <form onSubmit={handleGenerateRoadmap} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Target Role</label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Full-Stack Software Engineer, Frontend Engineer"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Weekly Hours</label>
                <input
                  type="number"
                  min={5}
                  max={40}
                  value={weeklyHours}
                  onChange={e => setWeeklyHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Timeframe (Months)</label>
                <select
                  value={timeframeMonths}
                  onChange={e => setTimeframeMonths(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
                >
                  <option value={3}>3 Months (Accelerated)</option>
                  <option value={6}>6 Months (Balanced)</option>
                  <option value={12}>12 Months (Comprehensive)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5EF]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F6D82]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] rounded-xl shadow-md shadow-[#7667F7]/25"
              >
                {generating ? "Generating..." : "Generate Roadmap"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Add Milestone Modal */}
        <Modal
          isOpen={isAddMilestoneOpen}
          onClose={() => setIsAddMilestoneOpen(false)}
          title="Add Custom Milestone"
          description="Add a personalized project or learning topic to your roadmap."
        >
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Milestone Title</label>
              <input
                type="text"
                required
                value={mTitle}
                onChange={e => setMTitle(e.target.value)}
                placeholder="e.g. Master Docker & Microservices"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Category</label>
                <input
                  type="text"
                  value={mCategory}
                  onChange={e => setMCategory(e.target.value)}
                  placeholder="e.g. Backend / DevOps"
                  className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Estimated Duration (Weeks)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={mWeeks}
                  onChange={e => setMWeeks(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Description</label>
              <textarea
                rows={3}
                required
                value={mDescription}
                onChange={e => setMDescription(e.target.value)}
                placeholder="Key concepts to learn and master..."
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#25243A] mb-1.5">Project Deliverable</label>
              <input
                type="text"
                value={mProject}
                onChange={e => setMProject(e.target.value)}
                placeholder="What project will demonstrate mastery?"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-[#E7E5EF]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5EF]">
              <button
                type="button"
                onClick={() => setIsAddMilestoneOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F6D82]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] rounded-xl shadow-md shadow-[#7667F7]/25"
              >
                Add Milestone
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
