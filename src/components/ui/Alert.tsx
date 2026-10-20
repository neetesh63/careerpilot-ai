import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type = "info", title, children, className = "" }: AlertProps) {
  const config = {
    info: {
      bg: "bg-[#EAE7FF]/60",
      border: "border-[#7667F7]/30",
      text: "text-[#25243A]",
      icon: Info,
      iconColor: "text-[#7667F7]"
    },
    success: {
      bg: "bg-[#16856B]/10",
      border: "border-[#16856B]/30",
      text: "text-[#25243A]",
      icon: CheckCircle2,
      iconColor: "text-[#16856B]"
    },
    warning: {
      bg: "bg-[#A96513]/10",
      border: "border-[#A96513]/30",
      text: "text-[#25243A]",
      icon: AlertTriangle,
      iconColor: "text-[#A96513]"
    },
    error: {
      bg: "bg-[#C43D50]/10",
      border: "border-[#C43D50]/30",
      text: "text-[#C43D50]",
      icon: AlertCircle,
      iconColor: "text-[#C43D50]"
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.bg} ${config.border} flex items-start gap-3 ${className}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-xs leading-relaxed text-[#25243A]">
        {title && <h3 className="font-bold text-sm mb-0.5 text-[#17162E]">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
