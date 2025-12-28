import { Toaster } from "sonner"
import { AutoStartProvider } from "./providers/auto-start"
import { ThemeProvider } from "./providers/theme"
import { UpdaterProvider } from "./providers/updater"



const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster position="bottom-center" />
            <AutoStartProvider>
                <UpdaterProvider>
                        {children}
                </UpdaterProvider>
            </AutoStartProvider>
        </ThemeProvider>
    )

}

export default Providers