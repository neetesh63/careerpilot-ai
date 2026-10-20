"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Target,
  Compass,
  MessagesSquare,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Terminal,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "How does the AI Resume Analyzer evaluate my resume?",
      a: "Our engine evaluates your resume against industry-standard engineering and professional rubrics. It examines formatting scanability, metric quantification density (quantifiable results), keyword alignment, and active leadership verbs, providing transparent before-and-after suggestions."
    },
    {
      q: "Can I use CareerPilot AI without an external AI API key?",
      a: "Yes! CareerPilot AI includes a built-in Deterministic Heuristic Engine that functions completely offline and locally with zero external API dependencies. If you configure a Google Gemini or OpenAI key, the platform seamlessly enhances analysis with live LLM capabilities."
    },
    {
      q: "Is my personal resume and job search data private?",
      a: "Completely private. All resumes, job matches, roadmap milestones, and application entries are stored strictly in your isolated user database with full relational security and server-side authorization checks."
    },
    {
      q: "How does Job Description Matching work?",
      a: "You paste any job description along with your resume or profile. The matching engine identifies exact required skills you already demonstrate, detects skill gaps, recommends tailored resume bullet points, and provides probable interview questions to prepare for."
    },
    {
      q: "What types of interview practice questions are supported?",
      a: "The practice simulator supports Technical Coding & System questions, Behavioral (STAR method) questions, Situational questions, and System Design fundamentals with multidimensional scoring across relevance, clarity, structure, and technical correctness."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#25243A] flex flex-col selection:bg-[#7667F7]/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 lg:px-8">
        {/* Soft background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#7667F7]/15 to-[#EAE7FF]/50 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAE7FF] text-[#7667F7] border border-[#7667F7]/30 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#7667F7]" />
            <span>AI-Powered Career Intelligence for Students & Job Seekers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#17162E] max-w-4xl mx-auto leading-[1.12]">
            Navigate Your Career Journey With <span className="bg-gradient-to-r from-[#7667F7] to-[#16856B] bg-clip-text text-transparent">Precision Intelligence</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6F6D82] max-w-2xl mx-auto leading-relaxed">
            Understand your skills, optimize your resume for target job descriptions, master interview practice, build personalized roadmaps, and organize applications in one unified workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-[#7667F7] hover:bg-[#6051E8] rounded-xl shadow-lg shadow-[#7667F7]/30 transition-all hover:translate-y-[-2px]"
            >
              Start Your Career Plan Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-[#17162E] bg-white hover:bg-[#F8F7F2] border border-[#E7E5EF] rounded-xl shadow-sm transition-all"
            >
              Explore Demo Account
            </Link>
          </div>

          <p className="text-xs text-[#6F6D82]">
            Demo credentials ready: <code className="bg-white px-2 py-0.5 rounded border border-[#E7E5EF] font-mono text-[#7667F7]">demo@careerpilot.ai</code> / <code className="bg-white px-2 py-0.5 rounded border border-[#E7E5EF] font-mono text-[#7667F7]">Demo@12345</code>
          </p>

          {/* Real Interactive Application Interface Mockup */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-[#E7E5EF] bg-white shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E5EF] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C43D50]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#A96513]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#16856B]/80" />
                  <span className="text-xs font-semibold text-[#6F6D82] ml-2">CareerPilot AI Workspace Preview</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded bg-[#16856B]/10 text-[#16856B] border border-[#16856B]/20">
                  <span className="w-2 h-2 rounded-full bg-[#16856B] animate-pulse"></span>
                  Live Platform Preview
                </div>
              </div>

              {/* Grid of Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Resume Score */}
                <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E7E5EF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F6D82]">Resume Intelligence</span>
                    <FileText className="w-4 h-4 text-[#7667F7]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#17162E]">84</span>
                    <span className="text-xs font-medium text-[#16856B]">/ 100 (Strong Match)</span>
                  </div>
                  <p className="text-xs text-[#6F6D82]">Identified 9 verified technical skills and quantifiable impact metrics.</p>
                </div>

                {/* Card 2: Job Match */}
                <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E7E5EF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F6D82]">Target Role Match</span>
                    <Target className="w-4 h-4 text-[#16856B]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#17162E]">88%</span>
                    <span className="text-xs font-medium text-[#16856B]">High Alignment</span>
                  </div>
                  <p className="text-xs text-[#6F6D82]">6 of 8 required skills matched for Full-Stack Software Engineer.</p>
                </div>

                {/* Card 3: Active Pipeline */}
                <div className="p-4 rounded-xl bg-[#F8F7F2] border border-[#E7E5EF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6F6D82]">Application Pipeline</span>
                    <Briefcase className="w-4 h-4 text-[#A96513]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#17162E]">4</span>
                    <span className="text-xs font-medium text-[#7667F7]">Applications Tracked</span>
                  </div>
                  <p className="text-xs text-[#6F6D82]">1 active interview scheduled with upcoming follow-up alert.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-t border-[#E7E5EF] px-4 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7667F7]">Product Capabilities</h2>
            <p className="text-3xl font-bold text-[#17162E] tracking-tight">Everything You Need To Secure Your Next Role</p>
            <p className="text-sm text-[#6F6D82]">A complete suite of practical career engineering tools built to help you prepare, optimize, and organize without clutter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E7E5EF] hover:border-[#7667F7]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#7667F7]/15 text-[#7667F7] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17162E]">AI Resume Analyzer</h3>
              <p className="text-xs text-[#6F6D82] leading-relaxed">
                Upload or paste your resume. Our engine extracts skills, computes quantifiable metrics density, evaluates layout scanability, and delivers concrete before-and-after improvements.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E7E5EF] hover:border-[#7667F7]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#16856B]/15 text-[#16856B] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17162E]">Job Description Matching</h3>
              <p className="text-xs text-[#6F6D82] leading-relaxed">
                Compare your credentials with any target job posting. Identify exact matched qualifications, detect high-priority skill gaps, and generate tailored resume bullet points.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E7E5EF] hover:border-[#7667F7]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#7667F7]/15 text-[#7667F7] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17162E]">Personalized Roadmaps</h3>
              <p className="text-xs text-[#6F6D82] leading-relaxed">
                Receive structured, milestone-driven learning roadmaps tailored to your target role, available weekly hours, and experience level with real verified resources.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E7E5EF] hover:border-[#7667F7]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#A96513]/15 text-[#A96513] flex items-center justify-center">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17162E]">AI Interview Practice</h3>
              <p className="text-xs text-[#6F6D82] leading-relaxed">
                Practice technical, behavioral, and situational questions. Submit your responses and receive multidimensional scoring covering relevance, clarity, structure, and model answers.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E7E5EF] hover:border-[#7667F7]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#16856B]/15 text-[#16856B] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17162E]">Application Tracker</h3>
              <p className="text-xs text-[#6F6D82] leading-relaxed">
                Organize your job search pipeline across Interested, Applied, Assessment, Interview, and Offer stages. Set follow-up reminders and export clean CSV reports.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E7E5EF] hover:border-[#7667F7]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#7667F7]/15 text-[#7667F7] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#17162E]">Progress Analytics</h3>
              <p className="text-xs text-[#6F6D82] leading-relaxed">
                Track your career preparation metrics over time. Monitor roadmap milestone completion, interview performance trajectory, and pipeline conversion rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7667F7]">Workflow Process</h2>
          <p className="text-3xl font-bold text-[#17162E] tracking-tight">How CareerPilot AI Guides You</p>
          <p className="text-sm text-[#6F6D82]">A systematic 4-step path from profile setup to job offer management.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-[#17162E] text-white flex items-center justify-center text-xs font-bold">1</span>
            <h3 className="text-sm font-bold text-[#17162E]">Build Profile & Upload Resume</h3>
            <p className="text-xs text-[#6F6D82]">Input your education, skills, and target role. Upload your current resume for automated section analysis.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-[#7667F7] text-white flex items-center justify-center text-xs font-bold">2</span>
            <h3 className="text-sm font-bold text-[#17162E]">Analyze Skill Gaps</h3>
            <p className="text-xs text-[#6F6D82]">Match your profile against job descriptions to discover missing competencies and tailor your bullet points.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-[#16856B] text-white flex items-center justify-center text-xs font-bold">3</span>
            <h3 className="text-sm font-bold text-[#17162E]">Follow Career Roadmap</h3>
            <p className="text-xs text-[#6F6D82]">Work through structured weekly milestones with verified learning documentation and project deliverables.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E7E5EF] space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-[#22213F] text-white flex items-center justify-center text-xs font-bold">4</span>
            <h3 className="text-sm font-bold text-[#17162E]">Practice & Track Pipeline</h3>
            <p className="text-xs text-[#6F6D82]">Simulate role interviews with instant rubric feedback and manage your job applications to the final offer.</p>
          </div>
        </div>
      </section>

      {/* Plan Preview Section */}
      <section id="pricing" className="py-20 bg-white border-t border-[#E7E5EF] px-4 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7667F7]">Platform Access</h2>
            <p className="text-3xl font-bold text-[#17162E] tracking-tight">Transparent Plan Preview</p>
            <p className="text-sm text-[#6F6D82]">All core career preparation features are fully enabled in the current release.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Plan */}
            <div className="p-8 rounded-2xl bg-[#F8F7F2] border border-[#E7E5EF] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E7E5EF] text-[#25243A]">Free Student Edition</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#17162E]">$0</span>
                  <span className="text-xs text-[#6F6D82]">/ forever</span>
                </div>
                <p className="text-xs text-[#6F6D82]">Complete career foundation for college students and recent grads.</p>

                <ul className="space-y-2.5 text-xs text-[#25243A]">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16856B]" /> Resume text analyzer & suggestions</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16856B]" /> Job description gap matching</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16856B]" /> Personalized career roadmap</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16856B]" /> Full job application tracker & CSV export</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#16856B]" /> Interactive interview practice sessions</li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center py-3 text-sm font-semibold rounded-xl bg-[#17162E] text-white hover:bg-[#22213F] transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-white border-2 border-[#7667F7] shadow-xl shadow-[#7667F7]/10 space-y-6 flex flex-col justify-between relative">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7667F7] text-white">Full Access Preview</span>
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAE7FF] text-[#7667F7]">Pro Career Accelerator</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#17162E]">$19</span>
                  <span className="text-xs text-[#6F6D82]">/ month (Feature Tier Preview)</span>
                </div>
                <p className="text-xs text-[#6F6D82]">Advanced career acceleration for job switchers and competitive roles.</p>

                <ul className="space-y-2.5 text-xs text-[#25243A]">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7667F7]" /> Everything in Student Plan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7667F7]" /> Unlimited live AI resume audits</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7667F7]" /> Tailored company-specific interview simulation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7667F7]" /> Advanced roadmap project reviews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7667F7]" /> Priority support & career analytics</li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full text-center py-3 text-sm font-semibold rounded-xl bg-[#7667F7] text-white hover:bg-[#6051E8] shadow-md shadow-[#7667F7]/25 transition-all"
              >
                Explore Pro Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7667F7]">Common Inquiries</h2>
          <p className="text-3xl font-bold text-[#17162E] tracking-tight">Frequently Asked Questions</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-[#E7E5EF] bg-white overflow-hidden transition-all">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left font-semibold text-sm text-[#17162E] flex items-center justify-between gap-4 hover:bg-[#F8F7F2]/50"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#7667F7] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6F6D82] shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-[#6F6D82] leading-relaxed border-t border-[#E7E5EF]/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#17162E] text-white border-t border-[#22213F] py-12 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#7667F7] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-white">CareerPilot AI</span>
              <p className="text-[11px] text-[#A19FB6]">Empowering candidates to reach their career goals</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#A19FB6]">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">Workflow</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Create Account</Link>
          </div>

          <p className="text-xs text-[#A19FB6]">
            © {new Date().getFullYear()} CareerPilot AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
