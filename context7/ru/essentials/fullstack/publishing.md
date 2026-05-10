---
title: Публикация
---

## Публикация с помощью Github Pages

Вы можете использовать Dioxus Fullstack для предварительного рендеринга вашего приложения, а затем гидратировать его на клиенте. Это хорошо работает со страницами, размещёнными статически на провайдерах вроде Github Pages. На самом деле, официальный сайт Dioxus использует этот подход.

Вы можете настроить ваше приложение для статической генерации всех статических страниц:

```rust
! Run with:
!
! ```sh
//! dioxus build --features web
//! cargo run --features ssr
//! ```

#![allow(non_snake_case, unused)]
use dioxus::prelude::*;
use dioxus_fullstack::{launch, prelude::*};
use serde::{Deserialize, Serialize};

// Generate all routes and output them to the docs path
#[cfg(feature = "ssr")]
#[tokio::main]
async fn main() {
    pre_cache_static_routes_with_props(
        &ServeConfigBuilder::new_with_router(dioxus_fullstack::router::FullstackRouterConfig::<
            Route,
        >::default())
        .assets_path("docs")
        .incremental(IncrementalRendererConfig::default().static_dir("docs"))
        .build(),
    )
    .await
    .unwrap();
}

// Hydrate the page
#[cfg(feature = "web")]
fn main() {
    dioxus_web::launch_with_props(
        dioxus_fullstack::router::RouteWithCfg::<Route>,
        dioxus_fullstack::prelude::get_root_props_from_document()
            .expect("Failed to get root props from document"),
        dioxus_web::Config::default().hydrate(true),
    );
}

#[derive(Clone, Routable, Debug, PartialEq, Serialize, Deserialize)]
enum Route {
    #[route("/")]
    Home {},
    #[route("/blog")]
    Blog,
}

#[component]
fn Blog() -> Element {
    rsx! {
        Link { to: Route::Home {}, "Go to counter" }
        table {
            tbody {
                for _ in 0..100 {
                    tr {
                        for _ in 0..100 {
                            td { "hello world!" }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn Home() -> Element {
    let mut count = use_signal(|| 0);
    let text = use_signal(|| "...".to_string());

    rsx! {
        Link { to: Route::Blog {}, "Go to blog" }
        div {
            h1 { "High-Five counter: {count}" }
            button { onclick: move |_| count += 1, "Up high!" }
            button { onclick: move |_| count -= 1, "Down low!" }
        }
    }
}
```

Далее отредактируйте ваш `Dioxus.toml`, чтобы направить `out_dir` в папку `docs` и `base_path` в имя вашего репозитория:

```toml
[application]
# ...
out_dir = "docs"

[web.app]
base_path = "your_repo"
```

Затем соберите ваше приложение и опубликуйте его на GitHub:

- Убедитесь, что GitHub Pages настроен для вашего репозитория для публикации любых статических файлов в директории docs
- Соберите ваше приложение с помощью:
```sh
dx build --release --features web
cargo run --features ssr
```
- Добавьте и зафиксируйте с помощью git
- Отправьте на GitHub
