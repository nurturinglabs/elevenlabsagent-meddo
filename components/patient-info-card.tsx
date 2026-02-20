"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Droplet,
  Globe,
  Heart,
  AlertTriangle,
  Pill,
} from "lucide-react";
import { Patient } from "@/lib/types";

interface PatientInfoCardProps {
  patient: Patient;
  compact?: boolean;
}

export function PatientInfoCard({ patient, compact = false }: PatientInfoCardProps) {
  if (compact) {
    return (
      <Card className="border-teal-200 dark:border-teal-700">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-700 dark:text-teal-300" />
            </div>
            <div>
              <CardTitle className="text-base dark:text-slate-100">{patient.name}</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {patient.age}/{patient.gender.charAt(0)} · {patient.blood_group} · {patient.language}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Chronic Conditions */}
          {patient.chronic_conditions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Conditions</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {patient.chronic_conditions.map((condition, idx) => (
                  <Badge key={idx} variant="outline" className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700 text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Allergies</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((allergy, idx) => (
                  <Badge key={idx} variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Current Medications */}
          {patient.current_medications.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Pill className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Medications</p>
              </div>
              <div className="space-y-1">
                {patient.current_medications.slice(0, 3).map((med, idx) => (
                  <div key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency}
                  </div>
                ))}
                {patient.current_medications.length > 3 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">+{patient.current_medications.length - 3} more</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full detail view
  return (
    <div className="space-y-4">
      {/* Demographics Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</p>
              <p className="font-medium dark:text-slate-200">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Phone
              </p>
              <p className="font-medium dark:text-slate-200">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Age / Gender</p>
              <p className="font-medium dark:text-slate-200">{patient.age} / {patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5" /> Blood Group
              </p>
              <p className="font-medium dark:text-slate-200">{patient.blood_group}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Language
              </p>
              <p className="font-medium dark:text-slate-200">{patient.language}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Emergency Contact</p>
              <p className="font-medium text-sm dark:text-slate-200">
                {patient.emergency_contact.name} ({patient.emergency_contact.relation})
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{patient.emergency_contact.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chronic Conditions */}
        {patient.chronic_conditions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Chronic Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.chronic_conditions.map((condition, idx) => (
                  <Badge key={idx} variant="outline" className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700">
                    {condition}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Allergies */}
        {patient.allergies.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <Badge key={idx} variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current Medications */}
      {patient.current_medications.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pill className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.current_medications.map((med, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <p className="font-medium text-sm dark:text-slate-200">{med.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <span className="font-medium">Dosage:</span> {med.dosage}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Frequency:</span> {med.frequency}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
