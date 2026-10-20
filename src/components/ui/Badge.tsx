export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "violet"
  | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-[#EAE7FF] text-[#7667F7] border-[#7667F7]/30",
    violet: "bg-[#7667F7]/15 text-[#7667F7] border-[#7667F7]/40",
    success: "bg-[#16856B]/15 text-[#16856B] border-[#16856B]/30",
    warning: "bg-[#A96513]/15 text-[#A96513] border-[#A96513]/30",
    error: "bg-[#C43D50]/15 text-[#C43D50] border-[#C43D50]/30",
    neutral: "bg-[#E7E5EF] text-[#25243A] border-[#E7E5EF]"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    interested: { label: "Interested", variant: "neutral" },
    preparing: { label: "Preparing", variant: "warning" },
    applied: { label: "Applied", variant: "default" },
    assessment: { label: "Assessment", variant: "violet" },
    interview: { label: "Interview Scheduled", variant: "violet" },
    offer: { label: "Offer Received", variant: "success" },
    rejected: { label: "Rejected", variant: "error" },
    withdrawn: { label: "Withdrawn", variant: "neutral" }
  };

  const config = statusConfig[status] || { label: status, variant: "neutral" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
