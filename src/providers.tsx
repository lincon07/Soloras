import { AutoStartProvider } from "./providers/auto-start"
import { UpdaterProvider } from "./providers/updater"



const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <AutoStartProvider>
            <UpdaterProvider>
                {children}
            </UpdaterProvider>
        </AutoStartProvider>
    )

}

export default Providers