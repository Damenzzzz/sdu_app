// Local scraper for my.sdu.edu.kz.
//
// SAFE BY DESIGN: this runs entirely on the student's machine. The password is
// passed in from the app (backed by the OS secure store) only to perform the
// login POST — it is never persisted here and never sent anywhere except SDU's
// own login endpoint. The authenticated session cookie lives in this process's
// in-memory cookie jar and the fetched HTML is returned to the local frontend.

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

fn looks_authenticated(html: &str) -> bool {
    // The logged-in dashboard exposes module links and a "Last Login" banner.
    let authed = html.contains("Last Login")
        || html.contains("mod=schedule")
        || html.contains("mod=transkript")
        || html.to_lowercase().contains("logout");
    // The login page renders the credential form posting to loginAuth.php.
    let is_login_page = html.contains("loginAuth.php") && html.contains("name=\"password\"");
    authed && !is_login_page
}

/// Attempt to log in. Returns Ok(true) on success, Ok(false) on bad credentials.
#[tauri::command]
pub async fn sdu_login(
    state: tauri::State<'_, SduState>,
    username: String,
    password: String,
) -> Result<bool, String> {
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

    let res = state
        .client
        .post(format!("{BASE}/loginAuth.php"))
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("login request failed: {e}"))?;

    let body = res.text().await.map_err(|e| e.to_string())?;

    // Some deployments answer the POST with a redirect to index.php that is
    // followed automatically; others return a thin page. Confirm by loading the
    // home page and checking for the authenticated markers.
    let home = state
        .client
        .get(format!("{BASE}/index.php"))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    let success = looks_authenticated(&body) || looks_authenticated(&home);
    *state.logged_in.lock().unwrap() = success;
    Ok(success)
}

/// Fetch a SIS module page as raw HTML (e.g. module = "schedule", "grades",
/// "transkript", "ejurnal", or "" for the home page).
#[tauri::command]
pub async fn sdu_fetch(
    state: tauri::State<'_, SduState>,
    module: String,
) -> Result<String, String> {
    {
        // Scope the guard so it is released before any await point.
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

/// Whether the in-memory session is currently authenticated.
#[tauri::command]
pub async fn sdu_is_logged_in(state: tauri::State<'_, SduState>) -> Result<bool, String> {
    let v = *state.logged_in.lock().unwrap();
    Ok(v)
}

/// Clear the local session flag (best-effort server logout too).
#[tauri::command]
pub async fn sdu_logout(state: tauri::State<'_, SduState>) -> Result<(), String> {
    *state.logged_in.lock().unwrap() = false;
    let _ = state.client.get(format!("{BASE}/logout.php")).send().await;
    Ok(())
}
