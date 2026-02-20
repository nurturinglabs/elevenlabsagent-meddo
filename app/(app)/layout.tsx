"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";

interface StatsData {
  todayCount: number;
  weekCount: number;
  patientCount: number;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<StatsData>({ todayCount: 0, weekCount: 0, patientCount: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        todayCount={stats.todayCount}
        weekCount={stats.weekCount}
        patientCount={stats.patientCount}
      />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
