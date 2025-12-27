import { useEffect } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { useUpdater } from "./providers/updater";

function App() {
  const appWindow = getCurrentWindow()
  const updater = useUpdater()

  const applicationPlatform =  platform()

  useEffect(() => {
    if (applicationPlatform === "windows") {
      appWindow.setFullscreen(false)
      appWindow.setResizable(true)
      appWindow.setAlwaysOnTop(false)
    }

    console.log("Platform: ", applicationPlatform)
  }, [applicationPlatform])

  return (
    <main className="container">

      <div>
        <span>
          Welcome to Soloras
        </span>

        <Button onClick={() => appWindow.close()}>
          Close App
        </Button>
      </div>

    <Button onClick={() => updater?.checkForUpdates()}>
      Check For Updates
    </Button>
    </main>
  );
}

export default App;
