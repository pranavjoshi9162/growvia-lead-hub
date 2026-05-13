import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pastel glass surfaces — Product Metrics layered set + All Leads category tints. */
export const GLASS_SURFACES = {
  layered0: { border: "#93C5FD", bg: "linear-gradient(160deg,#DBEAFE 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#BFDBFE" },
  layered1: { border: "#A5B4FC", bg: "linear-gradient(160deg,#E0E7FF 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#C7D2FE" },
  layered2: { border: "#C4B5FD", bg: "linear-gradient(160deg,#EDE9FE 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#DDD6FE" },
  peach: { border: "#F6D58B", bg: "linear-gradient(160deg,#FFF8E8 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#FFE7B3" },
  amber: { border: "#FCD34D", bg: "linear-gradient(160deg,#FFFBEB 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#FDE68A" },
  apricot: { border: "#FDBA74", bg: "linear-gradient(160deg,#FFEDD5 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#FED7AA" },
  gold: { border: "#FBBF24", bg: "linear-gradient(160deg,#FEF9C3 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#FEF08A" },
  sky: { border: "#BAE6FD", bg: "linear-gradient(160deg,#F0F9FF 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#DDF2FF" },
  cerulean: { border: "#7DD3FC", bg: "linear-gradient(160deg,#E0F2FE 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#BAE6FD" },
  indigo: { border: "#C7D2FE", bg: "linear-gradient(160deg,#EEF2FF 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#DDE5FF" },
  mint: { border: "#BBF7D0", bg: "linear-gradient(160deg,#ECFDF5 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#D1FAE5" },
  rose: { border: "#FDA4AF", bg: "linear-gradient(160deg,#FFE4E6 0%, rgba(255,255,255,0.55) 100%)", iconBg: "#FECDD3" },
} as const;

export type MetricGlassSurface = keyof typeof GLASS_SURFACES;

const LAYERED_INDEX = { 0: "layered0", 1: "layered1", 2: "layered2" } as const;

/** Matched across Product Metrics + Active Client Cycle inner cards for one rhythm. */
const LAYERED_CARD_MIN_H = "min-h-[7rem]";

interface MetricCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "soft" | "danger" | "warning";
  /** Layered glass (Product Metrics) — uses blue / indigo / violet family. */
  layeredGlass?: boolean;
  /** Index 0–2 into layered pastel set. */
  layeredTone?: 0 | 1 | 2;
  /** Pastel glass tint (e.g. All Leads) — same surface system as dashboard cards. */
  glassSurface?: MetricGlassSurface;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  compact?: boolean;
}

export function MetricCard({
  value,
  label,
  sublabel,
  icon: Icon,
  variant = "default",
  layeredGlass,
  layeredTone = 0,
  glassSurface,
  className,
  onClick,
  active,
  compact,
}: MetricCardProps) {
  const layered = Boolean(layeredGlass);
  const tintKey = glassSurface ?? (layered ? LAYERED_INDEX[layeredTone] : null);
  const isGlass = tintKey !== null;
  const tone = tintKey ? GLASS_SURFACES[tintKey] : null;

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
    ? isGlass
      ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] active:translate-y-0"
      : "cursor-pointer hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)] active:translate-y-0"
    : "";

  const Comp: any = onClick ? "button" : "div";

  return (
    <Comp
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "w-full h-full text-left border transition-all",
        isGlass
          ? cn("rounded-2xl backdrop-blur-sm", LAYERED_CARD_MIN_H)
          : "rounded-xl hover:shadow-[var(--shadow-card)]",
        compact ? "p-3" : "p-4",
        !isGlass && styles,
        interactive,
        active && "ring-2 ring-primary border-primary shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]",
        className
      )}
      style={isGlass && tone ? { background: tone.bg, borderColor: tone.border } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isGlass ? (
            <>
              <div className={cn("font-medium text-foreground leading-snug", compact ? "text-xs" : "text-sm")}>{label}</div>
              <div
                className={cn(
                  "font-bold tracking-tight text-foreground tabular-nums",
                  compact ? "text-xl mt-0.5" : "text-2xl mt-1"
                )}
              >
                {value}
              </div>
              {sublabel && (
                <div className={cn("text-[#4B5563] leading-snug", compact ? "text-[11px] mt-0.5" : "text-xs mt-0.5")}>
                  {sublabel}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={cn("font-bold tracking-tight text-foreground", compact ? "text-xl" : "text-2xl")}>{value}</div>
              <div className={cn("font-medium text-foreground truncate", compact ? "text-xs mt-0.5" : "text-sm mt-1")}>{label}</div>
              {sublabel && (
                <div className={cn("text-muted-foreground", compact ? "text-[11px] mt-0.5" : "text-xs mt-0.5")}>{sublabel}</div>
              )}
            </>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "grid place-items-center shrink-0",
              isGlass ? "rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" : "rounded-lg",
              !isGlass && iconBg,
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
            style={isGlass && tone ? { background: tone.iconBg, color: "#374151" } : undefined}
          >
            <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          </div>
        )}
      </div>
    </Comp>
  );
}
