use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Wry};
use uuid::Uuid;

use super::state::{PairingRequest, PairingState, PairingStatus};

#[derive(Clone)]
pub struct PairingCtx {
    pub state: PairingState,
    pub app: AppHandle<Wry>,
}

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

/// Build a Router containing pairing routes.
pub fn pairing_router(ctx: PairingCtx) -> Router {
    Router::new()
        .route("/pair/start", post(start_pairing))
        .route("/pair/status", get(pairing_status))
        .route("/pair/approve", post(approve_pairing))
        .route("/pair/deny", post(deny_pairing))
        .with_state(ctx)
}

/// Mobile calls this to request pairing.
/// Hub will emit a Tauri event so the UI can show an approval dialog/screen.
async fn start_pairing(
    State(ctx): State<PairingCtx>,
    Json(body): Json<StartPairingBody>,
) -> Result<Json<StartPairingResponse>, StatusCode> {
    let id = Uuid::new_v4();

    let req = PairingRequest {
        id,
        device_name: body.device_name.clone(),
        status: PairingStatus::Pending,
        token: None,
    };

    ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .insert(id, req.clone());

    // Emit to Hub UI so it can show "Approve pairing?"
    let _ = ctx.app.emit("pairing:request", req);

    Ok(Json(StartPairingResponse {
        pairing_id: id.to_string(),
    }))
}

/// Mobile polls this until approved/denied.
async fn pairing_status(
    State(ctx): State<PairingCtx>,
    Query(q): Query<StatusQuery>,
) -> Result<Json<PairingStatusResponse>, StatusCode> {
    let id = Uuid::parse_str(&q.pairing_id).map_err(|_| StatusCode::BAD_REQUEST)?;

    let map = ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let Some(req) = map.get(&id) else {
        return Err(StatusCode::NOT_FOUND);
    };

    Ok(Json(PairingStatusResponse {
        status: req.status.clone(),
        token: req.token.clone(),
    }))
}

/// Hub UI calls this after user taps "Approve".
async fn approve_pairing(
    State(ctx): State<PairingCtx>,
    Json(body): Json<DecidePairingBody>,
) -> Result<(), StatusCode> {
    let id = Uuid::parse_str(&body.pairing_id).map_err(|_| StatusCode::BAD_REQUEST)?;

    let mut map = ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let Some(req) = map.get_mut(&id) else {
        return Err(StatusCode::NOT_FOUND);
    };

    req.status = PairingStatus::Approved;
    req.token = Some(format!("hub-token-{}", Uuid::new_v4()));

    let _ = ctx.app.emit("pairing:updated", req.clone());

    Ok(())
}

/// Hub UI calls this after user taps "Deny".
async fn deny_pairing(
    State(ctx): State<PairingCtx>,
    Json(body): Json<DecidePairingBody>,
) -> Result<(), StatusCode> {
    let id = Uuid::parse_str(&body.pairing_id).map_err(|_| StatusCode::BAD_REQUEST)?;

    let mut map = ctx.state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let Some(req) = map.get_mut(&id) else {
        return Err(StatusCode::NOT_FOUND);
    };

    req.status = PairingStatus::Denied;
    req.token = None;

    let _ = ctx.app.emit("pairing:updated", req.clone());

    Ok(())
}
