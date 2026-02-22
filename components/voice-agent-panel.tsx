"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
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
  onNoteSaved?: () => void;
}

export function VoiceAgentPanel({ activeMode, selectedPatient, onNoteSaved }: VoiceAgentPanelProps) {
  // ── Summarize mode: direct API + ElevenLabs TTS ──
  const [summaryData, setSummaryData] = useState<PatientSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const summaryFetched = useRef(false);
  const prevModeRef = useRef<MedMode>(activeMode);

  // Reset summary state when mode changes
  useEffect(() => {
    if (prevModeRef.current !== activeMode) {
      prevModeRef.current = activeMode;
      summaryFetched.current = false;
      setSummaryData(null);
      setSummaryLoading(false);
      setSummaryError(null);
      setTtsStatus("idle");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [activeMode]);

  useEffect(() => {
    if (activeMode === "summarize" && selectedPatient && !summaryFetched.current) {
      summaryFetched.current = true;
      fetchAndReadSummary(selectedPatient.id);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [activeMode, selectedPatient]);

  const fetchAndReadSummary = async (patientId: string) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/summarize-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId }),
      });
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();

      const summary: PatientSummaryData = {
        patient_name: data.patient_name,
        summary_text: data.summary_text,
        key_concerns: data.key_concerns || [],
        last_visit_date: data.last_visit_date || null,
      };
      setSummaryData(summary);
      setSummaryLoading(false);

      // Read the clinical brief via ElevenLabs TTS
      await playTTS(data.summary_text);
    } catch (err) {
      console.error("Summary fetch error:", err);
      setSummaryError("Failed to load patient summary");
      setSummaryLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setTtsStatus("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onplay = () => setTtsStatus("playing");
      audio.onended = () => {
        setTtsStatus("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setTtsStatus("idle");
        URL.revokeObjectURL(url);
      };

      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setTtsStatus("idle");
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTtsStatus("idle");
  };

  const handleReplay = () => {
    if (!summaryData) return;
    playTTS(summaryData.summary_text);
  };

  // ── Other modes: full ElevenLabs conversational AI ──
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

  const handleSaveNote = useCallback(async () => {
    if (!soapNote || !selectedPatient) return;
    try {
      const res = await fetch("/api/save-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          subjective: soapNote.subjective,
          objective: soapNote.objective,
          assessment: soapNote.assessment,
          plan: soapNote.plan,
        }),
      });
      if (res.ok) {
        onNoteSaved?.();
      }
    } catch (err) {
      console.error("Save note error:", err);
    }
  }, [soapNote, selectedPatient, onNoteSaved]);

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

  // ── Summarize mode: instant API fetch + ElevenLabs TTS ──
  if (activeMode === "summarize") {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Loading state */}
        {summaryLoading && (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
            <p className="text-sm font-medium text-slate-500">Loading summary...</p>
          </div>
        )}

        {/* Error state */}
        {summaryError && (
          <p className="text-sm text-red-500 py-2">{summaryError}</p>
        )}

        {/* TTS generating indicator */}
        {ttsStatus === "loading" && !summaryLoading && (
          <div className="flex items-center gap-2 py-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600" />
            <p className="text-xs text-teal-600 font-medium">Generating voice...</p>
          </div>
        )}

        {/* Speaking indicator */}
        {ttsStatus === "playing" && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-teal-500 rounded-full animate-pulse"
                  style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-teal-600 font-medium">Reading summary...</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStopAudio}
              className="text-slate-400 hover:text-slate-600 h-6 w-6 p-0"
            >
              <VolumeX className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Summary card */}
        {summaryData && <PatientSummaryCard data={summaryData} />}

        {/* Replay button after speech ends */}
        {summaryData && ttsStatus === "idle" && !summaryLoading && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReplay}
            className="text-teal-600 hover:text-teal-700 gap-1.5 text-xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Read again
          </Button>
        )}
      </div>
    );
  }

  // ── All other modes: full ElevenLabs conversational AI ──
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
        {activeMode === "dictate" && soapNote && (
          <SOAPNoteCard data={soapNote} onSave={handleSaveNote} />
        )}
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
