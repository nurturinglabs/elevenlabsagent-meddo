import initialPatients from "@/data/patients.json";
import initialNotes from "@/data/notes.json";
import initialAppointments from "@/data/appointments.json";
import { Patient, ClinicalNote, Appointment, PatternAlert, FollowUpItem } from "./types";

let patients: Patient[] = [...initialPatients] as Patient[];
let notes: ClinicalNote[] = [...initialNotes] as ClinicalNote[];
let appointments: Appointment[] = [...initialAppointments] as Appointment[];

// ── Patients ──
export function getPatients(): Patient[] {
  return patients;
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

// ── Notes ──
export function getNotes(): ClinicalNote[] {
  return notes;
}

export function getNotesByPatient(patientId: string): ClinicalNote[] {
  return notes.filter((n) => n.patient_id === patientId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function addNote(note: ClinicalNote): ClinicalNote {
  notes.push(note);
  return note;
}

// ── Appointments ──
export function getAppointments(): Appointment[] {
  return appointments;
}

export function getAppointmentsByPatient(patientId: string): Appointment[] {
  return appointments.filter((a) => a.patient_id === patientId);
}

export function addAppointment(apt: Appointment): Appointment {
  appointments.push(apt);
  return apt;
}

// ── Pattern Alerts (mock) ──
export function getPatternAlerts(patientId?: string): PatternAlert[] {
  const allAlerts: PatternAlert[] = [
    {
      id: "alert_001",
      patient_id: "pat_001",
      patient_name: "Ramesh Iyer",
      severity: "critical",
      title: "HbA1c rising: 7.1% → 8.2% in 5 weeks",
      description: "Glycemic control deteriorating. Patient reports irregular medication compliance due to GI side effects.",
      recommendation: "Switch to extended-release Metformin. Consider adding Glimepiride. Reinforce dietary counseling.",
      created_at: "2026-02-17T08:00:00Z",
    },
    {
      id: "alert_002",
      patient_id: "pat_001",
      patient_name: "Ramesh Iyer",
      severity: "warning",
      title: "BP consistently above 140/90",
      description: "Blood pressure elevated across last 2 visits (148/92, 138/88). Current single antihypertensive may be insufficient.",
      recommendation: "Consider adding second antihypertensive or increasing Amlodipine to 10mg.",
      created_at: "2026-02-17T08:00:00Z",
    },
    {
      id: "alert_003",
      patient_id: "pat_001",
      patient_name: "Ramesh Iyer",
      severity: "warning",
      title: "Renal function tests pending",
      description: "Ordered on Feb 10 but no results on file. Needed to assess for diabetic nephropathy.",
      recommendation: "Follow up with patient on lab work completion.",
      created_at: "2026-02-17T08:00:00Z",
    },
    {
      id: "alert_004",
      patient_id: "pat_001",
      patient_name: "Ramesh Iyer",
      severity: "info",
      title: "Aspirin + Metformin combination",
      description: "No significant interaction, but both can cause GI symptoms. Patient already reports GI discomfort.",
      recommendation: "Monitor GI symptoms. Consider taking with food.",
      created_at: "2026-02-17T08:00:00Z",
    },
    {
      id: "alert_005",
      patient_id: "pat_003",
      patient_name: "Mohammed Farooq",
      severity: "critical",
      title: "Asthma peak flow at 67% predicted",
      description: "Moderate exacerbation. Peak flow 320 L/min vs predicted 480 L/min. Using rescue inhaler 4-5x daily.",
      recommendation: "Monitor response to oral steroids. Consider chest X-ray if no improvement in 5 days.",
      created_at: "2026-02-17T08:00:00Z",
    },
    {
      id: "alert_006",
      patient_id: "pat_003",
      patient_name: "Mohammed Farooq",
      severity: "warning",
      title: "Excessive rescue inhaler use",
      description: "Salbutamol usage 4-5 times daily exceeds recommended rescue frequency. Indicates inadequate controller therapy.",
      recommendation: "Step-up therapy needed. Budesonide-Formoterol combination started — monitor response.",
      created_at: "2026-02-17T08:00:00Z",
    },
    {
      id: "alert_007",
      patient_id: "pat_003",
      patient_name: "Mohammed Farooq",
      severity: "warning",
      title: "GERD-Asthma correlation",
      description: "GERD flare coincides with asthma exacerbation. Gastric reflux may be triggering bronchospasm.",
      recommendation: "Aggressive GERD treatment. Elevate head of bed. Avoid eating 3 hours before sleep.",
      created_at: "2026-02-17T08:00:00Z",
    },
    {
      id: "alert_008",
      patient_id: "pat_002",
      patient_name: "Kavitha Suresh",
      severity: "warning",
      title: "TSH rising despite treatment",
      description: "TSH increased from 4.2 to 8.4 mIU/L in 3 months. Dose adjustment needed.",
      recommendation: "Levothyroxine increased to 75mcg. Recheck in 6 weeks. Verify compliance and timing.",
      created_at: "2026-02-17T08:00:00Z",
    },
  ];

  if (patientId && patientId !== "all") {
    return allAlerts.filter((a) => a.patient_id === patientId);
  }
  return allAlerts;
}

// ── Follow-ups (mock) ──
export function getFollowUps(): FollowUpItem[] {
  return [
    {
      patient_id: "pat_001",
      patient_name: "Ramesh Iyer",
      reason: "Diabetes + BP review with lab results",
      due_date: "2026-03-10",
      status: "upcoming",
      urgency: "high",
      last_visit: "2026-02-10",
    },
    {
      patient_id: "pat_003",
      patient_name: "Mohammed Farooq",
      reason: "Asthma exacerbation review — check steroid response",
      due_date: "2026-02-21",
      status: "upcoming",
      urgency: "high",
      last_visit: "2026-02-16",
    },
    {
      patient_id: "pat_002",
      patient_name: "Kavitha Suresh",
      reason: "TSH recheck after Levothyroxine dose increase",
      due_date: "2026-03-28",
      status: "upcoming",
      urgency: "medium",
      last_visit: "2026-02-14",
    },
    {
      patient_id: "pat_004",
      patient_name: "Deepa Krishnan",
      reason: "Osteoarthritis routine check — overdue by 2 weeks",
      due_date: "2026-02-03",
      status: "overdue",
      urgency: "high",
      last_visit: "2025-12-15",
    },
    {
      patient_id: "pat_005",
      patient_name: "Anil Deshmukh",
      reason: "Annual health checkup",
      due_date: "2026-04-15",
      status: "upcoming",
      urgency: "low",
      last_visit: "2025-04-10",
    },
  ];
}
