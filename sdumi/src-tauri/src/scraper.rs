// Local scraper for my.sdu.edu.kz.
//
// SAFE BY DESIGN: this runs entirely on the student's machine. The password and
// 2FA code are passed in from the app only to perform the login POSTs — they are
// never persisted here and never sent anywhere except SDU's own endpoints. The
// authenticated session cookie lives in this process's in-memory cookie jar and
// the fetched HTML is returned to the local frontend.

use std::sync::Mutex;

const BASE: &str = "https://my.sdu.edu.kz";

/// Managed Tauri state: one HTTP client with an in-memory cookie jar, reused
/// across commands so the authenticated session persists.
pub struct SduState {
    client: reqwest::Client,
    logged_in: Mutex<bool>,
}

impl SduState {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .cookie_store(true)
            .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) SDUmi")
            .build()
            .expect("failed to build reqwest client");
        SduState {
            client,
            logged_in: Mutex::new(false),
        }
    }
}

impl Default for SduState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(serde::Serialize)]
pub struct LoginResult {
    /// "ok" (fully signed in), "otp" (2FA code required), or "invalid".
    status: String,
    /// The 2FA page HTML when status == "otp", so the frontend can parse the
    /// code form; empty otherwise.
    html: String,
}

#[derive(serde::Serialize)]
pub struct PostResult {
    html: String,
    authenticated: bool,
}

fn looks_authenticated(html: &str) -> bool {
    let authed = html.contains("Last Login")
        || html.contains("mod=schedule")
        || html.contains("mod=transkript")
        || html.to_lowercase().contains("logout");
    let is_login_page = html.contains("loginAuth.php") && html.contains("name=\"password\"");
    authed && !is_login_page
}

/// Decide which login stage a response HTML represents.
fn detect_stage(html: &str) -> &'static str {
    if looks_authenticated(html) {
        return "ok";
    }
    let low = html.to_lowercase();
    let has_password = low.contains("type=\"password\"") || low.contains("name=\"password\"");
    let mentions_code = low.contains("verif")
        || low.contains("otp")
        || low.contains("one-time")
        || low.contains("код")
        || low.contains("e-mail")
        || low.contains("authenticat")
        || low.contains("6-digit")
        || low.contains("6 digit");
    if mentions_code && !has_password {
        return "otp";
    }
    "invalid"
}

/// Step 1: submit credentials. Returns status "ok" | "otp" | "invalid".
#[tauri::command]
pub async fn sdu_login(
    state: tauri::State<'_, SduState>,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    // Prime the session cookie by loading the login page first.
    state
        .client
        .get(format!("{BASE}/"))
        .send()
        .await
        .map_err(|e| format!("network error: {e}"))?;

    let params = [
        ("username", username.as_str()),
        ("password", password.as_str()),
        ("modstring", ""),
        ("LogIn", "Log in"),
    ];

    let body = state
        .client
        .post(format!("{BASE}/loginAuth.php"))
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("login request failed: {e}"))?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    let stage = detect_stage(&body);
    *state.logged_in.lock().unwrap() = stage == "ok";
    let html = if stage == "otp" { body } else { String::new() };
    Ok(LoginResult {
        status: stage.to_string(),
        html,
    })
}

/// Generic authenticated POST used to drive multi-step flows (e.g. submitting
/// the 2FA code, or picking a term). `url` may be absolute or relative to BASE.
/// `fields` is an ordered list of form key/value pairs.
#[tauri::command]
pub async fn sdu_post(
    state: tauri::State<'_, SduState>,
    url: String,
    fields: Vec<(String, String)>,
) -> Result<PostResult, String> {
    let full = if url.starts_with("http") {
        url
    } else {
        format!("{BASE}/{}", url.trim_start_matches('/'))
    };
    let html = state
        .client
        .post(full)
        .form(&fields)
        .send()
        .await
        .map_err(|e| format!("post failed: {e}"))?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    let authenticated = looks_authenticated(&html);
    if authenticated {
        *state.logged_in.lock().unwrap() = true;
    }
    Ok(PostResult {
        html,
        authenticated,
    })
}

/// Fetch a SIS module page as raw HTML (e.g. module = "schedule", "grades",
/// "transkript", "ejurnal", or "" for the home page).
#[tauri::command]
pub async fn sdu_fetch(
    state: tauri::State<'_, SduState>,
    module: String,
) -> Result<String, String> {
    {
        if !*state.logged_in.lock().unwrap() {
            return Err("not signed in".into());
        }
    }
    let url = if module.is_empty() {
        format!("{BASE}/index.php")
    } else {
        format!("{BASE}/index.php?mod={module}")
    };
    let res = state
        .client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("fetch failed: {e}"))?;
    res.text().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn sdu_is_logged_in(state: tauri::State<'_, SduState>) -> Result<bool, String> {
    let v = *state.logged_in.lock().unwrap();
    Ok(v)
}

#[tauri::command]
pub async fn sdu_logout(state: tauri::State<'_, SduState>) -> Result<(), String> {
    *state.logged_in.lock().unwrap() = false;
    let _ = state.client.get(format!("{BASE}/logout.php")).send().await;
    Ok(())
}
