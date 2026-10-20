"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/ui/Badge";
import {
  FileText,
  Target,
  Compass,
  MessagesSquare,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  AlertTriangle
} from "lucide-react";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    targetRole: string;
    currentStage: string;
  };
  stats: {
    totalApplications: number;
    applicationsByStatus: Record<string, number>;
    activeInterviews: number;
    offersReceived: number;
    latestResumeScore: number | null;
    resumeBreakdown: {
      overall_score: number;
      formatting_score: number;
      impact_score: number;
      skills_score: number;
      created_at: string;
    } | null;
    activeRoadmap: {
      title: string;
      target_role: string;
      progress_percent: number;
    } | null;
    completedInterviewsCount: number;
    averageInterviewScore: number;
    upcomingReminders: Array<{
      id: string;
      title: string;
      due_date: string;
      is_completed: number;
      reminder_type: string;
    }>;
    profileCompletionPercent: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleReminder = async (id: string, currentState: number) => {
    try {
      await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isCompleted: currentState === 0 })
      });
      fetchDashboard();
    } catch (err) {
      console.error("Failed to toggle reminder:", err);
    }
  };

  if (loading || !data) {
    return (
      <DashboardShell title="Dashboard" description="Loading your career intelligence...">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#7667F7] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  const { user, stats } = data;

  return (
    <DashboardShell
      title={`Welcome back, ${user.name}`}
      description={`Target Role: ${user.targetRole || "Software Engineer"} • Stage: ${user.currentStage || "Candidate"}`}
    >
      <div className="space-y-8">
        {/* Profile Completion Bar */}
        <div className="p-4 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#EAE7FF] text-[#7667F7] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#17162E]">Career Profile Strength: {stats.profileCompletionPercent}%</p>
              <p className="text-[11px] text-[#6F6D82]">Complete your education, skills, and links to unlock optimal roadmaps.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <div className="w-32 bg-[#E7E5EF] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#16856B] h-full transition-all"
                style={{ width: `${stats.profileCompletionPercent}%` }}
              />
            </div>
            <Link
              href="/profile"
              className="text-xs font-semibold text-[#7667F7] hover:underline shrink-0"
            >
              Update Profile →
            </Link>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Resume Score */}
          <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#6F6D82]">
              <span className="text-xs font-bold uppercase tracking-wider">Resume Score</span>
              <FileText className="w-4 h-4 text-[#7667F7]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#17162E]">
                {stats.latestResumeScore !== null ? stats.latestResumeScore : "—"}
              </span>
              <span className="text-xs text-[#16856B] font-semibold">
                {stats.latestResumeScore !== null ? "/ 100" : "No scan yet"}
              </span>
            </div>
            <Link
              href="/resume-analyzer"
              className="text-xs font-semibold text-[#7667F7] hover:underline flex items-center gap-1"
            >
              {stats.latestResumeScore !== null ? "View Full Audit" : "Analyze Resume"} →
            </Link>
          </div>

          {/* Card 2: Applications Tracked */}
          <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#6F6D82]">
              <span className="text-xs font-bold uppercase tracking-wider">Job Applications</span>
              <Briefcase className="w-4 h-4 text-[#A96513]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#17162E]">{stats.totalApplications}</span>
              <span className="text-xs text-[#6F6D82]">Active pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#6F6D82]">
              <span>Interviews: <strong className="text-[#7667F7]">{stats.activeInterviews}</strong></span>
              <span>Offers: <strong className="text-[#16856B]">{stats.offersReceived}</strong></span>
            </div>
          </div>

          {/* Card 3: Roadmap Progress */}
          <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#6F6D82]">
              <span className="text-xs font-bold uppercase tracking-wider">Roadmap Progress</span>
              <Compass className="w-4 h-4 text-[#16856B]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#17162E]">
                {stats.activeRoadmap ? `${stats.activeRoadmap.progress_percent}%` : "0%"}
              </span>
              <span className="text-xs text-[#6F6D82]">Milestones completed</span>
            </div>
            <Link
              href="/roadmap"
              className="text-xs font-semibold text-[#7667F7] hover:underline flex items-center gap-1"
            >
              {stats.activeRoadmap ? stats.activeRoadmap.title : "Generate Roadmap"} →
            </Link>
          </div>

          {/* Card 4: Interview Simulator */}
          <div className="p-5 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[#6F6D82]">
              <span className="text-xs font-bold uppercase tracking-wider">Interview Practice</span>
              <MessagesSquare className="w-4 h-4 text-[#7667F7]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#17162E]">
                {stats.averageInterviewScore > 0 ? `${stats.averageInterviewScore}%` : "—"}
              </span>
              <span className="text-xs text-[#6F6D82]">
                {stats.completedInterviewsCount} completed
              </span>
            </div>
            <Link
              href="/interview-prep"
              className="text-xs font-semibold text-[#7667F7] hover:underline flex items-center gap-1"
            >
              Start Practice Session →
            </Link>
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="p-6 rounded-2xl bg-[#17162E] text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Career Acceleration Tools</h2>
              <p className="text-xs text-[#A19FB6]">Direct access to career preparation engines</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#7667F7]/30 text-[#EAE7FF] border border-[#7667F7]/40">
              Interactive Tools
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/resume-analyzer"
              className="p-4 rounded-xl bg-[#22213F] hover:bg-[#2A294C] border border-white/5 transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#EAE7FF]">
                <FileText className="w-4 h-4 text-[#7667F7]" />
                Audit Resume
              </div>
              <p className="text-[11px] text-[#A19FB6]">Score impact verbs, metrics & keyword coverage.</p>
            </Link>

            <Link
              href="/job-matching"
              className="p-4 rounded-xl bg-[#22213F] hover:bg-[#2A294C] border border-white/5 transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#EAE7FF]">
                <Target className="w-4 h-4 text-[#16856B]" />
                Match Job Posting
              </div>
              <p className="text-[11px] text-[#A19FB6]">Detect missing skills & tailor resume bullets.</p>
            </Link>

            <Link
              href="/interview-prep"
              className="p-4 rounded-xl bg-[#22213F] hover:bg-[#2A294C] border border-white/5 transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#EAE7FF]">
                <MessagesSquare className="w-4 h-4 text-[#998DF9]" />
                Practice Interview
              </div>
              <p className="text-[11px] text-[#A19FB6]">Technical & STAR behavioral mock answers.</p>
            </Link>

            <Link
              href="/applications"
              className="p-4 rounded-xl bg-[#22213F] hover:bg-[#2A294C] border border-white/5 transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#EAE7FF]">
                <Briefcase className="w-4 h-4 text-[#A96513]" />
                Track Applications
              </div>
              <p className="text-[11px] text-[#A19FB6]">Manage pipeline status & follow-up dates.</p>
            </Link>
          </div>
        </div>

        {/* Two Column Layout: Application Pipeline & Upcoming Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Application Pipeline Summary */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#17162E]">Job Application Pipeline</h3>
                <p className="text-xs text-[#6F6D82]">Distribution of applications across stages</p>
              </div>
              <Link href="/applications" className="text-xs font-semibold text-[#7667F7] hover:underline">
                View All Applications →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Applied", count: stats.applicationsByStatus.applied, color: "text-[#7667F7] bg-[#EAE7FF]/50" },
                { label: "Assessment", count: stats.applicationsByStatus.assessment, color: "text-[#7667F7] bg-[#7667F7]/10" },
                { label: "Interview", count: stats.applicationsByStatus.interview, color: "text-[#16856B] bg-[#16856B]/10" },
                { label: "Offers", count: stats.applicationsByStatus.offer, color: "text-[#16856B] bg-[#16856B]/20" }
              ].map(item => (
                <div key={item.label} className={`p-3.5 rounded-xl border border-[#E7E5EF] ${item.color}`}>
                  <span className="text-xs font-semibold block">{item.label}</span>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Active Roadmap preview if present */}
            {stats.activeRoadmap && (
              <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E7E5EF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17162E] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#7667F7]" />
                    Active Roadmap: {stats.activeRoadmap.title}
                  </span>
                  <span className="text-xs font-bold text-[#16856B]">
                    {stats.activeRoadmap.progress_percent}%
                  </span>
                </div>
                <div className="w-full bg-[#E7E5EF] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#7667F7] h-full transition-all"
                    style={{ width: `${stats.activeRoadmap.progress_percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Upcoming Reminders & Actions */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#17162E] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#7667F7]" />
                Upcoming Action Alerts
              </h3>
              <span className="text-xs text-[#6F6D82]">{stats.upcomingReminders.length} pending</span>
            </div>

            {stats.upcomingReminders.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#16856B] mx-auto" />
                <p className="text-xs font-semibold text-[#17162E]">All actions up to date!</p>
                <p className="text-[11px] text-[#6F6D82]">Add a follow-up date when creating a job application.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.upcomingReminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className="p-3 rounded-xl border border-[#E7E5EF] bg-[#F8F7F2]/60 hover:bg-[#F8F7F2] flex items-start justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#17162E] leading-snug">{reminder.title}</p>
                      <p className="text-[11px] text-[#6F6D82] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#A96513]" /> Due: {reminder.due_date}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleReminder(reminder.id, reminder.is_completed)}
                      className="p-1 rounded text-[#6F6D82] hover:text-[#16856B]"
                      title="Mark as done"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
