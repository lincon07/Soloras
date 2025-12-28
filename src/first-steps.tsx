"use client"
import { ArrowRight, Settings } from "lucide-react"
import { Button } from "./components/ui/button"
import { invoke } from "@tauri-apps/api/core"

export default function FirstTimeSetup({ deviceId, deviceName }: { deviceId: string, deviceName?: string | null}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">

                {/* Header */}
                <div className="mb-6 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Set up this hub
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        This device hasn’t been configured yet.
                    </p>
                </div>

                {/* Device Info */}
                <div className="mb-6 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Device name</span>
                        <input type="text" defaultValue={deviceName || "Soloras Hub"} className="bg-transparent font-medium text-right focus:outline-none" />
                    </div>

                    <div className="mt-1 flex justify-between">
                        <span className="text-muted-foreground">Device ID</span>
                        <span className="font-mono text-xs">{deviceId}</span>
                    </div>
                </div>


                <Button onClick={() => {invoke("set_device_name", { name: deviceName || "Soloras Hub" })}} className="w-full mb-3 flex items-center justify-center gap-2">
                    Save
                </Button>
                <button
                    className="w-full rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                    Learn more
                </button>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
                You can finish setup later from settings.
            </p>
      </div >
    )
}

