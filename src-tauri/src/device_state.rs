use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceState {
    pub device_id: String,
    pub device_name: Option<String>,
    pub paired: bool,
    pub pairing_code: Option<String>,
}

impl DeviceState {
    pub fn new(device_id: String) -> Self {
        Self {
            device_id,
            device_name: Some("Living Room Screen".to_string()),
            paired: false,
            pairing_code: None,
        }
    }
}
