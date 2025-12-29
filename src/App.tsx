import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { platform } from "@tauri-apps/plugin-os"

import { AppRoutes } from "./routes"
import { MiniDrawerLayout } from "./components/mini-drawer-layout"

function App() {
  useEffect(() => {
    let mounted = true

    const setupWindow = async () => {
      const appWindow = getCurrentWindow()
      const os = await platform()
      const isDev = process.env.NODE_ENV === "development"

      if (!mounted) return

      // if (os === "windows" || isDev) {
      //   await appWindow.setFullscreen(false)
      //   await appWindow.setResizable(true)
      //   await appWindow.setDecorations(true)
      //   await appWindow.setAlwaysOnTop(false)
      // }
    }

    setupWindow()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <BrowserRouter>
      <MiniDrawerLayout>
        <AppRoutes />
      </MiniDrawerLayout>
    </BrowserRouter>
  )
}

export default App
