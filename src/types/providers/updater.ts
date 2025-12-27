import { Update } from "@tauri-apps/plugin-updater";

export interface UpdaterProviderType {
  checking: boolean
  updateAvailable: boolean
  update: Update | null

  checkForUpdates: () => Promise<void>
  installUpdate: () => Promise<void>
}