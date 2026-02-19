"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Calendar, TrendingUp, Mic, Globe } from "lucide-react";
import type { Appointment } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  follow_up: "#3b82f6",
  new_consultation: "#f59e0b",
  procedure: "#ef4444",
  lab_review: "#10b981",
};

const LANGUAGE_COLORS = ["#0d9488", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899"];

export default function AnalyticsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/appointments").then((r) => r.json()),
      fetch("/api/patients").then((r) => r.json()),
    ]).then(([aptData, patients]) => {
      setAppointments(aptData.appointments || []);
      setPatientCount(Array.isArray(patients) ? patients.length : 0);
    });
  }, []);

  // Stats
  const totalAppointments = appointments.length;
  const uniqueDays = new Set(appointments.map((a) => a.date)).size;
  const avgPerDay = uniqueDays > 0 ? (totalAppointments / uniqueDays).toFixed(1) : "0";
  const voiceBooked = appointments.filter((a) => a.created_at).length;
  const uniqueLanguages = new Set(appointments.map((a) => a.language).filter(Boolean)).size;

  // Weekly appointment volume by type
  const weeklyData = useMemo(() => {
    const dayMap: Record<string, Record<string, number>> = {};
    for (const apt of appointments) {
      const day = new Date(apt.date).toLocaleDateString("en-IN", { weekday: "short" });
      if (!dayMap[apt.date]) dayMap[apt.date] = { date: apt.date, day } as unknown as Record<string, number>;
      const entry = dayMap[apt.date];
      entry[apt.type] = ((entry[apt.type] as number) || 0) + 1;
    }
    return Object.values(dayMap)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .map((d) => ({
        day: (d as Record<string, unknown>).day as string,
        "Follow-up": (d.follow_up as number) || 0,
        "New": (d.new_consultation as number) || 0,
        "Procedure": (d.procedure as number) || 0,
        "Lab Review": (d.lab_review as number) || 0,
      }));
  }, [appointments]);

  // By language
  const languageData = useMemo(() => {
    const langMap: Record<string, number> = {};
    for (const apt of appointments) {
      const lang = apt.language || "Unknown";
      langMap[lang] = (langMap[lang] || 0) + 1;
    }
    return Object.entries(langMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [appointments]);

  // By type
  const typeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    for (const apt of appointments) {
      const typeLabel = apt.type === "follow_up" ? "Follow-up"
        : apt.type === "new_consultation" ? "New Consultation"
        : apt.type === "procedure" ? "Procedure"
        : "Lab Review";
      typeMap[typeLabel] = (typeMap[typeLabel] || 0) + 1;
    }
    return Object.entries(typeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [appointments]);

  // By time slot
  const timeSlotData = useMemo(() => {
    const slotMap: Record<string, number> = {};
    for (const apt of appointments) {
      const hour = apt.time.replace(/:30|:00/, "").trim();
      slotMap[hour] = (slotMap[hour] || 0) + 1;
    }
    return Object.entries(slotMap)
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Appointment and patient insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-teal-600" />}
          label="Appointments"
          value={totalAppointments}
          bg="bg-teal-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          label="Avg / Day"
          value={avgPerDay}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Mic className="w-5 h-5 text-purple-600" />}
          label="Voice Booked"
          value={voiceBooked}
          bg="bg-purple-50"
        />
        <StatCard
          icon={<Globe className="w-5 h-5 text-amber-600" />}
          label="Languages"
          value={uniqueLanguages}
          bg="bg-amber-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Appointment Volume */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Appointment Volume</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Follow-up" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="New" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Procedure" stackId="a" fill="#ef4444" />
              <Bar dataKey="Lab Review" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Language */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">By Language</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={languageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {languageData.map((_, i) => (
                  <Cell key={i} fill={LANGUAGE_COLORS[i % LANGUAGE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Type */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">By Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {typeData.map((entry, i) => {
                  const typeKey = entry.name === "Follow-up" ? "follow_up"
                    : entry.name === "New Consultation" ? "new_consultation"
                    : entry.name === "Procedure" ? "procedure" : "lab_review";
                  return <Cell key={i} fill={TYPE_COLORS[typeKey] || "#6b7280"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* By Time Slot */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Appointments by Time Slot</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeSlotData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}
