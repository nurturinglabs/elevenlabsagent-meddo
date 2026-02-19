"use client";

import { useState, useEffect } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  User,
  Pill,
  AlertTriangle,
  Heart,
  Eye,
  FileText,
  Globe,
  Sparkles,
} from "lucide-react";
import type { ClinicalNote, PatternAlert, Appointment } from "@/lib/types";

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

interface PatientDetail extends EnrichedPatient {
  notes: ClinicalNote[];
  appointments: Appointment[];
  alerts: PatternAlert[];
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
  const [patients, setPatients] = useState<EnrichedPatient[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const handleView = async (patientId: string) => {
    const res = await fetch(`/api/patients/${patientId}`);
    const data = await res.json();
    setSelectedPatient(data);
    setSheetOpen(true);
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => {
                const status = getPatientStatus(p);
                return (
                  <TableRow key={p.id} className="hover:bg-slate-50/50">
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleView(p.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Patient Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[90vw] sm:w-[540px] overflow-y-auto">
          {selectedPatient && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-700" />
                  {selectedPatient.name}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-5 space-y-5">
                {/* Demographics */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Age / Gender</span>
                    <p className="font-medium">{selectedPatient.age} / {selectedPatient.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Blood Group</span>
                    <p className="font-medium">{selectedPatient.blood_group}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Language</span>
                    <p className="font-medium">{selectedPatient.language || "English"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone</span>
                    <p className="font-medium">{selectedPatient.phone}</p>
                  </div>
                </div>

                {/* Conditions */}
                {selectedPatient.chronic_conditions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Heart className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-medium text-slate-600">Conditions</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPatient.chronic_conditions.map((c) => (
                        <Badge key={c} variant="secondary" className="bg-teal-50 text-teal-700">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {selectedPatient.allergies.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600">Allergies</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPatient.allergies.map((a) => (
                        <Badge key={a} className="bg-red-100 text-red-700">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {selectedPatient.current_medications.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-medium text-slate-600">Medications</span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedPatient.current_medications.map((m) => (
                        <div key={m.name} className="text-sm bg-slate-50 rounded px-3 py-2 border">
                          <span className="font-medium">{m.name}</span> {m.dosage}
                          <span className="text-slate-400 ml-1">— {m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {selectedPatient.alerts && selectedPatient.alerts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1.5">Pattern Alerts</h3>
                    <div className="space-y-1.5">
                      {selectedPatient.alerts.map((a) => (
                        <div
                          key={a.id}
                          className={`text-sm rounded p-2.5 border-l-4 ${
                            a.severity === "critical"
                              ? "border-l-red-500 bg-red-50"
                              : a.severity === "warning"
                              ? "border-l-amber-500 bg-amber-50"
                              : "border-l-green-500 bg-green-50"
                          }`}
                        >
                          <span className="font-medium text-xs">{a.title}</span>
                          <p className="text-xs text-slate-500">{a.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visit Notes */}
                {selectedPatient.notes && selectedPatient.notes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">Visit History</span>
                    </div>
                    <div className="space-y-2">
                      {selectedPatient.notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{note.date}</span>
                            <Badge variant="outline" className="text-[10px]">SOAP</Badge>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-bold text-teal-700">S:</span> <span className="text-slate-600 line-clamp-2">{note.soap.subjective}</span></p>
                            <p><span className="font-bold text-teal-700">A:</span> <span className="text-slate-600">{note.soap.assessment}</span></p>
                            <p><span className="font-bold text-teal-700">P:</span> <span className="text-slate-600 line-clamp-2">{note.soap.plan}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
