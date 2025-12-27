use crate::device_state::DeviceState;
use mdns_sd::{ServiceDaemon, ServiceInfo};
use std::collections::HashMap;

#[allow(dead_code)]
pub struct MdnsHandle {
    daemon: ServiceDaemon,
}

impl MdnsHandle {
    pub fn start(state: &DeviceState) -> Self {
        let daemon = ServiceDaemon::new().expect("Failed to create mDNS daemon");

        let mut txt_props = HashMap::new();
        txt_props.insert("device_id".to_string(), state.device_id.clone());
        txt_props.insert("paired".to_string(), "false".to_string());
        txt_props.insert("model".to_string(), "pi-wall-screen".to_string());

        let service = ServiceInfo::new(
            "_peak._tcp.local.",                           // service type
            state.device_name.as_deref().unwrap_or("hub"), // instance name
            "",                                            // hostname (auto)
            (),                                            // ✅ ip_addrs (auto)
            8123,                                          // port
            txt_props,
        )
        .expect("Failed to create service info");

        daemon
            .register(service)
            .expect("Failed to register mDNS service");

        println!("📡 mDNS advertising started");

        Self { daemon }
    }

    #[allow(dead_code)]
    pub fn stop(self) {
        println!("🛑 mDNS advertising stopped");
        let _ = self.daemon.shutdown();
    }
}
