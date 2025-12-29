pub mod routes;
pub mod state;
pub mod store;

use tauri::{AppHandle, Emitter};
use uuid::Uuid;

use state::{PairingStatus, PairingRequest, SharedPairingState};

/// Approve a pairing request
pub fn approve_pairing_internal(
    app: &AppHandle,
    state: &SharedPairingState,
    pairing_id: &str,
) -> Result<(), String> {
    let id = Uuid::parse_str(pairing_id)
        .map_err(|_| "Invalid pairing ID")?;

    let mut state = state
        .lock()
        .map_err(|_| "Pairing state poisoned")?;

    let req = state
        .requests
        .get_mut(&id)
        .ok_or("Pairing request not found")?;

    req.status = PairingStatus::Approved;
    req.token = Some(format!("hub-token-{}", Uuid::new_v4()));

    let _ = app.emit("pairing:updated", req.clone());
    Ok(())
}

/// Deny a pairing request
pub fn deny_pairing_internal(
    app: &AppHandle,
    state: &SharedPairingState,
    pairing_id: &str,
) -> Result<(), String> {
    let id = Uuid::parse_str(pairing_id)
        .map_err(|_| "Invalid pairing ID")?;

    let mut state = state
        .lock()
        .map_err(|_| "Pairing state poisoned")?;

    let req = state
        .requests
        .get_mut(&id)
        .ok_or("Pairing request not found")?;

    req.status = PairingStatus::Denied;
    req.token = None;

    let _ = app.emit("pairing:updated", req.clone());
    Ok(())
}
