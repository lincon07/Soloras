use mdns_sd::{ServiceDaemon, ServiceInfo};
use crate::device_state::DeviceState;
use std::collections::HashMap;

/// Handle that keeps the mDNS daemon alive for the lifetime of the app.
///
/// This struct is intentionally held even if not actively used yet.
/// It will be consumed later when pairing completes.
#[allow(dead_code)]
pub struct MdnsHandle {
    daemon: ServiceDaemon,
}

impl MdnsHandle {
    /// Start advertising this device over mDNS / Bonjour.
    ///
    /// This should ONLY be called when the device is unpaired.
    pub fn start(state: &DeviceState) -> Self {
        let daemon = ServiceDaemon::new()
            .expect("Failed to create mDNS daemon");

        let mut txt_props = HashMap::new();
        txt_props.insert("device_id".to_string(), state.device_id.clone());
        txt_props.insert("paired".to_string(), "false".to_string());
        txt_props.insert("model".to_string(), "pi-wall-screen".to_string());

        let service = ServiceInfo::new(
            "_peak._tcp.local.",    // service type
            &state.device_name,     // instance name
            "_peak._tcp.local.",    // hostname
            "",
            8123,                   // pairing server port
            txt_props,
        )
        .expect("Failed to create service info");

        daemon
            .register(service)
            .expect("Failed to register mDNS service");

        println!("📡 mDNS advertising started");

        Self { daemon }
    }

    /// Stop advertising over mDNS.
    ///
    /// This will be called once the device is successfully paired.
    #[allow(dead_code)]
    pub fn stop(self) {
        println!("🛑 mDNS advertising stopped");
        let _ = self.daemon.shutdown();
    }
}
