mod device_state;
mod mdns;
mod pairing_server; // 👈 add this
mod persistence;


use std::sync::{Arc, Mutex};

use device_state::DeviceState;
use mdns::MdnsHandle;

use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_store::StoreBuilder;
use uuid::Uuid;

use pairing_server::{
    start_pairing_server,
    start_pairing_mode,
    stop_pairing,
    list_controllers,
    set_device_name,
};

use crate::persistence::load_persisted_state;

type MdnsOpt = Arc<Mutex<Option<MdnsHandle>>>;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn get_device_state(
    state: tauri::State<'_, Arc<Mutex<DeviceState>>>,
) -> DeviceState {
    state.lock().unwrap().clone()
}

fn emit_state(app: &tauri::AppHandle, state: &DeviceState) {
    let _ = app.emit("device-state-updated", state);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // Create store
let store = StoreBuilder::new(app, "device.json").build()?;
let _ = store.reload();

app.manage(store.clone());
            // Load or generate device_id
let device_id = match store.get("device_id") {
    Some(v) => v.as_str().unwrap().to_string(),
    None => {
        let id = uuid::Uuid::new_v4().to_string();
        store.set("device_id", id.clone());
        let _ = store.save();
        id
    }
};

let paired = store
    .get("paired")
    .and_then(|v| v.as_bool())
    .unwrap_or(false);

let controllers = store
    .get("controllers")
    .and_then(|v| serde_json::from_value(v.clone()).ok())
    .unwrap_or_else(|| vec![]);

let isPairing = store
    .get("isPairing")
    .and_then(|v| v.as_bool())
    .unwrap_or(false);

            // Initialize device state



let mut initial_state = DeviceState::new(device_id.clone());

// 🔑 LOAD paired + controllers
load_persisted_state(&store, &mut initial_state);

let device_state = Arc::new(Mutex::new(DeviceState {
    device_id,
    device_name: Some("Living Room Screen".to_string()),
    paired,
    pairing_code: None,
    controllers,
    isPairing,
}));

let mdns_handle: Arc<Mutex<Option<MdnsHandle>>> =
    Arc::new(Mutex::new(None));

      // Make state available to commands
            app.manage(device_state.clone());
            app.manage(mdns_handle.clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
    greet,
    get_device_state,
    start_pairing_mode,
    stop_pairing,
    list_controllers,
    set_device_name,
])

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
