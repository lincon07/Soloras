export interface DeviceState {
  device_id: string
  device_name?: string | null
  paired: boolean
  pairing_code?: string | null
  is_pairing: boolean
}
