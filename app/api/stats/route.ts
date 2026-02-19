import { NextResponse } from "next/server";
import { getPatients, getAppointments } from "@/lib/store";

export async function GET() {
  const patients = getPatients();
  const appointments = getAppointments();
  const today = new Date().toISOString().split("T")[0];

  const todayCount = appointments.filter((a) => a.date === today).length;

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const mondayStr = monday.toISOString().split("T")[0];
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayStr = sunday.toISOString().split("T")[0];

  const weekCount = appointments.filter(
    (a) => a.date >= mondayStr && a.date <= sundayStr
  ).length;

  return NextResponse.json({
    todayCount,
    weekCount,
    patientCount: patients.length,
  });
}
