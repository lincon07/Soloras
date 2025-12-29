import { useEffect, useState } from "react"
import { listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
} from "@mui/material"

import LinkIcon from "@mui/icons-material/Link"
import SmartphoneIcon from "@mui/icons-material/Smartphone"
import ShieldIcon from "@mui/icons-material/Shield"
import BlockIcon from "@mui/icons-material/Block"
 
type PairingRequest = {
  id: string
  device_name: string
  status: "Pending" | "Approved" | "Denied"
}

export default function PairingPrompt() {
  const [request, setRequest] = useState<PairingRequest | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const unlisten = listen<PairingRequest>(
      "pairing:request",
      (event) => {
        setRequest(event.payload)
        setOpen(true)
      }
    )

    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  const close = () => {
    setOpen(false)
    setRequest(null)
  }

  const approve = async () => {
    if (!request) return
    await invoke("approve_pairing", { pairingId: request.id })
    close()
  }

  const deny = async () => {
    if (!request) return
    await invoke("deny_pairing", { pairingId: request.id })
    close()
  }

  if (!request) return null

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent>
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LinkIcon fontSize="medium" />
          </Box>

          {/* Title */}
          <DialogTitle sx={{ p: 0 }}>
            New Pairing Request
          </DialogTitle>

          <Typography variant="body2" color="text.secondary">
            A nearby device wants to connect to this hub.
          </Typography>

          {/* Device Card */}
          <Paper
            variant="outlined"
            sx={{
              width: "100%",
              p: 2,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SmartphoneIcon />
              </Box>

              <Box textAlign="left">
                <Typography fontWeight={600}>
                  {request.device_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Waiting for approval
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Actions */}
          <Stack direction="row" spacing={2} width="100%">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<ShieldIcon />}
              onClick={approve}
            >
              Approve
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<BlockIcon />}
              onClick={deny}
            >
              Deny
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
