"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  User,
  Pill,
  AlertTriangle,
  Heart,
  FileText,
  Globe,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import type { ClinicalNote, PatternAlert, Appointment, Patient } from "@/lib/types";
import { SendFollowupDialog } from "@/components/send-followup-dialog";

interface EnrichedPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  blood_group: string;
  language: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: { name: string; dosage: string; frequency: string }[];
  emergency_contact: { name: string; relation: string; phone: string };
  last_visit: string | null;
  total_notes: number;
  alert_counts: { critical: number; warning: number; info: number };
}


function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
];

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

const STATUS_INDICATOR: Record<string, { color: string; label: string }> = {
  active: { color: "bg-green-500", label: "Active" },
  overdue: { color: "bg-red-500", label: "Overdue" },
  stable: { color: "bg-blue-500", label: "Stable" },
};

function getPatientStatus(p: EnrichedPatient): { color: string; label: string } {
  if (p.alert_counts.critical > 0) return STATUS_INDICATOR.overdue;
  if (p.alert_counts.warning > 0) return STATUS_INDICATOR.active;
  return STATUS_INDICATOR.stable;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<EnrichedPatient[]>([]);
  const [search, setSearch] = useState("");
  const [followupPatient, setFollowupPatient] = useState<Patient | null>(null);
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/patients")
      .then((res) => res.json())
      .then(setPatients);
  }, []);

  const filtered = search
    ? patients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.language?.toLowerCase().includes(search.toLowerCase()) ||
        p.chronic_conditions.some((c) => c.toLowerCase().includes(search.toLowerCase()))
      )
    : patients;

  const handleFollowup = async (patientId: string) => {
    const res = await fetch(`/api/patients/${patientId}`);
    const data = await res.json();
    setFollowupPatient(data as Patient);
    setFollowupDialogOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500">{patients.length} registered patients</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, language, condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Patient Table */}
      <Card>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[220px]">Patient</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-center">Visits</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">AI Summary</TableHead>
                <TableHead className="text-center">Quick Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => {
                const status = getPatientStatus(p);
                return (
                  <TableRow
                    key={p.id}
                    className="hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => router.push(`/patients/${p.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(i)}`}>
                          {getInitials(p.name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {p.age} / {p.gender.charAt(0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {p.chronic_conditions.slice(0, 2).map((c) => (
                          <Badge key={c} variant="secondary" className="text-[10px]">
                            {c}
                          </Badge>
                        ))}
                        {p.chronic_conditions.length > 2 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{p.chronic_conditions.length - 2}
                          </Badge>
                        )}
                        {p.chronic_conditions.length === 0 && (
                          <span className="text-xs text-slate-400">Healthy</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {p.language || "English"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-slate-600">
                      {p.total_notes}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {p.last_visit ? formatDate(p.last_visit) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        <span className="text-xs text-slate-600">{status.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {p.total_notes > 0 ? (
                        <Badge variant="outline" className="gap-1 text-xs cursor-pointer hover:bg-teal-50">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          {p.total_notes}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowup(p.id);
                        }}
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        <span className="text-xs">Follow-up</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>


      {/* Send Follow-up Dialog */}
      <SendFollowupDialog
        patient={followupPatient}
        open={followupDialogOpen}
        onOpenChange={setFollowupDialogOpen}
      />
    </div>
  );
}
