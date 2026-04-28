import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "soft" | "danger" | "warning";
  className?: string;
}

export function MetricCard({ value, label, sublabel, icon: Icon, variant = "default", className }: MetricCardProps) {
  const styles = {
    default: "bg-card border-border",
    soft: "border-primary/20 bg-soft-gradient",
    danger: "border-destructive/30 bg-destructive/5",
    warning: "border-warning/30 bg-warning/5",
  }[variant];

  const iconBg = {
    default: "bg-secondary text-muted-foreground",
    soft: "bg-primary/10 text-primary",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
  }[variant];

  return (
    <div className={cn("rounded-xl border p-4 transition-all hover:shadow-[var(--shadow-card)]", styles, className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          <div className="text-sm font-medium text-foreground mt-1 truncate">{label}</div>
          {sublabel && <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>}
        </div>
        {Icon && (
          <div className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0", iconBg)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
