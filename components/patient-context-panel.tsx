"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  User,
  Pill,
  AlertTriangle,
  Heart,
  FileText,
} from "lucide-react";
import { Patient, ClinicalNote } from "@/lib/types";

interface PatientContextPanelProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  recentNotes: ClinicalNote[];
}

export function PatientContextPanel({
  patients,
  selectedPatient,
  onSelectPatient,
  recentNotes,
}: PatientContextPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? patients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : patients;

  return (
    <div className="space-y-4">
      {/* Patient Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Patient List (when no patient selected or searching) */}
      {(!selectedPatient || search) && (
        <ScrollArea className="h-48">
          <div className="space-y-1.5">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPatient(p);
                  setSearch("");
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-200"
              >
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {p.age}/{p.gender.charAt(0)} &middot; {p.blood_group}{" "}
                  {p.chronic_conditions.length > 0 &&
                    `· ${p.chronic_conditions[0]}`}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Selected Patient Card */}
      {selectedPatient && !search && (
        <>
          <Card className="border-teal-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{selectedPatient.name}</CardTitle>
                    <p className="text-xs text-slate-500">
                      {selectedPatient.age}/{selectedPatient.gender.charAt(0)} &middot;{" "}
                      {selectedPatient.blood_group}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectPatient(null as unknown as Patient)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Change
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Chronic Conditions */}
              {selectedPatient.chronic_conditions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs font-medium text-slate-500">Conditions</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedPatient.chronic_conditions.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px] bg-teal-50 text-teal-700">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergies */}
              {selectedPatient.allergies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-medium text-red-500">Allergies</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedPatient.allergies.map((a) => (
                      <Badge key={a} className="text-[10px] bg-red-100 text-red-700">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {selectedPatient.current_medications.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs font-medium text-slate-500">Medications</span>
                  </div>
                  <div className="space-y-1">
                    {selectedPatient.current_medications.map((m) => (
                      <div key={m.name} className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">
                        <span className="font-medium">{m.name}</span> {m.dosage} — {m.frequency}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          {recentNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-medium text-slate-500">Recent Notes</span>
              </div>
              <div className="space-y-1.5">
                {recentNotes.slice(0, 3).map((note) => (
                  <div key={note.id} className="text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{note.date}</span>
                      <Badge variant="outline" className="text-[10px]">SOAP</Badge>
                    </div>
                    <p className="text-slate-500 line-clamp-2">{note.soap.assessment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
