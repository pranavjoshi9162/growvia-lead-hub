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
}

export function MetricCard({ value, label, sublabel, icon: Icon, variant = "default", className, onClick, active }: MetricCardProps) {
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
        "w-full text-left rounded-xl border p-4 transition-all hover:shadow-[var(--shadow-card)]",
        styles,
        interactive,
        active && "ring-2 ring-primary border-primary shadow-[var(--shadow-card)]",
        className
      )}
    >
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
    </Comp>
  );
}
