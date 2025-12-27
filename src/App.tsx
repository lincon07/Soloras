import { useEffect } from "react";
import "./App.css";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process"
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { getCurrentWindow } from "@tauri-apps/api/window";

function App() {
  const appWindow = getCurrentWindow()


  const handleDownloadAndInstallAndReLAUNCH = async (update: Update) => {
    await update?.downloadAndInstall();
    await relaunch()
  }

  const handleCheckForUpdates = async () => {
    const isUpdateAvail = await check();

    if (isUpdateAvail != null) {
      // update is available
      console.log("Update available: ", isUpdateAvail);

      console.log("Downloading and installing update...");
      toast.success(`Update ${isUpdateAvail?.version} availible, would you likee to inststall now`, {
        description: isUpdateAvail?.date,
        action: {
          label: "Install",
          onClick: async () => {
            toast.promise(handleDownloadAndInstallAndReLAUNCH(isUpdateAvail), {
              loading: "Downloading and installing",
              success: "Updadate installed, resgafting app",
              error: "failed to install update",
            }
            )
          }
        }
      })

    } else {
      console.log("No update available");
    }
    console.log(isUpdateAvail);
  };

  const handleAutoStart = async () => {
    // Enable autostart
    await enable();
    // Check enable state
    console.log(`registered for autostart? ${await isEnabled()}`);
  }
  
  useEffect(() => {
    handleAutoStart();
  }, []);

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
      <Button onClick={handleCheckForUpdates}>Check for updates</Button>

    </main>
  );
}

export default App;
