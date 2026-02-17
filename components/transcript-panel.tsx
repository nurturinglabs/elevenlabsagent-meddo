"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface TranscriptMessage {
  role: "agent" | "user";
  message: string;
}

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  isListening: boolean;
}

export function TranscriptPanel({ messages, isListening }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        Start a conversation to see the transcript here
      </div>
    );
  }

  return (
    <ScrollArea className="h-48 md:h-60 w-full rounded-lg border border-slate-200 bg-white p-3">
      <div className="space-y-2.5">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-teal-700 text-white rounded-br-md"
                  : "bg-slate-100 text-slate-800 rounded-bl-md"
              )}
            >
              {msg.message}
            </div>
          </div>
        ))}
        {isListening && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-3.5 py-2 text-sm text-slate-400">
              Listening<span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
