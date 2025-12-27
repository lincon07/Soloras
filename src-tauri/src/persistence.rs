use tauri::Wry;
use tauri_plugin_store::Store;
use serde_json::Value;

use crate::device_state::{DeviceState, Controller};

pub fn load_persisted_state(
    store: &Store<Wry>,
    state: &mut DeviceState,
) {
    if let Some(v) = store.get("paired").and_then(|v| v.as_bool()) {
        state.paired = v;
    }

    if let Some(v) = store.get("controllers") {
        if let Ok(controllers) = serde_json::from_value::<Vec<Controller>>(v) {
            state.controllers = controllers;
        }
    }
}

pub fn persist_state(
    store: &Store<Wry>,
    state: &DeviceState,
) {
    store.set("paired", Value::Bool(state.paired));
    store.set(
        "controllers",
        serde_json::to_value(&state.controllers).unwrap(),
    );
    let _ = store.save();
}
