// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod device_state;
mod mdns;

use device_state::DeviceState;
use mdns::MdnsHandle;

use std::sync::{Arc, Mutex};


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let device_state = Arc::new(Mutex::new(DeviceState::new()));
    let _mdns_handle = {
        let state = device_state.lock().unwrap();
        if !state.paired {
            Some(MdnsHandle::start(&state))
        } else {
            None
        }
    };
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .manage(device_state)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
