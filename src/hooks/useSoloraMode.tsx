import { useEffect, useRef, useState } from "react"

export type SoloraMode = "device" | "catalog"

type IdleModeOptions = {
  timeout: number
}

export function useSoloraMode({ timeout }: IdleModeOptions) {
  const timer = useRef<number | null>(null)
  const idleRef = useRef(false)

  const [mode, setMode] = useState<SoloraMode>("device")

  useEffect(() => {
    const reset = () => {
      if (timer.current) {
        window.clearTimeout(timer.current)
      }

      if (idleRef.current) {
        idleRef.current = false
        setMode("device")
      }

      timer.current = window.setTimeout(() => {
        idleRef.current = true
        setMode("catalog")
      }, timeout)
    }

    const events = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart",
    ]

    events.forEach((e) => window.addEventListener(e, reset))
    reset()

    return () => {
      if (timer.current) window.clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [timeout])

  return {
    mode,
    isIdle: mode === "catalog",
  }
}
