pub mod discovery;
pub mod pairing;
use tauri::Emitter;
use axum::Router;
use tauri::{AppHandle, Manager};

use discovery::udp::start_udp_discovery;
use pairing::routes::{pairing_router, PairingCtx};
use pairing::state::{new_pairing_state, SharedPairingState, PairingStatus};
use uuid::Uuid;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
async fn approve_pairing(
    app: AppHandle,
    pairing_id: String,
) -> Result<(), String> {
    let state = app.state::<SharedPairingState>();
    let mut map = state.lock().map_err(|_| "State poisoned")?;

    let id = Uuid::parse_str(&pairing_id).map_err(|_| "Invalid ID")?;
    let mut req = map.requests.get(&id).cloned().ok_or("Not found")?;

    req.status = PairingStatus::Approved;
    map.requests.insert(id, req.clone());
    map.active = None;

    let _ = app.emit("pairing:updated", req);
    Ok(())
}

#[tauri::command]
async fn deny_pairing(
    app: AppHandle,
    pairing_id: String,
) -> Result<(), String> {
    let state = app.state::<SharedPairingState>();
    let mut map = state.lock().map_err(|_| "State poisoned")?;

    let id = Uuid::parse_str(&pairing_id).map_err(|_| "Invalid ID")?;
    let mut req = map.requests.get(&id).cloned().ok_or("Not found")?;

    req.status = PairingStatus::Denied;
    map.requests.insert(id, req.clone());
    map.active = None;

    let _ = app.emit("pairing:updated", req);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let pairing_state = new_pairing_state();
            app.manage(pairing_state.clone());

            tauri::async_runtime::spawn(start_udp_discovery(
                "f9d1e6c3".into(),
                "Living Room Hub".into(),
                3000,
                || true,
            ));

            let api = Router::new().merge(pairing_router(PairingCtx {
                state: pairing_state,
                app: app.handle().clone(),
            }));

            tauri::async_runtime::spawn(async move {
                let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
                    .await
                    .unwrap();
                axum::serve(listener, api).await.unwrap();
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            approve_pairing,
            deny_pairing
        ])
        .run(tauri::generate_context!())
        .expect("error running app");
}
