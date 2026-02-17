"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  ArrowLeft,
  Users,
  FileText,
  AlertCircle,
  Calendar,
  Eye,
  User,
  Pill,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { ClinicalNote, PatternAlert, Appointment } from "@/lib/types";

interface EnrichedPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  blood_group: string;
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

const severityColors = {
  critical: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
  info: "bg-green-100 text-green-800",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function Dashboard() {
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
    ? patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : patients;

  const totalAlerts = patients.reduce(
    (sum, p) => sum + p.alert_counts.critical + p.alert_counts.warning,
    0
  );
  const totalNotes = patients.reduce((sum, p) => sum + p.total_notes, 0);

  const handleView = async (patientId: string) => {
    const res = await fetch(`/api/patients/${patientId}`);
    const data = await res.json();
    setSelectedPatient(data);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-teal-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Agent
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <span className="font-bold text-teal-800">Meddo Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{patients.length}</p>
                  <p className="text-xs text-slate-500">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalNotes}</p>
                  <p className="text-xs text-slate-500">Clinical Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalAlerts}</p>
                  <p className="text-xs text-slate-500">Active Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-slate-500">Pending Follow-ups</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Patient Records</CardTitle>
                <CardDescription>Manage and review patient histories</CardDescription>
              </div>
              <Input
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        {p.age}/{p.gender.charAt(0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
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
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.last_visit ? formatDate(p.last_visit) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {p.alert_counts.critical > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-[10px]">
                              {p.alert_counts.critical} critical
                            </Badge>
                          )}
                          {p.alert_counts.warning > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                              {p.alert_counts.warning} warning
                            </Badge>
                          )}
                          {p.alert_counts.critical === 0 && p.alert_counts.warning === 0 && (
                            <span className="text-xs text-slate-400">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleView(p.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((p) => (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.age}/{p.gender.charAt(0)} &middot; {p.blood_group}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {p.alert_counts.critical > 0 && (
                          <Badge className="bg-red-100 text-red-800 text-[10px]">
                            {p.alert_counts.critical}
                          </Badge>
                        )}
                        {p.alert_counts.warning > 0 && (
                          <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                            {p.alert_counts.warning}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.chronic_conditions.map((c) => (
                        <Badge key={c} variant="secondary" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 gap-1"
                      onClick={() => handleView(p.id)}
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

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
                    <span className="text-slate-500">Age/Gender</span>
                    <p className="font-medium">{selectedPatient.age} / {selectedPatient.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Blood Group</span>
                    <p className="font-medium">{selectedPatient.blood_group}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone</span>
                    <p className="font-medium">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Emergency</span>
                    <p className="font-medium text-xs">
                      {selectedPatient.emergency_contact.name} ({selectedPatient.emergency_contact.relation})
                    </p>
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
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-medium text-xs">{a.title}</span>
                            <Badge className={`text-[10px] ${severityColors[a.severity]}`}>
                              {a.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{a.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visit Timeline */}
                {selectedPatient.notes && selectedPatient.notes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1.5">Visit Timeline</h3>
                    <div className="space-y-3">
                      {selectedPatient.notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{note.date}</span>
                            <Badge variant="outline" className="text-[10px]">SOAP</Badge>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="font-bold text-teal-700">S:</span>{" "}
                              <span className="text-slate-600 line-clamp-2">{note.soap.subjective}</span>
                            </div>
                            <div>
                              <span className="font-bold text-teal-700">A:</span>{" "}
                              <span className="text-slate-600">{note.soap.assessment}</span>
                            </div>
                            <div>
                              <span className="font-bold text-teal-700">P:</span>{" "}
                              <span className="text-slate-600 line-clamp-2">{note.soap.plan}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Appointments */}
                {selectedPatient.appointments && selectedPatient.appointments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-1.5">Appointments</h3>
                    <div className="space-y-1.5">
                      {selectedPatient.appointments.map((apt) => (
                        <div key={apt.id} className="text-sm bg-teal-50 rounded-lg p-2.5 border border-teal-100">
                          <div className="flex justify-between">
                            <span className="font-medium">{apt.date} at {apt.time}</span>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {apt.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{apt.reason}</p>
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
