use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use uuid::Uuid;

#[derive(Clone, Serialize, Deserialize)]
pub struct PairingRequest {
    pub id: Uuid,
    pub device_name: String,
    pub status: PairingStatus,
    pub token: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Serialize, Deserialize, PartialEq)]
pub enum PairingStatus {
    Pending,
    Approved,
    Denied,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct PairedDevice {
    pub device_id: String,
    pub device_name: String,
    pub token: String,
    pub paired_at: DateTime<Utc>,
}

#[derive(Default)]
pub struct PairingState {
    pub requests: HashMap<Uuid, PairingRequest>,
    pub active: Option<Uuid>,
}

/// ✅ THIS is what you must pass around everywhere
pub type SharedPairingState = Arc<Mutex<PairingState>>;

pub fn new_pairing_state() -> SharedPairingState {
    Arc::new(Mutex::new(PairingState::default()))
}
