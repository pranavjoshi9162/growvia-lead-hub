import { useState } from "react";
import {
  Users, CreditCard, Hourglass, UserCheck, Flame, AlertTriangle, CalendarX,
  Megaphone, TrendingUp, TrendingDown, PhoneCall, Monitor, CheckCircle2, XCircle,
  Briefcase, ArrowUpRight, Target, IndianRupee, ListChecks, CalendarClock, AlarmClock, CheckCheck
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DateFilter, DateRange } from "@/components/dashboard/DateFilter";
import { SalesFunnel } from "@/components/dashboard/SalesFunnel";
import { TrialPipeline } from "@/components/dashboard/TrialPipeline";
import { UpcomingFollowUps } from "@/components/dashboard/UpcomingFollowUps";
import { ClientActivityMonitor } from "@/components/dashboard/ClientActivityMonitor";
import { ConversionCycleChart } from "@/components/dashboard/ConversionCycleChart";

export default function LeadSummary() {
  const [range, setRange] = useState<DateRange>("month");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Sales & Lead Summary Dashboard</div>
          <h1 className="text-3xl font-bold mt-1">Lead Summary</h1>
        </div>
        <DateFilter value={range} onChange={setRange} />
      </div>

      {/* CLIENTS */}
      <section>
        <div className="section-label">Clients</div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <MetricCard variant="soft" icon={Users} value={18} label="Total Clients" sublabel="This month" />
          <MetricCard variant="soft" icon={CreditCard} value={11} label="Paid Clients" sublabel="This month" />
          <MetricCard variant="soft" icon={Hourglass} value={7} label="Trial Clients" sublabel="Today" />
          <MetricCard variant="soft" icon={UserCheck} value={16} label="Total Active Accounts" sublabel="This month" />
          <MetricCard variant="warning" icon={Flame} value={3} label="Trial Expiring Clients" sublabel="Next 7 days" />
          <MetricCard variant="danger" icon={AlertTriangle} value={2} label="Payment Overdue" sublabel="Needs action" />
          <MetricCard variant="warning" icon={CalendarX} value={4} label="Plan Expiry Clients" sublabel="This month" />
        </div>
      </section>

      {/* LEADS */}
      <section>
        <div className="section-label">Leads</div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <MetricCard icon={Megaphone} value={124} label="Total Leads" sublabel="This month" />
          <MetricCard icon={TrendingUp} value={48} label="High Potential" sublabel="Hot leads" />
          <MetricCard icon={TrendingDown} value={32} label="Low Potential" sublabel="Nurture later" />
          <MetricCard icon={PhoneCall} value={9} label="Follow-up Leads" sublabel="Awaiting" />
          <MetricCard icon={CalendarClock} value={4} label="Demo Scheduled" sublabel="This week" />
          <MetricCard icon={Monitor} value={7} label="Demo Given" sublabel="This month" />
          <MetricCard icon={CheckCircle2} value={6} label="Converted" sublabel="Closed won" />
          <MetricCard icon={XCircle} value={3} label="Lost" sublabel="Closed lost" />
        </div>
      </section>

      {/* SALES */}
      <section>
        <div className="section-label">Sales</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard variant="soft" icon={Briefcase} value={3} label="Closed Sales" sublabel="This month" />
          <MetricCard variant="soft" icon={ArrowUpRight} value={6} label="Trial to Paid Conversions" sublabel="This month" />
          <MetricCard variant="soft" icon={Target} value="60%" label="Conversion Rate %" sublabel="This month" />
          <MetricCard variant="soft" icon={IndianRupee} value="₹36K" label="Monthly Recurring Revenue" sublabel="This month" />
        </div>
      </section>

      {/* FOLLOW-UPS */}
      <section>
        <div className="section-label">Follow-ups</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard icon={ListChecks} value={6} label="Total Follow-ups" sublabel="Open" />
          <MetricCard icon={CalendarClock} value={3} label="Today's Follow-ups" sublabel="Due today" variant="soft" />
          <MetricCard icon={AlarmClock} value={2} label="Missed Follow-ups" sublabel="Action needed" variant="danger" />
          <MetricCard icon={CheckCheck} value={5} label="Completed Follow-ups Today" sublabel="Today" />
        </div>
      </section>

      {/* Funnel + Trial Pipeline */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">Sales Funnel</h3>
              <p className="text-sm text-muted-foreground">Leads moving toward paid accounts.</p>
            </div>
            <span className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1 rounded-full">April</span>
          </div>
          <SalesFunnel />
        </div>
        <TrialPipeline />
      </section>

      {/* Upcoming Follow-ups */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ClientActivityMonitor />
        </div>
        <UpcomingFollowUps />
      </section>

      {/* Conversion Cycle */}
      <section>
        <ConversionCycleChart />
      </section>
    </div>
  );
}
