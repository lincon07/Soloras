use std::{collections::HashMap, sync::Arc};

use tauri::{AppHandle, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

use super::state::PairedDevice;

const STORE_FILE: &str = "pairings.json";

fn open_store(app: &AppHandle<Wry>) -> Arc<Store<Wry>> {
    StoreBuilder::new(app, STORE_FILE)
        .build()
        .expect("failed to open pairing store")
}

pub fn load_pairings(
    app: &AppHandle<Wry>,
) -> HashMap<String, PairedDevice> {
    let store = open_store(app);

    store
        .get("paired_devices")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default()
}

pub fn save_pairings(
    app: &AppHandle<Wry>,
    devices: &HashMap<String, PairedDevice>,
) {
    let store = open_store(app);

    // set() returns ()
    store.set(
        "paired_devices",
        serde_json::to_value(devices).unwrap(),
    );

    // save() returns Result
    store.save().expect("failed to persist pairing store");
}
