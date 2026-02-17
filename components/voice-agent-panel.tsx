"use client";

import { useState, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { AgentOrb } from "./agent-orb";
import { TranscriptPanel, TranscriptMessage } from "./transcript-panel";
import {
  SOAPNoteCard,
  SOAPNoteDisplayData,
  PatientSummaryCard,
  PatientSummaryData,
  PatternAlertCards,
  PatternAlertDisplayData,
  AppointmentConfirmCard,
  AppointmentConfirmData,
  FollowUpQueueCards,
  FollowUpQueueData,
} from "./mode-cards";
import { MedMode, Patient, PatternAlert, FollowUpItem } from "@/lib/types";

interface VoiceAgentPanelProps {
  activeMode: MedMode;
  selectedPatient: Patient | null;
}

export function VoiceAgentPanel({ activeMode, selectedPatient }: VoiceAgentPanelProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [soapNote, setSoapNote] = useState<SOAPNoteDisplayData | null>(null);
  const [patientSummary, setPatientSummary] = useState<PatientSummaryData | null>(null);
  const [patternAlerts, setPatternAlerts] = useState<PatternAlertDisplayData | null>(null);
  const [appointmentConfirm, setAppointmentConfirm] = useState<AppointmentConfirmData | null>(null);
  const [followUpQueue, setFollowUpQueue] = useState<FollowUpQueueData | null>(null);

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  const conversation = useConversation({
    onConnect: () => {
      setMessages([]);
      resetModeCards();
    },
    onMessage: (message: { source: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          role: message.source === "ai" ? "agent" : "user",
          message: message.message,
        },
      ]);
    },
    onError: (error: unknown) => {
      console.error("Conversation error:", error);
    },
    clientTools: {
      display_soap_note: (params: Record<string, unknown>) => {
        setSoapNote({
          note_id: String(params.note_id || `note_${Date.now()}`),
          subjective: String(params.subjective || ""),
          objective: String(params.objective || ""),
          assessment: String(params.assessment || ""),
          plan: String(params.plan || ""),
        });
        return "SOAP note displayed";
      },
      update_soap_section: (params: Record<string, unknown>) => {
        setSoapNote((prev) => {
          if (!prev) return prev;
          const section = String(params.section || "").toLowerCase();
          const content = String(params.content || "");
          const key = section === "s" ? "subjective" : section === "o" ? "objective" : section === "a" ? "assessment" : "plan";
          return { ...prev, [key]: content };
        });
        return "SOAP section updated";
      },
      display_patient_summary: (params: Record<string, unknown>) => {
        setPatientSummary({
          patient_name: String(params.patient_name || ""),
          summary_text: String(params.summary_text || ""),
          key_concerns: Array.isArray(params.key_concerns) ? params.key_concerns.map(String) : [],
          last_visit_date: params.last_visit_date ? String(params.last_visit_date) : null,
        });
        return "Patient summary displayed";
      },
      display_pattern_alerts: (params: Record<string, unknown>) => {
        const alertsRaw = Array.isArray(params.alerts) ? params.alerts : [];
        const alerts: PatternAlert[] = alertsRaw.map((a: Record<string, unknown>, i: number) => ({
          id: String(a.id || `alert_${i}`),
          patient_id: String(a.patient_id || ""),
          patient_name: String(a.patient_name || ""),
          severity: (String(a.severity || "info") as PatternAlert["severity"]),
          title: String(a.title || ""),
          description: String(a.description || ""),
          recommendation: String(a.recommendation || ""),
          created_at: new Date().toISOString(),
        }));
        setPatternAlerts({ alerts });
        return "Pattern alerts displayed";
      },
      display_appointment_confirmation: (params: Record<string, unknown>) => {
        setAppointmentConfirm({
          patient_name: String(params.patient_name || ""),
          date: String(params.date || ""),
          time: String(params.time || ""),
          type: String(params.type || "follow_up"),
          reason: String(params.reason || ""),
          appointment_id: String(params.appointment_id || ""),
        });
        return "Appointment confirmation displayed";
      },
      display_followup_queue: (params: Record<string, unknown>) => {
        const fus = Array.isArray(params.followups) ? params.followups : [];
        const followups: FollowUpItem[] = fus.map((f: Record<string, unknown>) => ({
          patient_id: String(f.patient_id || ""),
          patient_name: String(f.patient_name || ""),
          reason: String(f.reason || ""),
          due_date: String(f.due_date || ""),
          status: String(f.status || "upcoming") as FollowUpItem["status"],
          urgency: String(f.urgency || "medium") as FollowUpItem["urgency"],
          last_visit: String(f.last_visit || ""),
        }));
        setFollowUpQueue({ followups });
        return "Follow-up queue displayed";
      },
    },
  });

  function resetModeCards() {
    setSoapNote(null);
    setPatientSummary(null);
    setPatternAlerts(null);
    setAppointmentConfirm(null);
    setFollowUpQueue(null);
  }

  const handleStart = useCallback(async () => {
    if (!agentId || agentId === "your_agent_id_here") {
      alert("Please configure your ElevenLabs Agent ID in .env.local");
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId, connectionType: "webrtc" });

      // Send patient context if selected
      if (selectedPatient) {
        const ctx = `Current patient: ${selectedPatient.name}, ${selectedPatient.age}yo ${selectedPatient.gender}. Conditions: ${selectedPatient.chronic_conditions.join(", ") || "None"}. Medications: ${selectedPatient.current_medications.map((m) => `${m.name} ${m.dosage}`).join(", ") || "None"}. Allergies: ${selectedPatient.allergies.join(", ") || "None"}.`;
        conversation.sendContextualUpdate(ctx);
      }
    } catch (error) {
      console.error("Failed to start:", error);
    }
  }, [agentId, conversation, selectedPatient]);

  const handleStop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleSendReminder = useCallback(async (patientId: string) => {
    try {
      await fetch("/api/send-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, message_type: "appointment_reminder" }),
      });
    } catch {
      // ignore
    }
  }, []);

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const notConfigured = !agentId || agentId === "your_agent_id_here";

  const statusText = (() => {
    if (notConfigured) return "Configure Agent ID to begin";
    if (conversation.status === "disconnected") return "Ready, Doctor";
    if (isConnecting) return "Connecting...";
    if (isConnected && conversation.isSpeaking) return "Speaking...";
    if (isConnected) return "Listening...";
    return "Disconnecting...";
  })();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Agent Orb */}
      <div className="flex flex-col items-center gap-2 py-2">
        <AgentOrb status={conversation.status} isSpeaking={conversation.isSpeaking} />
        <p className="text-sm font-medium text-slate-500">{statusText}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isConnected ? (
          <Button
            size="lg"
            onClick={handleStart}
            disabled={isConnecting || notConfigured}
            className="bg-teal-700 hover:bg-teal-800 text-white gap-2 px-8"
          >
            <Phone className="w-4 h-4" />
            {isConnecting ? "Connecting..." : "Start"}
          </Button>
        ) : (
          <>
            <Button size="lg" variant="destructive" onClick={handleStop} className="gap-2 px-8">
              <PhoneOff className="w-4 h-4" />
              Stop
            </Button>
            <Button size="icon" variant="outline" className="h-10 w-10">
              {conversation.micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </>
        )}
      </div>

      {/* Mode-Specific Output */}
      <div className="w-full space-y-3">
        {activeMode === "dictate" && soapNote && <SOAPNoteCard data={soapNote} />}
        {activeMode === "summarize" && patientSummary && <PatientSummaryCard data={patientSummary} />}
        {activeMode === "pattern" && patternAlerts && <PatternAlertCards data={patternAlerts} />}
        {activeMode === "booking" && appointmentConfirm && <AppointmentConfirmCard data={appointmentConfirm} />}
        {activeMode === "followup" && followUpQueue && (
          <FollowUpQueueCards data={followUpQueue} onSendReminder={handleSendReminder} />
        )}
      </div>

      {/* Transcript */}
      <div className="w-full">
        <TranscriptPanel messages={messages} isListening={isConnected && !conversation.isSpeaking} />
      </div>
    </div>
  );
}
