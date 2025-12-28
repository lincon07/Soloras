use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::{Arc, Mutex}};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingRequest {
    pub id: Uuid,
    pub device_name: String,
    pub status: PairingStatus,
    pub token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum PairingStatus {
    Pending,
    Approved,
    Denied,
}

pub type PairingState = Arc<Mutex<HashMap<Uuid, PairingRequest>>>;

pub fn new_pairing_state() -> PairingState {
    Arc::new(Mutex::new(HashMap::new()))
}
