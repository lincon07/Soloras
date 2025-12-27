import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { DeviceState } from "@/types/common/device-state"

export function useDeviceState() {
  const [state, setState] = useState<DeviceState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unlisten: (() => void) | undefined

    // 1️⃣ initial fetch
    invoke<DeviceState>("get_device_state")
      .then((data) => {
        setState(data)
        setLoading(false)
      })
      .catch(console.error)

    // 2️⃣ live updates
    listen<DeviceState>("device-state-updated", (event) => {
      setState(event.payload)
    }).then((fn) => {
      unlisten = fn
    })

    return () => {
      unlisten?.()
    }
  }, [])

  return { state, loading }
}
