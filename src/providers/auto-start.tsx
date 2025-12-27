import { AutoStartProviderType } from "@/types/providers/auto-start";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import React, { useEffect } from "react";



export const AutoStartProviderContext = React.createContext<AutoStartProviderType | null>(null);


export const AutoStartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {


    useEffect(() => {
        // SHOULD ALWAYS AUTO START SINNCE APPLICATION IS A KIOSK APP
        enable();
    }, [])

    const value: AutoStartProviderType = {
        enable,
        disable,
        isEnabled,
    }

    return (
        <AutoStartProviderContext.Provider value={value}>
            {children}
        </AutoStartProviderContext.Provider>
    )
}