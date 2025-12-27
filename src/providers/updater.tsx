import React, {
    createContext,
    useCallback,
    useEffect,
    useState,
} from "react"
import { check, Update } from "@tauri-apps/plugin-updater"
import { relaunch } from "@tauri-apps/plugin-process"
import { toast } from "sonner"
import { UpdaterProviderType } from "@/types/providers/updater"


export const UpdaterProviderContext =
    createContext<UpdaterProviderType | null>(null)


export const UpdaterProvider: React.FC<
    React.PropsWithChildren
> = ({ children }) => {
    const [checking, setChecking] = useState(false)
    const [update, setUpdate] = useState<Update | null>(null)
    const [updateAvailable, setUpdateAvailable] = useState(false)


    const checkForUpdates = useCallback(async () => {
        setChecking(true)
        try {
            const result = await check()
            if (result) {
                setUpdate(result)
                setUpdateAvailable(true)

                toast.success(
                    `Update ${result.version} available`,
                    {
                        description: result.date,
                        action: {
                            label: "Install",
                            onClick: () => installUpdate(),
                        },
                    }
                )
            } else {
                setUpdate(null)
                setUpdateAvailable(false)
            }
        }  catch (error) {
            console.error("Error checking for updates:", error)
            toast.error("Failed to check for updates", {description: String(error)})
        }
        finally {
            setChecking(false)
        }
    }, [])

    const installUpdate = useCallback(async () => {
        if (!update) return

        toast.promise(
            (async () => {
                await update.downloadAndInstall()
                await relaunch()
            })(),
            {
                loading: "Downloading & installing update…",
                success: "Update installed — restarting app",
                error: "Failed to install update",
            }
        )
    }, [update])


    useEffect(() => {
        checkForUpdates()
    }, [checkForUpdates])


    const value: UpdaterProviderType = {
        checking,
        updateAvailable,
        update,
        checkForUpdates,
        installUpdate,
    }

    return (
        <UpdaterProviderContext.Provider value={value}>
            {children}
        </UpdaterProviderContext.Provider>
    )
}


export const useUpdater = (): UpdaterProviderType => {
    const context = React.useContext(UpdaterProviderContext)
    if (!context) {
        throw new Error(
            "useUpdater must be used within an UpdaterProvider"
        )
    }
    return context
}
