import { NextResponse } from "next/server";
import { getFollowUps } from "@/lib/store";

export async function POST() {
  const followups = getFollowUps();

  // Sort: overdue first, then by urgency
  const sorted = followups.sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  return NextResponse.json({
    followups: sorted,
    total: sorted.length,
    overdue: sorted.filter((f) => f.status === "overdue").length,
    upcoming: sorted.filter((f) => f.status === "upcoming").length,
  });
}
