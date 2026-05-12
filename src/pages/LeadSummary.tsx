import { Store, CircleDot, Gift } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesFunnelOverview } from "@/components/dashboard/SalesFunnelOverview";
import { ActiveClientCycle } from "@/components/dashboard/ActiveClientCycle";
import { UpcomingFollowUps } from "@/components/dashboard/UpcomingFollowUps";
import { ClientActivityMonitor } from "@/components/dashboard/ClientActivityMonitor";
import { ConversionCycleChart } from "@/components/dashboard/ConversionCycleChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeadSummary() {
  return (
    <div className="space-y-5 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Sales & Lead Overview</div>
          <h1 className="text-2xl font-bold mt-1">Main Dashboard</h1>
        </div>
      </div>

      {/* 1. Sales Funnel Overview (renamed Business Overview) */}
      <SalesFunnelOverview />

      {/* 2. Active Client Cycle */}
      <ActiveClientCycle />

      {/* 3. Product Metrics */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="section-label !mb-0">Product Metrics</div>
          <Select defaultValue="this-month">
            <SelectTrigger className="h-7 w-[140px] bg-background/70 backdrop-blur text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
          <MetricCard variant="soft" icon={Store} value={42} label="Total Outlets" sublabel="Across all clients" />
          <MetricCard variant="soft" icon={CircleDot} value={28} label="Total Wheels" sublabel="Active campaigns" />
          <MetricCard variant="soft" icon={Gift} value="3.2K" label="Total Loyalty Cards" sublabel="Issued" />
        </div>
      </section>

      {/* 4. Activity + Follow-ups + Conversion (balanced grid) */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-full"><ClientActivityMonitor /></div>
        <div className="h-full"><UpcomingFollowUps /></div>
        <div className="xl:col-span-3"><ConversionCycleChart /></div>
      </section>
    </div>
  );
}
