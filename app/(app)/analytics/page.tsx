"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  CalendarCheck,
  Stethoscope,
} from "lucide-react";
import type { Appointment } from "@/lib/types";

type Period = "daily" | "weekly" | "monthly";

const TYPE_COLORS: Record<string, string> = {
  follow_up: "#3b82f6",
  new_consultation: "#f59e0b",
  procedure: "#ef4444",
  lab_review: "#10b981",
};

const TYPE_LABELS: Record<string, string> = {
  follow_up: "Follow-up",
  new_consultation: "New",
  procedure: "Procedure",
  lab_review: "Lab Review",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  scheduled: "#3b82f6",
  cancelled: "#ef4444",
  no_show: "#f59e0b",
};

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"];

interface PatientData {
  id: string;
  name: string;
  age: number;
  chronic_conditions?: string[];
}

const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#f1f5f9",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

// Custom tooltip for the volume trend
function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((sum, p) => sum + ((p.value as number) || 0), 0);
  return (
    <div style={TOOLTIP_STYLE} className="p-3">
      <p className="text-xs font-semibold text-slate-200 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-400">{p.name}</span>
          </div>
          <span className="font-semibold text-slate-200">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-slate-700 mt-1.5 pt-1.5 flex justify-between text-[11px]">
        <span className="text-slate-400">Total</span>
        <span className="font-bold text-white">{total}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [period, setPeriod] = useState<Period>("daily");

  useEffect(() => {
    Promise.all([
      fetch("/api/appointments").then((r) => r.json()),
      fetch("/api/patients").then((r) => r.json()),
    ]).then(([aptData, patData]) => {
      setAppointments(aptData.appointments || []);
      setPatients(Array.isArray(patData) ? patData : []);
    });
  }, []);

  const TODAY = "2026-02-20";

  // ── Core metrics ──
  const metrics = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    const noShow = appointments.filter((a) => a.status === "no_show").length;
    const newPatients = appointments.filter((a) => a.type === "new_consultation").length;
    const followUps = appointments.filter((a) => a.type === "follow_up").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    const noShowRate = total > 0 ? Math.round((noShow / total) * 100) : 0;
    const followUpRatio = total > 0 ? Math.round((followUps / total) * 100) : 0;

    const hourMap: Record<string, number> = {};
    for (const apt of appointments) {
      const hour = apt.time.replace(/:30|:00/, "").trim();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    }
    const peakHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const uniqueDays = new Set(appointments.map((a) => a.date)).size;
    const avgPerDay = uniqueDays > 0 ? (total / uniqueDays).toFixed(1) : "0";

    return { total, completed, cancelled, noShow, newPatients, followUps, completionRate, cancellationRate, noShowRate, followUpRatio, peakHour, avgPerDay, totalPatients: patients.length };
  }, [appointments, patients]);

  // ── Volume trend data (stacked by type) ──
  const { trendData, todayLabel } = useMemo(() => {
    // Group appointments by date
    const dateMap: Record<string, Record<string, number>> = {};
    for (const apt of appointments) {
      if (!dateMap[apt.date]) dateMap[apt.date] = { follow_up: 0, new_consultation: 0, procedure: 0, lab_review: 0 };
      dateMap[apt.date][apt.type] = (dateMap[apt.date][apt.type] || 0) + 1;
    }

    const sortedDates = Object.keys(dateMap).sort();
    let todayLbl = "";

    if (period === "daily") {
      const data = sortedDates.map((date) => {
        const d = new Date(date + "T12:00:00");
        const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        if (date === TODAY) todayLbl = label;
        return {
          label,
          date,
          "Follow-up": dateMap[date].follow_up || 0,
          "New": dateMap[date].new_consultation || 0,
          "Procedure": dateMap[date].procedure || 0,
          "Lab Review": dateMap[date].lab_review || 0,
        };
      });
      return { trendData: data, todayLabel: todayLbl };
    }

    if (period === "weekly") {
      const weekMap: Record<string, { follow_up: number; new_consultation: number; procedure: number; lab_review: number; sortKey: string }> = {};
      for (const date of sortedDates) {
        const d = new Date(date + "T12:00:00");
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const key = weekStart.toISOString().split("T")[0];
        const label = `${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;

        if (!weekMap[label]) weekMap[label] = { follow_up: 0, new_consultation: 0, procedure: 0, lab_review: 0, sortKey: key };
        weekMap[label].follow_up += dateMap[date].follow_up || 0;
        weekMap[label].new_consultation += dateMap[date].new_consultation || 0;
        weekMap[label].procedure += dateMap[date].procedure || 0;
        weekMap[label].lab_review += dateMap[date].lab_review || 0;

        if (date === TODAY) todayLbl = label;
      }
      const data = Object.entries(weekMap)
        .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
        .map(([label, v]) => ({
          label,
          "Follow-up": v.follow_up,
          "New": v.new_consultation,
          "Procedure": v.procedure,
          "Lab Review": v.lab_review,
        }));
      return { trendData: data, todayLabel: todayLbl };
    }

    // Monthly
    const monthMap: Record<string, { follow_up: number; new_consultation: number; procedure: number; lab_review: number; sortKey: string }> = {};
    for (const date of sortedDates) {
      const d = new Date(date + "T12:00:00");
      const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      const sortKey = date.slice(0, 7);
      if (!monthMap[label]) monthMap[label] = { follow_up: 0, new_consultation: 0, procedure: 0, lab_review: 0, sortKey };
      monthMap[label].follow_up += dateMap[date].follow_up || 0;
      monthMap[label].new_consultation += dateMap[date].new_consultation || 0;
      monthMap[label].procedure += dateMap[date].procedure || 0;
      monthMap[label].lab_review += dateMap[date].lab_review || 0;
      if (date === TODAY) todayLbl = label;
    }
    const data = Object.entries(monthMap)
      .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
      .map(([label, v]) => ({
        label,
        "Follow-up": v.follow_up,
        "New": v.new_consultation,
        "Procedure": v.procedure,
        "Lab Review": v.lab_review,
      }));
    return { trendData: data, todayLabel: todayLbl };
  }, [appointments, period]);

  // ── Appointment type distribution (pie) ──
  const typeDistribution = useMemo(() => {
    const typeMap: Record<string, number> = {};
    for (const apt of appointments) {
      const label = TYPE_LABELS[apt.type] || apt.type;
      typeMap[label] = (typeMap[label] || 0) + 1;
    }
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  // ── Peak hours data ──
  const peakHoursData = useMemo(() => {
    const hourMap: Record<string, number> = {};
    for (const apt of appointments) {
      const hour = apt.time.replace(/:30|:00/, "").trim();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    }
    return Object.entries(hourMap)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => {
        const parseTime = (t: string) => {
          const match = t.match(/(\d+)\s*(AM|PM)/i);
          if (!match) return 0;
          let h = parseInt(match[1]);
          if (match[2].toUpperCase() === "PM" && h !== 12) h += 12;
          if (match[2].toUpperCase() === "AM" && h === 12) h = 0;
          return h;
        };
        return parseTime(a.time) - parseTime(b.time);
      });
  }, [appointments]);

  // ── Top conditions ──
  const topConditions = useMemo(() => {
    const condMap: Record<string, number> = {};
    for (const p of patients) {
      for (const c of p.chronic_conditions || []) {
        condMap[c] = (condMap[c] || 0) + 1;
      }
    }
    return Object.entries(condMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [patients]);

  // ── Status breakdown ──
  const statusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    for (const apt of appointments) {
      const label = apt.status.charAt(0).toUpperCase() + apt.status.slice(1).replace("_", " ");
      statusMap[label] = (statusMap[label] || 0) + 1;
    }
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  const maxPeakCount = Math.max(...peakHoursData.map((d) => d.count), 1);

  // Unique patients who visited
  const uniquePatientIds = useMemo(() => {
    return new Set(appointments.map((a) => a.patient_id)).size;
  }, [appointments]);

  return (
    <div className="p-3 h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Practice Insights</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Jan 20 – Mar 20, 2026 &middot; {metrics.total} appointments &middot; {uniquePatientIds} active patients
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => setPeriod(p)}
              className={`text-[11px] px-2.5 py-0.5 h-6 capitalize ${
                period === p
                  ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-2 mb-2">
        <KPICard icon={<CalendarCheck className="w-4 h-4" />} label="Total Visits" value={metrics.total} accent="teal" />
        <KPICard icon={<Users className="w-4 h-4" />} label="Active Patients" value={uniquePatientIds} accent="blue" />
        <KPICard icon={<Activity className="w-4 h-4" />} label="Completion" value={`${metrics.completionRate}%`} accent="emerald" trend={metrics.completionRate >= 70 ? "up" : "down"} />
        <KPICard icon={<AlertTriangle className="w-4 h-4" />} label="No-shows" value={`${metrics.noShowRate}%`} accent="amber" trend={metrics.noShowRate <= 15 ? "up" : "down"} />
        <KPICard icon={<Clock className="w-4 h-4" />} label="Peak Hour" value={metrics.peakHour} accent="purple" />
        <KPICard icon={<TrendingUp className="w-4 h-4" />} label="Avg / Day" value={metrics.avgPerDay} accent="rose" />
      </div>

      {/* Row 1: Volume Trend + Pie */}
      <div className="grid grid-cols-12 gap-2 mb-2">
        {/* ── Volume Trend ── */}
        <Card className="col-span-8 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Appointment Volume by Type
            </h3>
            <div className="flex items-center gap-2.5">
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: TYPE_COLORS[key] }} />
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trendData} barSize={period === "monthly" ? 40 : period === "weekly" ? 24 : undefined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:[&>line]:stroke-slate-700" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: period === "daily" ? 9 : 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval={period === "daily" ? 2 : 0}
                angle={period === "weekly" ? -20 : 0}
                textAnchor={period === "weekly" ? "end" : "middle"}
              />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TrendTooltip />} />
              {todayLabel && (
                <ReferenceLine x={todayLabel} stroke="#0d9488" strokeDasharray="4 4" strokeWidth={2} label={{ value: "Today", position: "top", fontSize: 10, fill: "#0d9488", fontWeight: 600 }} />
              )}
              <Bar dataKey="Follow-up" stackId="type" fill={TYPE_COLORS.follow_up} radius={[0, 0, 0, 0]} />
              <Bar dataKey="New" stackId="type" fill={TYPE_COLORS.new_consultation} />
              <Bar dataKey="Procedure" stackId="type" fill={TYPE_COLORS.procedure} />
              <Bar dataKey="Lab Review" stackId="type" fill={TYPE_COLORS.lab_review} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Visit Type Pie ── */}
        <Card className="col-span-4 p-3">
          <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wide">
            Visit Type Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {typeDistribution.map((entry, i) => {
                  const typeKey = Object.entries(TYPE_LABELS).find(([, v]) => v === entry.name)?.[0] || "";
                  return <Cell key={i} fill={TYPE_COLORS[typeKey] || PIE_COLORS[i % PIE_COLORS.length]} />;
                })}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {typeDistribution.map((entry, i) => {
              const typeKey = Object.entries(TYPE_LABELS).find(([, v]) => v === entry.name)?.[0] || "";
              const pct = metrics.total > 0 ? Math.round((entry.value / metrics.total) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[typeKey] || PIE_COLORS[i] }} />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{entry.name}</span>
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 ml-auto">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 2: Peak Hours + Clinical Insights + Status */}
      <div className="grid grid-cols-12 gap-2">
        {/* ── Peak Hours ── */}
        <Card className="col-span-5 p-3">
          <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Busiest Hours
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={peakHoursData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:[&>line]:stroke-slate-700" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Appointments">
                {peakHoursData.map((entry, i) => (
                  <Cell key={i} fill={entry.count === maxPeakCount ? "#0d9488" : "#99f6e4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Clinical Insights ── */}
        <Card className="col-span-4 p-3">
          <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Clinical Insights
          </h3>
          <div className="space-y-2.5">
            <InsightRow label="Follow-up Rate" value={`${metrics.followUpRatio}%`} description="of visits are follow-ups" color="blue" percentage={metrics.followUpRatio} />
            <InsightRow label="Cancellation Rate" value={`${metrics.cancellationRate}%`} description={`${metrics.cancelled} cancelled visits`} color={metrics.cancellationRate > 15 ? "red" : "green"} percentage={metrics.cancellationRate} />
            <InsightRow label="No-show Rate" value={`${metrics.noShowRate}%`} description={`${metrics.noShow} no-show visits`} color={metrics.noShowRate > 10 ? "red" : "green"} percentage={metrics.noShowRate} />
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Top Conditions</p>
              <div className="space-y-1">
                {topConditions.map(([condition, count]) => (
                  <div key={condition} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Stethoscope className="w-3 h-3 text-teal-500 flex-shrink-0" />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate">{condition}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 ml-2">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Status Overview ── */}
        <Card className="col-span-3 p-3">
          <h3 className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
            Status Overview
          </h3>
          <div className="space-y-2">
            {statusData.map((item) => {
              const key = item.name.toLowerCase().replace(" ", "_");
              const color = STATUS_COLORS[key] || "#6b7280";
              const pct = metrics.total > 0 ? Math.round((item.value / metrics.total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {item.value} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Users className="w-3 h-3 text-teal-500" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Appointment Types</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Follow-ups</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{metrics.followUps}</span>
              </div>
              <div className="flex justify-between text-[11px] mt-0.5">
                <span className="text-slate-600 dark:text-slate-400">New consultations</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{metrics.newPatients}</span>
              </div>
              <div className="flex justify-between text-[11px] mt-0.5">
                <span className="text-slate-600 dark:text-slate-400">Completed</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{metrics.completed}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── KPI Card ──
function KPICard({ icon, label, value, accent, trend }: { icon: React.ReactNode; label: string; value: string | number; accent: string; trend?: "up" | "down" }) {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    teal: { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-300", icon: "text-teal-600 dark:text-teal-400" },
    blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", icon: "text-blue-600 dark:text-blue-400" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-300", icon: "text-emerald-600 dark:text-emerald-400" },
    amber: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300", icon: "text-amber-600 dark:text-amber-400" },
    purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", icon: "text-purple-600 dark:text-purple-400" },
    rose: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-300", icon: "text-rose-600 dark:text-rose-400" },
  };
  const c = colors[accent] || colors.teal;

  return (
    <Card className="p-2">
      <div className="flex items-center justify-between mb-0.5">
        <div className={`w-6 h-6 rounded-md ${c.bg} flex items-center justify-center ${c.icon}`}>{icon}</div>
        {trend && (trend === "up" ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />)}
      </div>
      <p className={`text-base font-bold ${c.text} leading-tight`}>{value}</p>
      <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
    </Card>
  );
}

// ── Insight Row ──
function InsightRow({ label, value, description, color, percentage }: { label: string; value: string; description: string; color: string; percentage: number }) {
  const barColor = color === "blue" ? "bg-blue-500" : color === "red" ? "bg-red-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-0.5">
        <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">{description}</p>
    </div>
  );
}
