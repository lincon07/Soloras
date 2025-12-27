import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { useUpdater } from "./providers/updater";
import { useDeviceState } from "./hooks/useDeviceState";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const appWindow = getCurrentWindow()
  const { loading, state} = useDeviceState()
  const applicationPlatform = platform()
  
  useEffect(() => {
    if (applicationPlatform === "windows") {
      appWindow.setFullscreen(false)
      appWindow.setResizable(true)
      appWindow.setAlwaysOnTop(false)
    }

    console.log("Platform: ", applicationPlatform)
  }, [applicationPlatform])

  useEffect(() => {
    invoke("get_device_state").then((d) => {
      console.log("Device state fetched", d)
    })

  }, [])
  return (
    <main className="m-10">
      {state && (
      <>
        <div>Device Name: {state.device_name}</div>
        <div>Device ID: {state.device_id}</div>
        <div>Paired: {state.paired ? "Yes" : "No"}</div>
        <div>Pairing Code: {state.pairing_code || "N/A"}</div></>

      )}
    </main>
  );
}

export default App;
