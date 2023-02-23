use http::header::{HeaderName, USER_AGENT};
use http::{HeaderMap, HeaderValue, Method};
use reqwest::redirect::Policy;
use std::collections::HashMap;
use tauri::{AppHandle, Wry};

#[derive(serde::Serialize)]
pub struct CustomResponse {
    status: String,
    body: String,
    url: String,
    method: String,
    elapsed: u128,
    elapsed2: u128,
    headers: HashMap<String, String>,
}

#[tauri::command]
pub async fn send_request(
    app_handle: AppHandle<Wry>,
    url: &str,
    method: &str,
) -> Result<CustomResponse, String> {
    let start = std::time::Instant::now();

    let mut abs_url = url.to_string();
    if !abs_url.starts_with("http://") && !abs_url.starts_with("https://") {
        abs_url = format!("http://{}", url);
    }

    let client = reqwest::Client::builder()
        .redirect(Policy::none())
        .build()
        .unwrap();

    let mut headers = HeaderMap::new();
    // headers.insert(CONTENT_TYPE, HeaderValue::from_static("image/png"));
    headers.insert(USER_AGENT, HeaderValue::from_static("reqwest"));
    headers.insert("x-foo-bar", HeaderValue::from_static("hi mom"));
    headers.insert(
        HeaderName::from_static("x-api-key"),
        HeaderValue::from_static("123-123-123"),
    );

    let m = Method::from_bytes(method.to_uppercase().as_bytes()).unwrap();
    let req = client
        .request(m, abs_url.to_string())
        .headers(headers)
        .build();

    let req = match req {
        Ok(v) => v,
        Err(e) => {
            println!("Error: {}", e);
            return Err(e.to_string());
        }
    };

    let resp = client.execute(req).await;

    let elapsed = start.elapsed().as_millis();

    let p = app_handle
        .path_resolver()
        .resolve_resource("plugins/plugin.ts")
        .expect("failed to resolve resource");

    crate::runtime::run_plugin_sync(p.to_str().unwrap()).unwrap();

    match resp {
        Ok(v) => {
            let url = v.url().to_string();
            let status = v.status().to_string();
            let method = method.to_string();
            let headers = v
                .headers()
                .iter()
                .map(|(k, v)| (k.as_str().to_string(), v.to_str().unwrap().to_string()))
                .collect::<HashMap<String, String>>();
            let body = v.text().await.unwrap();
            let elapsed2 = start.elapsed().as_millis();
            Ok(CustomResponse {
                status,
                body,
                elapsed,
                elapsed2,
                method,
                url,
                headers,
            })
        }
        Err(e) => {
            println!("Error: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}