import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { platform } from "@tauri-apps/plugin-os"

import { AppRoutes } from "./routes"
import { MiniDrawerLayout } from "./components/mini-drawer-layout"
import { useSoloraMode } from "./hooks/useSoloraMode"
import { IdleScreen } from "./components/idle-screen"

function App() {
  const { mode, isIdle } = useSoloraMode({
    timeout: 5_000, // 5 seconds
  })

  useEffect(() => {
    let mounted = true

    const setupWindow = async () => {
      const appWindow = getCurrentWindow()
      const os = await platform()
      const isDev = process.env.NODE_ENV === "development"

      if (!mounted) return

      if (os === "windows" || isDev) {
        await appWindow.setFullscreen(false)
        await appWindow.setResizable(true)
        await appWindow.setDecorations(true)
        await appWindow.setAlwaysOnTop(false)
      }
    }

    setupWindow()
    return () => {
      mounted = false
    }
  }, [])

  // 🔑 THIS IS THE IMPORTANT PART
  if (isIdle) {
    return <IdleScreen />
  }

  return (
    <BrowserRouter>
      <MiniDrawerLayout>
        <AppRoutes />
      </MiniDrawerLayout>
    </BrowserRouter>
  )
}

export default App
