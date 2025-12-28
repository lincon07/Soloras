import { useEffect } from "react"
import "./App.css"

import { getCurrentWindow } from "@tauri-apps/api/window"
import { platform } from "@tauri-apps/plugin-os"

import { AppRoutes } from "./routes"
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"
import { AppSidebar } from "./components/sidebar/app-sidebar"
import { BrowserRouter } from "react-router-dom"

function App() {
  useEffect(() => {
    let mounted = true

    const setupWindow = async () => {
      const appWindow = getCurrentWindow()
      const os = await platform()
      // if   
      const isDev = process.env.NODE_ENV === "development"

      if (!mounted) return

      console.log("Platform:", os)

      if (os === "windows" || isDev) {
        await appWindow.setFullscreen(false)
        await appWindow.setResizable(true)
        await appWindow.setDecorations(true)
        await appWindow.setAlwaysOnTop(false)
      }

      // await appWindow.show()
    }

    setupWindow()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="mt-5">
        <BrowserRouter>

      {/* ts-ignore */}
      <SidebarProvider
        style={{
          "--sidebar-width": "10rem",
          "--sidebar-width-mobile": "20rem",
        }}
      >
        <AppSidebar />
        <SidebarTrigger />
        <AppRoutes />
      </SidebarProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
