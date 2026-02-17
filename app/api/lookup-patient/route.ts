import { NextRequest, NextResponse } from "next/server";
import { getPatients, getNotesByPatient, getPatternAlerts } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name } = body;

  if (!name) {
    // Return all patients if no name provided
    const all = getPatients().map((p) => ({
      patient_id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      conditions: p.chronic_conditions,
    }));
    return NextResponse.json({ patients: all, total: all.length });
  }

  const patients = getPatients();
  const matches = patients.filter((p) =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );

  if (matches.length === 0) {
    // Try fuzzy: match any word
    const words = name.toLowerCase().split(/\s+/);
    const fuzzy = patients.filter((p) =>
      words.some((w) => p.name.toLowerCase().includes(w))
    );

    if (fuzzy.length === 0) {
      return NextResponse.json({
        found: false,
        message: `No patient found matching "${name}". Available patients: ${patients.map((p) => p.name).join(", ")}`,
        available_patients: patients.map((p) => ({
          patient_id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
        })),
      });
    }

    const match = fuzzy[0];
    const notes = getNotesByPatient(match.id);
    const alerts = getPatternAlerts(match.id);

    return NextResponse.json({
      found: true,
      patient_id: match.id,
      name: match.name,
      age: match.age,
      gender: match.gender,
      blood_group: match.blood_group,
      allergies: match.allergies,
      chronic_conditions: match.chronic_conditions,
      current_medications: match.current_medications,
      total_notes: notes.length,
      last_visit: notes[0]?.date || null,
      active_alerts: alerts.length,
    });
  }

  const match = matches[0];
  const notes = getNotesByPatient(match.id);
  const alerts = getPatternAlerts(match.id);

  return NextResponse.json({
    found: true,
    patient_id: match.id,
    name: match.name,
    age: match.age,
    gender: match.gender,
    blood_group: match.blood_group,
    allergies: match.allergies,
    chronic_conditions: match.chronic_conditions,
    current_medications: match.current_medications,
    total_notes: notes.length,
    last_visit: notes[0]?.date || null,
    active_alerts: alerts.length,
  });
}
