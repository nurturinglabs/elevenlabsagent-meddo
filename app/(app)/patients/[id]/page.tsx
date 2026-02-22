"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  User,
  Calendar,
  FileText,
  Activity,
  Pill,
  AlertCircle,
  Mic,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Patient, ClinicalNote, Appointment, PatternAlert, MedMode } from "@/lib/types";
import { PatientInfoCard } from "@/components/patient-info-card";
import { VisitHistoryTimeline } from "@/components/visit-history-timeline";
import { SendFollowupDialog } from "@/components/send-followup-dialog";
import { VoiceAgentPanel } from "@/components/voice-agent-panel";

interface PatientDetailData extends Patient {
  notes: ClinicalNote[];
  appointments: Appointment[];
  alerts: PatternAlert[];
}

type TabType = "overview" | "visits" | "vitals" | "medications" | "alerts" | "appointments";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patientData, setPatientData] = useState<PatientDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState<MedMode | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      </div>
    );
  }

  if (!patientData || !patientData.name) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Patient Not Found</p>
                <p className="text-sm mt-1">Unable to load patient data</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/patients")}
              variant="outline"
              className="mt-4"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: User },
    { id: "visits" as TabType, label: "Visit History", icon: FileText },
    { id: "vitals" as TabType, label: "Vitals & Labs", icon: Activity },
    { id: "medications" as TabType, label: "Medications", icon: Pill },
    { id: "alerts" as TabType, label: "Alerts", icon: AlertCircle },
    { id: "appointments" as TabType, label: "Appointments", icon: Calendar },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.push("/patients")}
          variant="ghost"
          size="sm"
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Patients
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              {patientData.name}
              <Badge
                variant="outline"
                className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700"
              >
                {patientData.age}y / {patientData.gender.charAt(0)}
              </Badge>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Patient ID: {patientData.id} • {patientData.blood_group} •{" "}
              {patientData.language}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceMode(voiceMode === "dictate" ? null : "dictate")}
              className={voiceMode === "dictate" ? "bg-teal-50 border-teal-600 text-teal-700" : ""}
            >
              <Mic className="w-4 h-4 mr-2" />
              Dictate Note
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceMode(voiceMode === "summarize" ? null : "summarize")}
              className={voiceMode === "summarize" ? "bg-teal-50 border-teal-600 text-teal-700" : ""}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFollowupDialogOpen(true)}
              className="border-teal-600 dark:border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Follow-up
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Panel */}
      {voiceMode && patientData && (
        <Card className="mb-6 border-teal-200">
          <CardContent className="pt-6">
            <VoiceAgentPanel
              activeMode={voiceMode}
              selectedPatient={patientData as Patient}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-teal-600 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <PatientInfoCard patient={patientData as Patient} compact={false} />
        )}

        {activeTab === "visits" && (
          <VisitHistoryTimeline notes={patientData.notes} />
        )}

        {activeTab === "vitals" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Vitals & Lab Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium">Vitals Tracking Coming Soon</p>
                <p className="text-xs mt-1">
                  Charts will display BP, blood sugar, and weight trends
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "medications" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                Medication History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Medications */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Current Medications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {patientData.current_medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/20"
                      >
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{med.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                          <span className="font-medium">Dosage:</span> {med.dosage}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Frequency:</span> {med.frequency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medication Timeline - Future Enhancement */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Pill className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs">
                      Medication change history will be tracked from SOAP notes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            {patientData.alerts && patientData.alerts.length > 0 ? (
              patientData.alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.severity === "critical"
                      ? "border-l-red-500 bg-red-50/30"
                      : alert.severity === "warning"
                      ? "border-l-amber-500 bg-amber-50/30"
                      : "border-l-green-500 bg-green-50/30"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={
                              alert.severity === "critical"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : alert.severity === "warning"
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-green-100 text-green-700 border-green-200"
                            }
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <h3 className="font-semibold text-sm">{alert.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{alert.description}</p>
                        <div className="p-3 rounded-lg bg-white border border-slate-200">
                          <p className="text-xs font-medium text-slate-700 mb-1">
                            Recommendation
                          </p>
                          <p className="text-xs text-slate-600">{alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-green-300 dark:text-green-700" />
                    <p className="text-sm font-medium">No Active Alerts</p>
                    <p className="text-xs mt-1">Patient has no pattern alerts at this time</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientData.appointments && patientData.appointments.length > 0 ? (
                <div className="space-y-3">
                  {patientData.appointments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm dark:text-slate-200">
                                {new Date(apt.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <span className="text-slate-400 dark:text-slate-600">•</span>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{apt.time}</p>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{apt.reason}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              apt.status === "completed"
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                                : apt.status === "scheduled"
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                                : apt.status === "cancelled"
                                ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }
                          >
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium">No Appointments</p>
                  <p className="text-xs mt-1">No appointment history for this patient</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Send Follow-up Dialog */}
      <SendFollowupDialog
        patient={patientData as Patient}
        open={followupDialogOpen}
        onOpenChange={setFollowupDialogOpen}
      />
    </div>
  );
}
