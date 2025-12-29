use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Wry};
use uuid::Uuid;

use super::state::{
    PairedDevice,
    PairingRequest,
    PairingStatus,
    SharedPairingState,
};
use super::store::{load_pairings, save_pairings};

#[derive(Clone)]
pub struct PairingCtx {
    pub state: SharedPairingState,
    pub app: AppHandle<Wry>,
}

/* ---------------- DTOs ---------------- */

#[derive(Deserialize)]
pub struct StartPairingBody {
    pub device_name: String,
}

#[derive(Serialize)]
pub struct StartPairingResponse {
    pub pairing_id: String,
}

#[derive(Deserialize)]
pub struct StatusQuery {
    pub pairing_id: String,
}

#[derive(Serialize)]
pub struct PairingStatusResponse {
    pub status: PairingStatus,
    pub token: Option<String>,
}

#[derive(Deserialize)]
pub struct DecidePairingBody {
    pub pairing_id: String,
}

/* ---------------- Router ---------------- */

pub fn pairing_router(ctx: PairingCtx) -> Router {
    Router::new()
        .route("/pair/start", post(start_pairing))
        .route("/pair/status", get(pairing_status))
        .route("/pair/approve", post(approve_pairing))
        .route("/pair/deny", post(deny_pairing))
        .with_state(ctx)
}

/* ---------------- Handlers ---------------- */

async fn start_pairing(
    State(ctx): State<PairingCtx>,
    Json(body): Json<StartPairingBody>,
) -> Result<Json<StartPairingResponse>, StatusCode> {
    let mut state = ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if state.active.is_some() {
        let _ = ctx.app.emit("pairing:blocked", "Another device is pairing");
        return Err(StatusCode::CONFLICT);
    }

    let paired = load_pairings(&ctx.app);
    if paired.values().any(|d| d.device_name == body.device_name) {
        let _ = ctx.app.emit("pairing:already-paired", body.device_name);
        return Err(StatusCode::FORBIDDEN);
    }

    let id = Uuid::new_v4();
    let req = PairingRequest {
        id,
        device_name: body.device_name,
        status: PairingStatus::Pending,
        token: None,
        created_at: Utc::now(),
    };

    state.active = Some(id);
    state.requests.insert(id, req.clone());

    let _ = ctx.app.emit("pairing:request", req);

    Ok(Json(StartPairingResponse {
        pairing_id: id.to_string(),
    }))
}

async fn pairing_status(
    State(ctx): State<PairingCtx>,
    Query(q): Query<StatusQuery>,
) -> Result<Json<PairingStatusResponse>, StatusCode> {
    let id = Uuid::parse_str(&q.pairing_id).map_err(|_| StatusCode::BAD_REQUEST)?;
    let state = ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let req = state.requests.get(&id).ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(PairingStatusResponse {
        status: req.status.clone(),
        token: req.token.clone(),
    }))
}

async fn approve_pairing(
    State(ctx): State<PairingCtx>,
    Json(body): Json<DecidePairingBody>,
) -> Result<(), StatusCode> {
    let id = Uuid::parse_str(&body.pairing_id).map_err(|_| StatusCode::BAD_REQUEST)?;
    let mut state = ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut req = state.requests.get(&id).cloned().ok_or(StatusCode::NOT_FOUND)?;

    let token = format!("hub-token-{}", Uuid::new_v4());
    req.status = PairingStatus::Approved;
    req.token = Some(token.clone());

    state.requests.insert(id, req.clone());
    state.active = None;

    let mut devices = load_pairings(&ctx.app);
    devices.insert(
        id.to_string(),
        PairedDevice {
            device_id: id.to_string(),
            device_name: req.device_name.clone(),
            token,
            paired_at: Utc::now(),
        },
    );
    save_pairings(&ctx.app, &devices);

    let _ = ctx.app.emit("pairing:updated", req);
    Ok(())
}

async fn deny_pairing(
    State(ctx): State<PairingCtx>,
    Json(body): Json<DecidePairingBody>,
) -> Result<(), StatusCode> {
    let id = Uuid::parse_str(&body.pairing_id).map_err(|_| StatusCode::BAD_REQUEST)?;
    let mut state = ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut req = state.requests.get(&id).cloned().ok_or(StatusCode::NOT_FOUND)?;
    req.status = PairingStatus::Denied;
    req.token = None;

    state.requests.insert(id, req.clone());
    state.active = None;

    let _ = ctx.app.emit("pairing:updated", req);
    Ok(())
}
