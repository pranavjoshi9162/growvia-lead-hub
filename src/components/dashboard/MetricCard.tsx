import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "soft" | "danger" | "warning";
  className?: string;
  onClick?: () => void;
  active?: boolean;
  compact?: boolean;
}

export function MetricCard({ value, label, sublabel, icon: Icon, variant = "default", className, onClick, active, compact }: MetricCardProps) {
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

  const interactive = onClick
    ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 active:translate-y-0"
    : "";

  const Comp: any = onClick ? "button" : "div";

  return (
    <Comp
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "w-full text-left rounded-xl border transition-all hover:shadow-[var(--shadow-card)]",
        compact ? "p-3" : "p-4",
        styles,
        interactive,
        active && "ring-2 ring-primary border-primary shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={cn("font-bold tracking-tight text-foreground", compact ? "text-xl" : "text-2xl")}>{value}</div>
          <div className={cn("font-medium text-foreground truncate", compact ? "text-xs mt-0.5" : "text-sm mt-1")}>{label}</div>
          {sublabel && <div className={cn("text-muted-foreground", compact ? "text-[11px] mt-0.5" : "text-xs mt-0.5")}>{sublabel}</div>}
        </div>
        {Icon && (
          <div className={cn("rounded-lg grid place-items-center shrink-0", iconBg, compact ? "h-7 w-7" : "h-8 w-8")}>
            <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          </div>
        )}
      </div>
    </Comp>
  );
}
