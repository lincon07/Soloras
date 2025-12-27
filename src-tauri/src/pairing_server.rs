use axum::{
    routing::post,
    Router,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use rand::Rng;
use serde::Deserialize;
use std::{net::SocketAddr, sync::{Arc, Mutex}};
use tauri::{AppHandle, Emitter};

use crate::device_state::DeviceState;
use crate::mdns::MdnsHandle;

#[derive(Deserialize)]
struct ConfirmBody {
    code: String,
}

pub fn start_pairing_server(
    app: AppHandle,
    state: Arc<Mutex<DeviceState>>,
    mdns: Arc<Mutex<Option<MdnsHandle>>>,
) {
    let router = Router::new()
        .route("/pair/request", post({
            let app = app.clone();
            let state = state.clone();
            move || handle_pair_request(app.clone(), state.clone())
        }))
        .route("/pair/confirm", post({
            let app = app.clone();
            let state = state.clone();
            let mdns = mdns.clone();
            move |Json(body): Json<ConfirmBody>| {
                handle_pair_confirm(app.clone(), state.clone(), mdns.clone(), body)
            }
        }));

    tauri::async_runtime::spawn(async move {
        let addr: SocketAddr = "0.0.0.0:8123".parse().unwrap();
        println!("🌐 Pairing server listening on http://{}", addr);

        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, router).await.unwrap();
    });
}

async fn handle_pair_request(
    app: AppHandle,
    state: Arc<Mutex<DeviceState>>,
) -> impl IntoResponse {
    let code = format!("{:06}", rand::thread_rng().gen_range(0..1_000_000));

    {
        let mut s = state.lock().unwrap();
        s.pairing_code = Some(code.clone());
        s.paired = false;
        let _ = app.emit("device-state-updated", s.clone());
    }

    println!("🔐 Pairing requested. Code: {}", code);
    (StatusCode::OK, "PAIRING_STARTED")
}

async fn handle_pair_confirm(
    app: AppHandle,
    state: Arc<Mutex<DeviceState>>,
    mdns: Arc<Mutex<Option<MdnsHandle>>>,
    body: ConfirmBody,
) -> impl IntoResponse {
    let mut s = state.lock().unwrap();

    match &s.pairing_code {
        Some(expected) if expected == &body.code => {
            s.paired = true;
            s.pairing_code = None;

            // Stop mDNS advertising
            if let Some(handle) = mdns.lock().unwrap().take() {
                handle.stop();
            }

            let _ = app.emit("device-state-updated", s.clone());
            println!("✅ Pairing confirmed");

            StatusCode::OK
        }
        _ => {
            println!("❌ Pairing failed: invalid code");
            StatusCode::UNAUTHORIZED
        }
    }
}
