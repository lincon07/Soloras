import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { LucideWifiSync, Wifi } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";


const SettingsPage = () => {

    const handleStartPairing = async () => {
      const result = await invoke("start_pairing_mode");

        console.log("Pairing mode started:", result);
    }

    useEffect(() => {
       const unlistenDeviceUpdated = listen("device-state-updated", (event:any) => {
            console.log("Pairing mode event received:", event);
            if (event?.payload?.isParing) {
                toast.success("Device is now in pairing mode.", {icon: <Wifi />});
            }
        });``

        const unlistedAlreadyPairied = listen("device-already-paired-or-pairing", (event) => {
            toast.error("Device is already paired or in pairing mode.", {icon: <LucideWifiSync />});
        });

        return () => {
            unlistenDeviceUpdated.then((f) => f());
            unlistedAlreadyPairied.then((f) => f());
        }
    }, [])
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            {/* Settings content goes here */}
            <button
                onClick={handleStartPairing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Start Pairing Mode
            </button>
        </div>
    );
    
}

export default SettingsPage;