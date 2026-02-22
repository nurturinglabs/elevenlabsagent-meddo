"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Mic,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { Appointment, Patient, ClinicalNote, PatternAlert } from "@/lib/types";
import { VoiceAgentPanel } from "./voice-agent-panel";
import { MedMode } from "@/lib/types";

interface AppointmentDetailSheetProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PatientDetailData extends Patient {
  notes: ClinicalNote[];
  alerts: PatternAlert[];
}

const TYPE_LABELS: Record<string, string> = {
  follow_up: "Follow-up",
  new_consultation: "New Consultation",
  procedure: "Procedure",
  lab_review: "Lab Review",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  follow_up: { bg: "bg-blue-50", text: "text-blue-700" },
  new_consultation: { bg: "bg-amber-50", text: "amber-700" },
  procedure: { bg: "bg-red-50", text: "text-red-700" },
  lab_review: { bg: "bg-emerald-50", text: "text-emerald-700" },
};

export function AppointmentDetailSheet({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailSheetProps) {
  const [patientData, setPatientData] = useState<PatientDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState<MedMode | null>(null);
  const [voicePanelExpanded, setVoicePanelExpanded] = useState(false);

  useEffect(() => {
    if (appointment && open) {
      fetchPatientData(appointment.patient_id);
    } else {
      setPatientData(null);
      setVoiceMode(null);
      setVoicePanelExpanded(false);
    }
  }, [appointment, open]);

  const fetchPatientData = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDictateClick = () => {
    setVoiceMode("dictate");
    setVoicePanelExpanded(true);
  };

  const handleSummaryClick = () => {
    setVoiceMode("summarize");
    setVoicePanelExpanded(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!appointment) return null;

  const typeColor = TYPE_COLORS[appointment.type] || TYPE_COLORS.follow_up;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Appointment Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Appointment Info Card */}
          <Card className="border-teal-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{appointment.patient_name}</h3>
                    <p className="text-sm text-slate-500">Patient ID: {appointment.patient_id}</p>
                  </div>
                  <Badge className={`${typeColor.bg} ${typeColor.text} border-0`}>
                    {TYPE_LABELS[appointment.type] || appointment.type}
                  </Badge>
                </div>

                <div className="border-t border-slate-200 my-3" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-4 h-4" />
                      Date
                    </p>
                    <p className="font-medium">{formatDate(appointment.date)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 flex items-center gap-1.5 mb-1">
                      <Clock className="w-4 h-4" />
                      Time
                    </p>
                    <p className="font-medium">{appointment.time}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 text-sm mb-1">Reason for Visit</p>
                  <p className="font-medium">{appointment.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compact Patient Context */}
          {!loading && patientData && (
            <div className="flex items-center gap-2 px-1 text-sm text-slate-600 flex-wrap">
              <User className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="font-medium text-slate-800">{patientData.name}</span>
              <span className="text-slate-400">&middot;</span>
              <span>{patientData.age}yo {patientData.gender}</span>
              {patientData.chronic_conditions.length > 0 && (
                <>
                  <span className="text-slate-400">&middot;</span>
                  <span>{patientData.chronic_conditions.join(", ")}</span>
                </>
              )}
              {patientData.allergies.length > 0 && (
                <>
                  <span className="text-slate-400">&middot;</span>
                  <span className="text-red-600">Allergies: {patientData.allergies.join(", ")}</span>
                </>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
            </div>
          )}

          {/* Voice Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDictateClick}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Mic className="w-4 h-4 mr-2" />
              Dictate Notes
            </Button>
            <Button
              onClick={handleSummaryClick}
              disabled={loading}
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Summary
            </Button>
          </div>

          {/* Voice Panel (Expandable) */}
          {voiceMode && voicePanelExpanded && patientData && (
            <Card className="border-teal-200">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setVoicePanelExpanded(!voicePanelExpanded)}
              >
                <div className="flex items-center gap-2">
                  {voiceMode === "dictate" ? (
                    <Mic className="w-4 h-4 text-teal-600" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  )}
                  <span className="font-medium text-sm">
                    {voiceMode === "dictate" ? "Voice Dictation" : "AI Patient Summary"}
                  </span>
                </div>
                {voicePanelExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
              {voicePanelExpanded && (
                <div className="p-4 pt-0">
                  <VoiceAgentPanel
                    activeMode={voiceMode}
                    selectedPatient={patientData as Patient}
                  />
                </div>
              )}
            </Card>
          )}

          {!loading && !patientData && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <p className="text-sm font-medium">Unable to load patient data</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
