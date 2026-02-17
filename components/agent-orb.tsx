"use client";

import { cn } from "@/lib/utils";

interface AgentOrbProps {
  status: "disconnected" | "connecting" | "connected" | "disconnecting";
  isSpeaking: boolean;
}

export function AgentOrb({ status, isSpeaking }: AgentOrbProps) {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="relative flex items-center justify-center">
      {isConnected && isSpeaking && (
        <>
          <div className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full bg-emerald-400/20 animate-[ripple_2s_ease-out_infinite]" />
          <div className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full bg-emerald-400/15 animate-[ripple_2s_ease-out_infinite_0.5s]" />
          <div className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full bg-emerald-400/10 animate-[ripple_2s_ease-out_infinite_1s]" />
        </>
      )}
      {isConnected && !isSpeaking && (
        <div className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full bg-teal-400/20 animate-[pulse_2s_ease-in-out_infinite]" />
      )}
      <div
        className={cn(
          "relative w-16 h-16 md:w-24 md:h-24 rounded-full border-2 transition-all duration-500 flex items-center justify-center shadow-lg",
          status === "disconnected" && "bg-slate-100 border-slate-300",
          isConnecting && "bg-cyan-50 border-cyan-400 animate-[spin_3s_linear_infinite]",
          isConnected && !isSpeaking && "bg-teal-50 border-teal-400 animate-[gentle-pulse_2s_ease-in-out_infinite]",
          isConnected && isSpeaking && "bg-emerald-50 border-emerald-400 scale-110",
          status === "disconnecting" && "bg-slate-100 border-slate-300 opacity-50"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 md:w-12 md:h-12 rounded-full transition-all duration-500",
            status === "disconnected" && "bg-slate-200",
            isConnecting && "bg-cyan-200",
            isConnected && !isSpeaking && "bg-teal-200",
            isConnected && isSpeaking && "bg-emerald-200",
            status === "disconnecting" && "bg-slate-200"
          )}
        />
      </div>
    </div>
  );
}
