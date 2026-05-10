---
title: SSR (низкоуровневый)
---

# Серверный рендеринг

Для низкоуровневого контроля над процессом рендеринга вы можете использовать крейт `dioxus-ssr` напрямую. Это может быть полезно при интеграции с веб-фреймворком, который не поддерживает `dioxus-fullstack`, или при предварительном рендеринге страниц.

## Настройка

В этом руководстве мы покажем, как использовать Dioxus SSR с [Axum](https://docs.rs/axum/latest/axum/).

Убедитесь, что у вас установлены Rust и Cargo, а затем создайте новый проект:

```sh
cargo new --bin demo
cd demo
```

Добавьте Dioxus и SSR-рендерер как зависимости:

```sh
cargo add dioxus
cargo add dioxus-ssr
```

Далее добавьте все зависимости Axum. Это будет отличаться, если вы используете другой веб-фреймворк

```
cargo add tokio --features full
cargo add axum
```

Ваши зависимости должны выглядеть примерно так:

```toml
[dependencies]
axum = "0.7"
dioxus = { version = "*" }
dioxus-ssr = { version = "*" }
tokio = { version = "1.15.0", features = ["full"] }
```

Теперь настройте ваше приложение Axum для ответа на endpoint.

```rust
use axum::{response::Html, routing::get, Router};
use dioxus::prelude::*;

#[tokio::main]
async fn main() {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("listening on http://127.0.0.1:3000");

    axum::serve(
        listener,
        Router::new()
            .route("/", get(app_endpoint))
            .into_make_service(),
    )
    .await
    .unwrap();
}
```

А затем добавьте наш endpoint. Мы можем либо рендерить `rsx!` напрямую:

```rust
async fn app_endpoint() -> Html<String> {
// render the rsx! macro to HTML
    Html(dioxus_ssr::render_element(rsx! { div { "hello world!" } }))
}
```

Или мы можем рендерить VirtualDoms.

```rust
async fn app_endpoint() -> Html<String> {
// create a component that renders a div with the text "hello world"
        fn app() -> Element {
            rsx! { div { "hello world" } }
        }
// create a VirtualDom with the app component
        let mut app = VirtualDom::new(app);
// rebuild the VirtualDom before rendering
        app.rebuild_in_place();

// render the VirtualDom to HTML
        Html(dioxus_ssr::render(&app))
    }
```

Наконец, вы можете запустить его с помощью `cargo run` вместо `dx serve`.

## Поддержка многопоточности

К сожалению, Dioxus VirtualDom в настоящее время не является `Send`. Внутри мы используем довольно много внутренней изменчивости, которая не является потокобезопасной.
При работе с веб-фреймворками, требующими `Send`, можно отрендерить VirtualDom немедленно в String — но вы не можете удерживать VirtualDom через await point. Для SSR с сохранением состояния (по сути, LiveView) вам нужно будет запустить VirtualDom в собственном потоке и общаться с ним через каналы или создать пул VirtualDoms.
Вы можете заметить, что не можете удерживать VirtualDom через await point. Поскольку Dioxus в настоящее время не является ThreadSafe, он _должен_ оставаться на том потоке, на котором был запущен. Мы работаем над ослаблением этого требования.
