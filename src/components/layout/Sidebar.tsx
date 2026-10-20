"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FileText,
  Target,
  Compass,
  MessagesSquare,
  Briefcase,
  LogOut,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role?: string;
  } | null;
  onCloseMobile?: () => void;
}

export function Sidebar({ user, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Career Profile", href: "/profile", icon: User },
    { label: "AI Resume Analyzer", href: "/resume-analyzer", icon: FileText, badge: "AI" },
    { label: "Job Description Match", href: "/job-matching", icon: Target, badge: "AI" },
    { label: "Career Roadmap", href: "/roadmap", icon: Compass },
    { label: "AI Interview Practice", href: "/interview-prep", icon: MessagesSquare, badge: "Interactive" },
    { label: "Application Tracker", href: "/applications", icon: Briefcase }
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside className="w-64 h-full bg-[#17162E] text-white flex flex-col justify-between border-r border-[#22213F] select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#22213F] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7667F7] to-[#998DF9] flex items-center justify-center text-white shadow-md shadow-[#7667F7]/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                CareerPilot <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#7667F7]/30 text-[#EAE7FF] border border-[#7667F7]/40">AI</span>
              </span>
              <p className="text-[10px] text-[#A19FB6] font-medium tracking-wide">SaaS Workspace</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 space-y-1">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6F6D82]">
            Career Tools
          </p>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#7667F7] text-white font-semibold shadow-md shadow-[#7667F7]/25"
                    : "text-[#A19FB6] hover:bg-[#22213F] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#7667F7]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#7667F7]/20 text-[#EAE7FF] border border-[#7667F7]/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#22213F] bg-[#141328]">
        <div className="flex items-center justify-between gap-3 mb-3 px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#7667F7]/30 border border-[#7667F7]/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Candidate"}</p>
              <p className="text-[10px] text-[#A19FB6] truncate">{user?.email || "candidate@careerpilot.ai"}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#A19FB6] hover:text-[#C43D50] hover:bg-[#C43D50]/10 rounded-lg transition-colors border border-transparent hover:border-[#C43D50]/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
