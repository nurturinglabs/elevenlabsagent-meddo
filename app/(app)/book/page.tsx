"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Calendar,
  Clock,
  User,
  Globe,
  FileText,
  Search,
} from "lucide-react";
import { AgentOrb } from "@/components/agent-orb";
import type { Patient } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Message {
  role: "agent" | "user";
  message: string;
}

interface BookingDetails {
  patient_name: string;
  reason: string;
  date: string;
  time: string;
  language: string;
  type: string;
}

export default function BookAppointmentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    patient_name: "",
    reason: "",
    date: "",
    time: "",
    language: "",
    type: "",
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  useEffect(() => {
    fetch("/api/patients")
      .then((res) => res.json())
      .then(setPatients)
      .catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const conversation = useConversation({
    onConnect: () => {
      setMessages([]);
      setBookingDetails({ patient_name: "", reason: "", date: "", time: "", language: "", type: "" });
      setBookingConfirmed(false);
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
      display_appointment_confirmation: (params: Record<string, unknown>) => {
        setBookingDetails({
          patient_name: String(params.patient_name || ""),
          reason: String(params.reason || ""),
          date: String(params.date || ""),
          time: String(params.time || ""),
          language: String(params.language || ""),
          type: String(params.type || "follow_up"),
        });
        setBookingConfirmed(true);
        return "Appointment confirmation displayed";
      },
      update_booking_details: (params: Record<string, unknown>) => {
        setBookingDetails((prev) => ({
          ...prev,
          patient_name: String(params.patient_name || prev.patient_name),
          reason: String(params.reason || prev.reason),
          date: String(params.date || prev.date),
          time: String(params.time || prev.time),
          language: String(params.language || prev.language),
          type: String(params.type || prev.type),
        }));
        return "Booking details updated on screen";
      },
    },
  });

  const handleStart = useCallback(async () => {
    if (!agentId || agentId === "your_agent_id_here") return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId, connectionType: "webrtc" });
      if (selectedPatient) {
        conversation.sendContextualUpdate(
          `Current patient: ${selectedPatient.name}, ${selectedPatient.age}yo ${selectedPatient.gender}. Language: ${selectedPatient.language}. Conditions: ${selectedPatient.chronic_conditions.join(", ") || "None"}.`
        );
      }
    } catch (error) {
      console.error("Failed to start:", error);
    }
  }, [agentId, conversation, selectedPatient]);

  const handleStop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const notConfigured = !agentId || agentId === "your_agent_id_here";

  const filteredPatients = patientSearch
    ? patients.filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
    : patients;

  const hasBookingDetails = bookingDetails.patient_name || bookingDetails.reason || bookingDetails.date;

  return (
    <div className="p-6 h-[calc(100vh)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
        <p className="text-sm text-slate-500">Voice-powered appointment scheduling</p>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left: Voice Agent + Transcript */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          {/* Agent Orb + Controls */}
          <div className="flex items-center gap-4 mb-4">
            <AgentOrb status={conversation.status} isSpeaking={conversation.isSpeaking} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">
                {notConfigured && "Configure Agent ID to begin"}
                {conversation.status === "disconnected" && !notConfigured && "Ready to schedule"}
                {isConnecting && "Connecting..."}
                {isConnected && conversation.isSpeaking && "Speaking..."}
                {isConnected && !conversation.isSpeaking && "Listening..."}
                {conversation.status === "disconnecting" && "Ending session..."}
              </p>
              <div className="flex gap-2 mt-2">
                {!isConnected ? (
                  <Button
                    size="sm"
                    onClick={handleStart}
                    disabled={isConnecting || notConfigured}
                    className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 rounded-full px-5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Start
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleStop}
                    className="gap-1.5 rounded-full px-5"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    End
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Chat Transcript */}
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-slate-400 py-20">
                  Start a conversation to begin scheduling
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-teal-600 text-white rounded-br-md"
                            : "bg-slate-100 text-slate-800 rounded-bl-md"
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  {isConnected && !conversation.isSpeaking && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-slate-400">
                        Listening<span className="animate-pulse">...</span>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </ScrollArea>

            {/* Mic indicator bar at bottom */}
            {isConnected && (
              <div className="border-t px-4 py-3 flex items-center justify-center gap-2 bg-slate-50">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  conversation.isSpeaking ? "bg-teal-100" : "bg-red-100 animate-pulse"
                )}>
                  {conversation.isSpeaking ? (
                    <Mic className="w-4 h-4 text-teal-600" />
                  ) : (
                    <Mic className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {conversation.isSpeaking ? "Agent speaking" : "Your turn to speak"}
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Booking Details + Patient Select */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Patient Select */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Patient
            </h3>
            {selectedPatient ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{selectedPatient.name}</p>
                  <p className="text-xs text-slate-500">{selectedPatient.age}/{selectedPatient.gender.charAt(0)} &middot; {selectedPatient.language}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedPatient(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    placeholder="Search patient..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPatient(p); setPatientSearch(""); }}
                        className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-teal-50 transition-colors"
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-slate-400 ml-2">{p.language}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </Card>

          {/* Booking Details */}
          <Card className={cn("p-4 flex-1", bookingConfirmed ? "border-green-300 bg-green-50" : "")}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {bookingConfirmed ? "Booking Confirmed" : "Booking Details"}
            </h3>
            <div className="space-y-3">
              <DetailRow icon={<User className="w-4 h-4" />} label="Name" value={bookingDetails.patient_name} />
              <DetailRow icon={<FileText className="w-4 h-4" />} label="Reason" value={bookingDetails.reason} />
              <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date" value={bookingDetails.date} />
              <DetailRow icon={<Clock className="w-4 h-4" />} label="Time" value={bookingDetails.time} />
              <DetailRow icon={<Globe className="w-4 h-4" />} label="Language" value={bookingDetails.language} />
            </div>
            {!hasBookingDetails && !bookingConfirmed && (
              <p className="text-xs text-slate-400 italic mt-4">
                Details will appear here as you speak with the assistant
              </p>
            )}
            {bookingConfirmed && (
              <Badge className="mt-4 bg-green-600 text-white">Appointment Scheduled</Badge>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn("text-sm", value ? "font-medium text-slate-900" : "text-slate-300 italic")}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
