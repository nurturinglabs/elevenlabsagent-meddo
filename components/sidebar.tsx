"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  Mic,
  BarChart3,
  Stethoscope,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Calendar, label: "Calendar" },
  { href: "/patients", icon: Users, label: "Patients" },
  { href: "/book", icon: Mic, label: "Book Appointment" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

interface SidebarProps {
  todayCount: number;
  weekCount: number;
  patientCount: number;
}

export function Sidebar({ todayCount, weekCount, patientCount }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-white">
      {/* Doctor Profile */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">Dr. Suresh</p>
          <p className="text-xs text-slate-400">General Physician</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Stats Footer */}
      <div className="px-5 py-4 border-t border-slate-700/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-white">{todayCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Today</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{weekCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">This Week</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{patientCount}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Patients</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500 text-center">
          Powered by ElevenLabs &bull; Built by Umesh
        </p>
      </div>
    </aside>
  );
}
