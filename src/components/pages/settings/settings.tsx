import { useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { toast } from "sonner"

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Paper,
} from "@mui/material"

import PairingPrompt from "./pairing-promp"

import SettingsIcon from "@mui/icons-material/Settings"
import WifiIcon from "@mui/icons-material/Wifi"
import { WifiSyncIcon } from "lucide-react"

const SettingsPage = () => {
  /* ---------------- Pairing ---------------- */

  const handleStartPairing = async () => {
    const result = await invoke("start_pairing_mode")
    console.log("Pairing mode started:", result)
  }

  /* ---------------- Pairing Errors ---------------- */

  useEffect(() => {
    const unlistenBlocked = listen("pairing:blocked", () => {
      toast.error("Another device is already pairing")
    })

    const unlistenAlreadyPaired = listen(
      "pairing:already-paired",
      (device: any) => {
        toast.warning(`${device} is already paired`)
      }
    )

    return () => {
      unlistenBlocked.then((f) => f())
      unlistenAlreadyPaired.then((f) => f())
    }
  }, [])

  /* ---------------- Device State Events ---------------- */

  useEffect(() => {
    const unlistenDeviceUpdated = listen(
      "device-state-updated",
      (event: any) => {
        if (event?.payload?.isPairing) {
          toast.success("Device is now in pairing mode.", {
            icon: <WifiIcon />,
          })
        }
      }
    )

    const unlistenAlreadyPairing = listen(
      "device-already-paired-or-pairing",
      () => {
        toast.error(
          "Device is already paired or currently pairing.",
          {
            icon: <WifiSyncIcon />,
          }
        )
      }
    )

    return () => {
      unlistenDeviceUpdated.then((f) => f())
      unlistenAlreadyPairing.then((f) => f())
    }
  }, [])

  /* ---------------- UI ---------------- */

  return (
    <Container maxWidth="sm">
      <Stack spacing={4} py={4}>
        {/* Header */}

        {/* Pairing Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600}>
              Device Pairing
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Put this hub into pairing mode to allow nearby devices
              to securely connect.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<WifiIcon />}
              onClick={handleStartPairing}
            >
              Start Pairing Mode
            </Button>
          </Stack>
        </Paper>

        {/* Pairing Prompt Dialog */}
        <PairingPrompt />
      </Stack>
    </Container>
  )
}

export default SettingsPage
