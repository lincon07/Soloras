use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Controller {
    pub controller_id: String,
    pub name: String,
    pub auth_token: String,
    pub added_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceState {
    pub device_id: String,
    pub device_name: Option<String>,
    pub paired: bool,
    pub pairing_code: Option<String>,
    pub controllers: Vec<Controller>,
}

impl DeviceState {
    pub fn new(device_id: String) -> Self {
        Self {
            device_id,
            device_name: Some("Living Room Screen".to_string()),
            paired: false,
            pairing_code: None,
            controllers: vec![],
        }
    }
}
