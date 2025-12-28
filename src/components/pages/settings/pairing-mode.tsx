"use client"

import { useDeviceState } from "@/hooks/useDeviceState"
import { Smartphone, ShieldCheck, Wifi } from "lucide-react"

export function PairingMode() {
    const { state } = useDeviceState()
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-6">
      
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card/80 backdrop-blur p-6 shadow-lg">
        
        {/* Icon header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wifi className="h-7 w-7 animate-pulse" />
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            Pairing mode active
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Open the Soloras mobile app to connect
          </p>
        </div>

        {/* Pairing code card */}
        <div className="relative mb-6 overflow-hidden rounded-xl border bg-muted/40 p-5 text-center">
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-xl ring-2 ring-primary/30 animate-pulse" />

          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Pairing code
            </p>

            <div className="mt-2 text-4xl font-mono font-semibold tracking-widest">
              {state?.pairing_code || "----"}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-primary" />
            <span>Enter this code in the mobile app</span>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Only devices on your network can pair</span>
          </div>
        </div>
      </div>
    </div>
  )
}
