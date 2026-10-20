"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Menu, X, Sparkles, ShieldCheck, Cpu } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DashboardShell({ children, title, description }: DashboardShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ activeProvider: string; info: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setUser(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        router.push("/login");
      });

    // Check AI status
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.aiStatus) {
          setAiStatus(data.aiStatus);
        }
      })
      .catch(() => {});
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#7667F7] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-[#6F6D82]">Loading your career workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative z-10 h-full w-64 max-w-[80vw]">
            <Sidebar user={user} onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-white bg-black/40 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E7E5EF] px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#25243A] hover:bg-[#F8F7F2] rounded-lg"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-[#17162E] tracking-tight">{title || "Dashboard"}</h1>
              {description && <p className="text-xs text-[#6F6D82] hidden sm:block">{description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Provider Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAE7FF] text-[#7667F7] border border-[#7667F7]/30 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>{aiStatus?.activeProvider === "gemini" ? "Google Gemini AI" : "Heuristic AI Engine"}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#16856B] bg-[#16856B]/10 border border-[#16856B]/20 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Session Active</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
