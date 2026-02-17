"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  AlertTriangle,
  AlertCircle,
  Info,
  CalendarCheck,
  Bell,
  Send,
  CheckCircle2,
  Pencil,
  Save,
} from "lucide-react";
import { SOAPNote, PatternAlert, FollowUpItem } from "@/lib/types";

// ── SOAP Note Card (Dictate mode) ──
export interface SOAPNoteDisplayData {
  note_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export function SOAPNoteCard({ data }: { data: SOAPNoteDisplayData }) {
  const [editing, setEditing] = useState(false);
  const [soap, setSoap] = useState(data);

  const sections: { key: keyof SOAPNote; label: string; prefix: string }[] = [
    { key: "subjective", label: "SUBJECTIVE", prefix: "S" },
    { key: "objective", label: "OBJECTIVE", prefix: "O" },
    { key: "assessment", label: "ASSESSMENT", prefix: "A" },
    { key: "plan", label: "PLAN", prefix: "P" },
  ];

  return (
    <Card className="animate-slide-up border-teal-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-sm font-medium">
              Clinical Note — {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">{data.note_id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map(({ key, label, prefix }) => (
          <div key={key}>
            <label className="text-xs font-bold text-teal-700 mb-1 block">
              {prefix} — {label}
            </label>
            {editing ? (
              <Textarea
                value={soap[key]}
                onChange={(e) => setSoap({ ...soap, [key]: e.target.value })}
                className="text-sm min-h-[60px]"
              />
            ) : (
              <div className="text-sm text-slate-700 bg-slate-50 rounded-md p-2.5 border border-slate-100">
                {soap[key] || <span className="text-slate-400 italic">Not documented</span>}
              </div>
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <Save className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            {editing ? "Done Editing" : "Edit"}
          </Button>
          <Button size="sm" className="gap-1.5 bg-teal-700 hover:bg-teal-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve & Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Patient Summary Card (Summarize mode) ──
export interface PatientSummaryData {
  patient_name: string;
  summary_text: string;
  key_concerns: string[];
  last_visit_date: string | null;
}

export function PatientSummaryCard({ data }: { data: PatientSummaryData }) {
  return (
    <Card className="animate-slide-up border-cyan-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-cyan-600" />
          <CardTitle className="text-sm font-medium">
            Summary — {data.patient_name}
          </CardTitle>
          {data.last_visit_date && (
            <Badge variant="outline" className="text-xs ml-auto">
              Last visit: {data.last_visit_date}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-slate-700 bg-slate-50 rounded-md p-3 whitespace-pre-line border border-slate-100">
          {data.summary_text}
        </div>
        {data.key_concerns.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-amber-700 mb-1.5">Key Concerns</h4>
            <div className="space-y-1.5">
              {data.key_concerns.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm bg-amber-50 rounded-md p-2 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Alert Cards (Pattern mode) ──
export interface PatternAlertDisplayData {
  alerts: PatternAlert[];
}

const severityConfig = {
  critical: { icon: AlertCircle, color: "border-l-red-500 bg-red-50", text: "text-red-700", badge: "bg-red-100 text-red-800" },
  warning: { icon: AlertTriangle, color: "border-l-amber-500 bg-amber-50", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
  info: { icon: Info, color: "border-l-green-500 bg-green-50", text: "text-green-700", badge: "bg-green-100 text-green-800" },
};

export function PatternAlertCards({ data }: { data: PatternAlertDisplayData }) {
  return (
    <div className="space-y-2.5 animate-slide-up">
      {data.alerts.map((alert) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;
        return (
          <Card key={alert.id} className={`border-l-4 ${config.color}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2.5">
                <Icon className={`w-5 h-5 ${config.text} mt-0.5 shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge className={`text-[10px] ${config.badge}`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{alert.description}</p>
                  <p className="text-xs text-teal-700 mt-1.5 font-medium">
                    Recommendation: {alert.recommendation}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{alert.patient_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Appointment Confirmation (Booking mode) ──
export interface AppointmentConfirmData {
  patient_name: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  appointment_id: string;
}

export function AppointmentConfirmCard({ data }: { data: AppointmentConfirmData }) {
  return (
    <Card className="animate-slide-up border-teal-200 bg-teal-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-teal-600" />
          <CardTitle className="text-sm font-medium text-teal-800">
            Appointment Scheduled
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient</span>
            <span className="font-medium">{data.patient_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-medium">{data.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Time</span>
            <span>{data.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type</span>
            <Badge variant="outline" className="capitalize text-xs">{data.type.replace("_", " ")}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Reason</span>
            <span className="text-right max-w-[55%]">{data.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ID</span>
            <Badge variant="outline" className="text-xs">{data.appointment_id}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Follow-up Queue (Follow-up mode) ──
export interface FollowUpQueueData {
  followups: FollowUpItem[];
}

const urgencyColors = {
  high: "border-l-red-400 bg-red-50",
  medium: "border-l-amber-400 bg-amber-50",
  low: "border-l-green-400 bg-green-50",
};

const statusBadge = {
  overdue: "bg-red-100 text-red-800",
  upcoming: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

export function FollowUpQueueCards({
  data,
  onSendReminder,
}: {
  data: FollowUpQueueData;
  onSendReminder?: (patientId: string) => void;
}) {
  return (
    <div className="space-y-2.5 animate-slide-up">
      {data.followups.map((fu, i) => (
        <Card key={i} className={`border-l-4 ${urgencyColors[fu.urgency]}`}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{fu.patient_name}</span>
                  <Badge className={`text-[10px] ${statusBadge[fu.status]}`}>
                    {fu.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{fu.reason}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Due: {fu.due_date} &middot; Last visit: {fu.last_visit}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-7"
                  onClick={() => onSendReminder?.(fu.patient_id)}
                >
                  <Send className="w-3 h-3" />
                  Remind
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
