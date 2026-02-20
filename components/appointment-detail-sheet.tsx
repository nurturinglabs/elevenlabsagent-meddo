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
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Appointment, Patient, ClinicalNote, PatternAlert } from "@/lib/types";
import { PatientInfoCard } from "./patient-info-card";
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
      // Reset state when sheet closes
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

        <div className="mt-6 space-y-6">
          {/* Appointment Info Card */}
          <Card className="border-teal-200 dark:border-teal-700">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-slate-100">{appointment.patient_name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Patient ID: {appointment.patient_id}</p>
                  </div>
                  <Badge className={`${typeColor.bg} ${typeColor.text} border-0`}>
                    {TYPE_LABELS[appointment.type] || appointment.type}
                  </Badge>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 my-3" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-4 h-4" />
                      Date
                    </p>
                    <p className="font-medium dark:text-slate-200">{formatDate(appointment.date)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                      <Clock className="w-4 h-4" />
                      Time
                    </p>
                    <p className="font-medium dark:text-slate-200">{appointment.time}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Reason for Visit</p>
                  <p className="font-medium dark:text-slate-200">{appointment.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
            <Card className="border-teal-200 dark:border-teal-700">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setVoicePanelExpanded(!voicePanelExpanded)}
              >
                <div className="flex items-center gap-2">
                  {voiceMode === "dictate" ? (
                    <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  )}
                  <span className="font-medium text-sm dark:text-slate-200">
                    {voiceMode === "dictate" ? "Voice Dictation" : "AI Patient Summary"}
                  </span>
                </div>
                {voicePanelExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
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

          {/* Patient Information */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          )}

          {!loading && patientData && patientData.name && (
            <>
              <PatientInfoCard patient={patientData as Patient} compact />

              {/* Pattern Alerts */}
              {patientData.alerts && patientData.alerts.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100">Pattern Alerts</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          {patientData.alerts.length} alert(s) for this patient
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {patientData.alerts.slice(0, 3).map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm dark:text-slate-100">{alert.title}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.description}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                alert.severity === "critical"
                                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                                  : alert.severity === "warning"
                                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                                  : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {patientData.alerts.length > 3 && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                          +{patientData.alerts.length - 3} more alerts
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Visit Notes */}
              {patientData.notes && patientData.notes.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <h4 className="font-semibold text-sm dark:text-slate-100">Recent Visits</h4>
                    </div>
                    <div className="space-y-3">
                      {patientData.notes.slice(0, 3).map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {new Date(note.date).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="text-[10px]">
                              SOAP
                            </Badge>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            {note.soap.subjective && (
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">S:</span>{" "}
                                <span className="text-slate-600 dark:text-slate-400">
                                  {note.soap.subjective.slice(0, 100)}
                                  {note.soap.subjective.length > 100 && "..."}
                                </span>
                              </div>
                            )}
                            {note.soap.assessment && (
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">A:</span>{" "}
                                <span className="text-slate-600 dark:text-slate-400">
                                  {note.soap.assessment.slice(0, 100)}
                                  {note.soap.assessment.length > 100 && "..."}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {patientData.notes.length > 3 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                          +{patientData.notes.length - 3} more visits
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!loading && !patientData && (
            <Card className="border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-5 h-5" />
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
