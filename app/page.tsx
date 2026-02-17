"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  LayoutDashboard,
  Mic,
  ClipboardList,
  AlertTriangle,
  Calendar,
  Bell,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PatientContextPanel } from "@/components/patient-context-panel";
import { VoiceAgentPanel } from "@/components/voice-agent-panel";
import { Patient, ClinicalNote, MedMode } from "@/lib/types";

const modeTabs: { id: MedMode; label: string; icon: React.ReactNode }[] = [
  { id: "dictate", label: "Dictate", icon: <Mic className="w-4 h-4" /> },
  { id: "summarize", label: "Summarize", icon: <ClipboardList className="w-4 h-4" /> },
  { id: "pattern", label: "Pattern Alert", icon: <AlertTriangle className="w-4 h-4" /> },
  { id: "booking", label: "Voice Booking", icon: <Calendar className="w-4 h-4" /> },
  { id: "followup", label: "Follow-up", icon: <Bell className="w-4 h-4" /> },
];

export default function Home() {
  const [activeMode, setActiveMode] = useState<MedMode>("dictate");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [recentNotes, setRecentNotes] = useState<ClinicalNote[]>([]);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  useEffect(() => {
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data));
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetch(`/api/patients/${selectedPatient.id}`)
        .then((res) => res.json())
        .then((data) => setRecentNotes(data.notes || []));
    } else {
      setRecentNotes([]);
    }
  }, [selectedPatient]);

  return (
    <div className="min-h-screen bg-teal-50/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
                <Stethoscope className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-teal-800">Meddo</span>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={mobileInfoOpen} onOpenChange={setMobileInfoOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden gap-1.5">
                    <Info className="w-4 h-4" />
                    Patient
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Patient Context</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <PatientContextPanel
                      patients={patients}
                      selectedPatient={selectedPatient}
                      onSelectPatient={setSelectedPatient}
                      recentNotes={recentNotes}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as MedMode)}>
            <TabsList className="h-auto gap-1 bg-transparent py-2 flex-wrap">
              {modeTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 text-xs data-[state=active]:bg-teal-700 data-[state=active]:text-white"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex gap-5">
          {/* Left Panel — Patient Context (desktop) */}
          <aside className="hidden md:block md:w-[35%] lg:w-[32%]">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-6">
              <PatientContextPanel
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={setSelectedPatient}
                recentNotes={recentNotes}
              />
            </div>
          </aside>

          {/* Right Panel — Voice Agent + Output */}
          <div className="flex-1 md:w-[65%] lg:w-[68%]">
            <VoiceAgentPanel activeMode={activeMode} selectedPatient={selectedPatient} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Powered by <span className="font-medium text-slate-500">ElevenLabs</span> Conversational AI
            </span>
            <span>Built by Umesh &middot; FDE Portfolio Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
