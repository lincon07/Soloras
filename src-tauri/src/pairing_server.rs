use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use chrono::Utc;
use rand::{rngs::OsRng, Rng, RngCore};
use serde::Deserialize;
use std::{
    net::SocketAddr,
    sync::{Arc, Mutex},
};
use tauri::{AppHandle, Emitter, Wry};
use tauri_plugin_store::Store;
use uuid::Uuid;

use crate::{
    device_state::{Controller, DeviceState},
    mdns::MdnsHandle,
    persistence::persist_state,
};

/// ---------- Request Bodies ----------

#[derive(Deserialize)]
struct ConfirmBody {
    code: String,
    device_name: Option<String>,
}

/// ---------- Helpers ----------

fn generate_token() -> String {
    let mut buf = [0u8; 32];
    OsRng.fill_bytes(&mut buf);
    hex::encode(buf)
}

// (Optional for later auth-gated endpoints)
#[allow(dead_code)]
fn validate_token(state: &DeviceState, token: &str) -> bool {
    state.controllers.iter().any(|c| c.auth_token == token)
}

/// ---------- Tauri Commands ----------

#[tauri::command]
pub fn list_controllers(
    state: tauri::State<'_, Arc<Mutex<DeviceState>>>,
) -> Vec<(String, String)> {
    state
        .lock()
        .unwrap()
        .controllers
        .iter()
        .map(|c| (c.controller_id.clone(), c.name.clone()))
        .collect()
}

/// ---------- Server Startup ----------

pub fn start_pairing_server(
    app: AppHandle,
    state: Arc<Mutex<DeviceState>>,
    mdns: Arc<Mutex<Option<MdnsHandle>>>,
store: Arc<Store<Wry>>,

) {
    let router = Router::new()
        .route(
            "/pair/request",
            post({
                let app = app.clone();
                let state = state.clone();
                move || handle_pair_request(app.clone(), state.clone())
            }),
        )
        .route(
            "/pair/confirm",
            post({
                let app = app.clone();
                let state = state.clone();
                let mdns = mdns.clone();
                let store = store.clone();
                move |Json(body): Json<ConfirmBody>| {
                    handle_pair_confirm(
                        app.clone(),
                        state.clone(),
                        mdns.clone(),
                        store.clone(),
                        body,
                    )
                }
            }),
        );

    tauri::async_runtime::spawn(async move {
        let addr: SocketAddr = "0.0.0.0:8123".parse().unwrap();
        println!("🌐 Pairing server listening on http://{}", addr);

        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, router).await.unwrap();
    });
}

/// ---------- Handlers ----------

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
    store: Arc<Store<Wry>>,
    body: ConfirmBody,
) -> impl IntoResponse {
    let mut s = state.lock().unwrap();

    match &s.pairing_code {
        Some(expected) if expected == &body.code => {
            let controller = Controller {
                controller_id: Uuid::new_v4().to_string(),
                name: body
                    .device_name
                    .unwrap_or_else(|| "Unknown Device".to_string()),
                auth_token: generate_token(),
                added_at: Utc::now().to_rfc3339(),
            };

            s.controllers.push(controller.clone());
            s.paired = true;
            s.pairing_code = None;

            // 🔒 Persist pairing + controllers
            persist_state(&store, &s);

            // Stop mDNS
            if let Some(handle) = mdns.lock().unwrap().take() {
                handle.stop();
            }

            let _ = app.emit("device-state-updated", s.clone());

            (StatusCode::OK, Json(controller)).into_response()
        }
        _ => StatusCode::UNAUTHORIZED.into_response(),
    }
}
