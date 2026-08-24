mod scraper;

use scraper::SduState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .manage(SduState::new())
        .invoke_handler(tauri::generate_handler![
            scraper::sdu_login,
            scraper::sdu_post,
            scraper::sdu_fetch,
            scraper::sdu_fetch_b64,
            scraper::sdu_is_logged_in,
            scraper::sdu_logout,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
