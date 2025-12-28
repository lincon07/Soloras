use serde::{Deserialize, Serialize};
use serde_json::json;
use std::net::SocketAddr;
use tokio::net::UdpSocket;
use tracing::{error, info};

/// Port used for Soloras discovery
pub const DISCOVERY_PORT: u16 = 42424;

/// Incoming discovery packet (from mobile)
#[derive(Debug, Deserialize)]
struct DiscoveryRequest {
    #[serde(rename = "type")]
    msg_type: String,
    request_id: Option<String>,
}

/// Outgoing discovery response (from hub)
#[derive(Debug, Serialize)]
struct DiscoveryResponse {
    #[serde(rename = "type")]
    msg_type: &'static str,
    hub_id: String,
    hub_name: String,
    api_port: u16,
    pairing: bool,
}

/// Starts the UDP broadcast discovery listener
///
/// This should be spawned as a background task on app startup.
pub async fn start_udp_discovery(
    hub_id: String,
    hub_name: String,
    api_port: u16,
    pairing_enabled: impl Fn() -> bool + Send + Sync + 'static,
) {
    let bind_addr = format!("0.0.0.0:{DISCOVERY_PORT}");

    let socket = match UdpSocket::bind(&bind_addr).await {
        Ok(s) => s,
        Err(e) => {
            error!("❌ Failed to bind UDP discovery socket: {e}");
            return;
        }
    };

    info!("📡 UDP discovery listening on {bind_addr}");

    let mut buf = [0u8; 1024];

    loop {
        let (len, addr) = match socket.recv_from(&mut buf).await {
            Ok(v) => v,
            Err(e) => {
                error!("UDP recv error: {e}");
                continue;
            }
        };

        // Safety: ignore large packets
        if len > 1024 {
            continue;
        }

        let req: DiscoveryRequest = match serde_json::from_slice(&buf[..len]) {
            Ok(r) => r,
            Err(_) => continue,
        };

        if req.msg_type != "DISCOVER_SOLORAS" {
            continue;
        }

        let response = DiscoveryResponse {
            msg_type: "SOLORAS_HUB",
            hub_id: hub_id.clone(),
            hub_name: hub_name.clone(),
            api_port,
            pairing: pairing_enabled(),
        };

        let payload = match serde_json::to_vec(&response) {
            Ok(p) => p,
            Err(_) => continue,
        };

        if let Err(e) = socket.send_to(&payload, &addr).await {
            error!("Failed to send discovery response to {addr}: {e}");
        }
    }
}
