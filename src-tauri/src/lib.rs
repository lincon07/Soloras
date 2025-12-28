// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// 1️⃣ Declare modules FIRST
pub mod discovery;
pub mod pairing;

// 2️⃣ Imports AFTER modules
use axum::Router;
use tauri::Manager;

use discovery::udp::start_udp_discovery;
use crate::pairing::routes::{pairing_router, PairingCtx};
use crate::pairing::state::new_pairing_state;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // -------------------------------
            // Hub identity
            // -------------------------------
            let hub_id = "f9d1e6c3".to_string();
            let hub_name = "Living Room Hub".to_string();
            let api_port = 3000;

            let pairing_enabled = || true;

            // -------------------------------
            // UDP discovery (broadcast responder)
            // -------------------------------
            tauri::async_runtime::spawn(start_udp_discovery(
                hub_id,
                hub_name,
                api_port,
                pairing_enabled,
            ));

            // -------------------------------
            // Pairing state + Axum API
            // -------------------------------
            let app_handle = app.handle().clone();
            let pairing_state = new_pairing_state();

            let pair_ctx = PairingCtx {
                state: pairing_state.clone(),
                app: app_handle.clone(),
            };

            let api = Router::new()
                .merge(pairing_router(pair_ctx));
                // .merge(other_routes()) ← later

            // -------------------------------
            // Start Axum server (Hub API)
            // -------------------------------
            tauri::async_runtime::spawn(async move {
                let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 3000));
                let listener = tokio::net::TcpListener::bind(addr)
                    .await
                    .expect("failed to bind API port");

                axum::serve(listener, api)
                    .await
                    .expect("axum server crashed");
            });

            Ok(())
        })
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
