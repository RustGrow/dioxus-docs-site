---
title: Desktop
---

# Desktop

This guide will cover concepts specific to the Dioxus desktop renderer.

Apps built with Dioxus desktop use the system WebView to render the page. This makes the final size of application much smaller than other WebView renderers (typically under 5MB).

Although desktop apps are rendered in a WebView, your Rust code runs natively. This means that browser APIs are _not_ available, so rendering WebGL, Canvas, etc is not as easy as the Web. However, native system APIs _are_ accessible, so streaming, WebSockets, the filesystem, etc are all easily accessible though system APIs.

Dioxus desktop is built on top of [wry](https://github.com/tauri-apps/wry), a Rust library for creating desktop applications with a WebView.

> In the future, we plan to move to a custom web renderer-based DOM renderer with WGPU integrations ([Blitz](https://github.com/DioxusLabs/blitz)).

## Examples

- [File Explorer](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/file-explorer#readme)
- [Tailwind App](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind#readme)

[![Tailwind App screenshot](/assets/static/tailwind_desktop_app.png)](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind#readme)

## Running Javascript

Dioxus provides the `document::eval` function to execute JavaScript code in your application. See the [JavaScript Interop guide](../../guides/utilities/eval.md) for more information.

## Custom Assets

You can link to local assets in dioxus desktop instead of using a url:

```rust
use dioxus::prelude::*;

fn main() {
    launch(app);
}

fn app() -> Element {
    rsx! {
        div {
            img { src: asset!("/assets/static/scanner.png") }
        }
    }
}
```

## File Dialogs

As of Dioxus 0.7.1, file dialogs on desktop are **async** instead of sync. This prevents the UI from freezing during file selection:

```rust
use dioxus::prelude::*;

fn app() -> Element {
    let mut file_content = use_signal(|| String::new());

    rsx! {
        button {
            onclick: move |_| async move {
                if let Some(path) = rfd::AsyncFileDialog::new().pick_file().await {
                    if let Ok(content) = tokio::fs::read_to_string(path.path()).await {
                        file_content.set(content);
                    }
                }
            },
            "Pick a file"
        }
        pre { "{file_content}" }
    }
}
```

> **Note:** File dialogs require a fallback like `zenity` on Linux if `rfd` cannot find a native dialog implementation.

## Integrating with Wry

In cases where you need more low level control over your window, you can use wry APIs exposed through the [Desktop Config](https://docs.rs/dioxus-desktop/latest/dioxus_desktop/struct.Config.html) and the [use_window hook](https://docs.rs/dioxus-desktop/latest/dioxus_desktop/fn.use_window.html)


