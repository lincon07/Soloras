import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process"
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { json } from "node:stream/consumers";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }
  const [response, setResponse] = useState<any>("");


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
    setResponse(isUpdateAvail);
  };


  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>
      v2.0.0 should not see if update is worked
      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <Button onClick={handleCheckForUpdates}>Check for updates</Button>
      <p>{greetMsg}</p>
      <p>Update available: {response ? "Yes" : "No"}</p>
    </main>
  );
}

export default App;
