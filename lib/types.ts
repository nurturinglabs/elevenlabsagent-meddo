export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  blood_group: string;
  language: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: Medication[];
  emergency_contact: { name: string; relation: string; phone: string };
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  date: string;
  mode: "dictate" | "summarize";
  soap: SOAPNote;
  created_at: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  date: string;
  time: string;
  type: "follow_up" | "new_consultation" | "procedure" | "lab_review";
  reason: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  language: string;
  created_at: string;
}

export interface PatternAlert {
  id: string;
  patient_id: string;
  patient_name: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  recommendation: string;
  created_at: string;
}

export interface FollowUpItem {
  patient_id: string;
  patient_name: string;
  reason: string;
  due_date: string;
  status: "overdue" | "upcoming" | "completed";
  urgency: "high" | "medium" | "low";
  last_visit: string;
}

export type MedMode = "dictate" | "summarize" | "pattern" | "booking" | "followup";
