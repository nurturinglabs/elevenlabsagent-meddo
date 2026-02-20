"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/types";
import { AppointmentDetailSheet } from "@/components/appointment-detail-sheet";

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM",
];

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  follow_up: { bg: "bg-blue-50 dark:bg-blue-900/30", border: "border-l-blue-500", text: "text-blue-700 dark:text-blue-300" },
  new_consultation: { bg: "bg-amber-50 dark:bg-amber-900/30", border: "border-l-amber-500", text: "text-amber-700 dark:text-amber-300" },
  procedure: { bg: "bg-red-50 dark:bg-red-900/30", border: "border-l-red-500", text: "text-red-700 dark:text-red-300" },
  lab_review: { bg: "bg-emerald-50 dark:bg-emerald-900/30", border: "border-l-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
};

const TYPE_LABELS: Record<string, string> = {
  follow_up: "Follow-up",
  new_consultation: "New",
  procedure: "Procedure",
  lab_review: "Lab Review",
};

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + mondayOffset);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}

function formatDayNum(d: Date): string {
  return d.getDate().toString();
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetch("/api/patients")
      .then(() => fetch("/api/book-appointment", { method: "GET" }).catch(() => null));
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch(console.error);
  }, []);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const todayStr = formatDateKey(new Date());

  const appointmentsByDateAndTime = useMemo(() => {
    const map: Record<string, Record<string, Appointment>> = {};
    for (const apt of appointments) {
      if (!map[apt.date]) map[apt.date] = {};
      map[apt.date][apt.time] = apt;
    }
    return map;
  }, [appointments]);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setSheetOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{formatMonthYear(weekDates[0])}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {Object.entries(TYPE_LABELS).map(([key, label]) => {
          const color = TYPE_COLORS[key];
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded-sm ${color.bg} border-l-2 ${color.border}`} />
              <span className="text-slate-600 dark:text-slate-400">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
              <div className="p-3 text-xs text-slate-400 dark:text-slate-500 flex items-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              {weekDates.map((d) => {
                const isToday = formatDateKey(d) === todayStr;
                return (
                  <div
                    key={formatDateKey(d)}
                    className={`p-3 text-center border-l border-slate-200 dark:border-slate-700 ${isToday ? "bg-teal-50 dark:bg-teal-900/30" : ""}`}
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDay(d)}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-teal-600 dark:text-teal-400" : "text-slate-900 dark:text-slate-100"}`}>
                      {formatDayNum(d)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {TIME_SLOTS.map((time) => (
              <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <div className="p-2 text-xs text-slate-400 dark:text-slate-500 text-right pr-3 pt-3">
                  {time}
                </div>
                {weekDates.map((d) => {
                  const dateKey = formatDateKey(d);
                  const apt = appointmentsByDateAndTime[dateKey]?.[time];
                  const isToday = dateKey === todayStr;

                  return (
                    <div
                      key={dateKey}
                      className={`border-l border-slate-200 dark:border-slate-700 min-h-[52px] p-1 ${isToday ? "bg-teal-50/30 dark:bg-teal-900/20" : ""}`}
                    >
                      {apt && (
                        <div
                          onClick={() => handleAppointmentClick(apt)}
                          className={`rounded-md p-1.5 border-l-3 ${TYPE_COLORS[apt.type]?.bg || "bg-gray-50 dark:bg-gray-800"} ${TYPE_COLORS[apt.type]?.border || "border-l-gray-400"} cursor-pointer hover:shadow-sm transition-shadow`}
                        >
                          <p className={`text-xs font-medium ${TYPE_COLORS[apt.type]?.text || "text-gray-700 dark:text-gray-300"} truncate`}>
                            {apt.patient_name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{apt.reason}</p>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5">
                            {TYPE_LABELS[apt.type] || apt.type}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Appointment Detail Sheet */}
      <AppointmentDetailSheet
        appointment={selectedAppointment}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
