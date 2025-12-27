use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]

pub struct DeviceState {
    pub device_id: String,
    pub device_name: String,
    pub paired: bool,
}

impl DeviceState {
    pub fn new() -> Self {
        Self {
            device_id: Uuid::new_v4().to_string(),
            device_name: "Living Room Screen".to_string(),
            paired: false,
        }
    }
}
