import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerPilot AI — AI-Powered Career Acceleration Platform",
  description: "Accelerate your career with AI resume intelligence, job description matching, personalized learning roadmaps, interactive interview practice, and application tracking.",
  keywords: ["career development", "resume analyzer", "AI interview prep", "career roadmap", "job application tracker"],
  authors: [{ name: "CareerPilot AI Team" }],
  openGraph: {
    title: "CareerPilot AI — Navigate Your Career with Precision Intelligence",
    description: "Understand your skills, optimize your resume, master interview practice, build personalized roadmaps, and organize applications in one unified workspace.",
    siteName: "CareerPilot AI",
    locale: "en_US",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8F7F2] text-[#25243A]">
        {children}
      </body>
    </html>
  );
}
