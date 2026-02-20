"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, FileText } from "lucide-react";
import { ClinicalNote } from "@/lib/types";

interface VisitHistoryTimelineProps {
  notes: ClinicalNote[];
}

export function VisitHistoryTimeline({ notes }: VisitHistoryTimelineProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNote = (noteId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Sort notes by date (most recent first)
  const sortedNotes = [...notes].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No visit history yet</p>
            <p className="text-xs mt-1">Visit notes will appear here once documented</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedNotes.map((note, index) => {
        const isExpanded = expandedNotes.has(note.id);
        const isLastNote = index === sortedNotes.length - 1;

        return (
          <div key={note.id} className="relative">
            {/* Timeline Line */}
            {!isLastNote && (
              <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-slate-200" />
            )}

            <Card className="relative border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                {/* Timeline Dot */}
                <div className="absolute -left-[14px] top-6 w-6 h-6 rounded-full bg-teal-100 border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-teal-600" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="font-semibold text-sm text-slate-900">
                      {formatDate(note.date)}
                    </p>
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      SOAP Note
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNote(note.id)}
                    className="h-7 text-xs"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 mr-1" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 mr-1" />
                        Expand
                      </>
                    )}
                  </Button>
                </div>

                {/* Preview (always shown) */}
                {!isExpanded && (
                  <div className="space-y-2 text-sm">
                    {note.soap.subjective && (
                      <div>
                        <span className="font-semibold text-slate-700">S:</span>{" "}
                        <span className="text-slate-600">
                          {note.soap.subjective.slice(0, 150)}
                          {note.soap.subjective.length > 150 && "..."}
                        </span>
                      </div>
                    )}
                    {note.soap.assessment && (
                      <div>
                        <span className="font-semibold text-slate-700">A:</span>{" "}
                        <span className="text-slate-600">
                          {note.soap.assessment.slice(0, 150)}
                          {note.soap.assessment.length > 150 && "..."}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Full SOAP Note (when expanded) */}
                {isExpanded && (
                  <div className="space-y-4">
                    {note.soap.subjective && (
                      <div>
                        <div className="inline-flex items-center gap-1.5 mb-1.5">
                          <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                            S
                          </div>
                          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Subjective
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed pl-7">
                          {note.soap.subjective}
                        </p>
                      </div>
                    )}

                    {note.soap.objective && (
                      <div>
                        <div className="inline-flex items-center gap-1.5 mb-1.5">
                          <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                            O
                          </div>
                          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Objective
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed pl-7">
                          {note.soap.objective}
                        </p>
                      </div>
                    )}

                    {note.soap.assessment && (
                      <div>
                        <div className="inline-flex items-center gap-1.5 mb-1.5">
                          <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                            A
                          </div>
                          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Assessment
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed pl-7">
                          {note.soap.assessment}
                        </p>
                      </div>
                    )}

                    {note.soap.plan && (
                      <div>
                        <div className="inline-flex items-center gap-1.5 mb-1.5">
                          <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                            P
                          </div>
                          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Plan
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed pl-7">
                          {note.soap.plan}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400">
                        Note ID: {note.id} •{" "}
                        Created: {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
