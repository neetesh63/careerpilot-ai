"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, UserCheck, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[#E7E5EF]/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#17162E] to-[#7667F7] flex items-center justify-center text-white shadow-md shadow-[#7667F7]/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#EAE7FF]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#17162E] dark:text-white flex items-center gap-1.5">
              CareerPilot <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#EAE7FF] text-[#7667F7] border border-[#7667F7]/30">AI</span>
            </span>
            <p className="text-[10px] text-[#6F6D82] font-medium tracking-wide -mt-0.5">Career Acceleration Platform</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6F6D82]">
          <Link href="#features" className="hover:text-[#7667F7] transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-[#7667F7] transition-colors">How It Works</Link>
          <Link href="#tools" className="hover:text-[#7667F7] transition-colors">Career Tools</Link>
          <Link href="#pricing" className="hover:text-[#7667F7] transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-[#7667F7] transition-colors">FAQ</Link>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#17162E] hover:bg-[#22213F] rounded-xl shadow-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-[#7667F7]" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-[#25243A] hover:text-[#7667F7] px-3.5 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] rounded-xl shadow-md shadow-[#7667F7]/25 transition-all hover:translate-y-[-1px]"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
