---
title: Статическая генерация
---

# Статическая генерация

## Получение карты сайта

Трейт [`Routable`] включает связанную константу [`SITE_MAP`], которая содержит карту всех маршрутов в перечислении.

По умолчанию карта сайта представляет собой дерево типов маршрутов (статических или динамических), но её можно преобразовать в список отдельных маршрутов с помощью метода `.flatten()`.

## Генерация карты сайта

Для статического рендеринга страниц нам нужно расплющить дерево маршрутов и сгенерировать файл для каждого маршрута, содержащего только статические сегменты:

```rust
#![allow(non_snake_case)]

use dioxus::prelude::*;

use dioxus_ssr::incremental::{DefaultRenderer, IncrementalRendererConfig};

#[tokio::main]
async fn main() {
    let mut renderer = IncrementalRendererConfig::new()
        .static_dir("./static")
        .build();

    println!(
        "SITE MAP:\n{}",
        Route::SITE_MAP
            .iter()
            .flat_map(|route| route.flatten().into_iter())
            .map(|route| {
                route
                    .iter()
                    .map(|segment| segment.to_string())
                    .collect::<Vec<_>>()
                    .join("")
            })
            .collect::<Vec<_>>()
            .join("\n")
    );

    pre_cache_static_routes::<Route, _>(
        &mut renderer,
        &DefaultRenderer {
            before_body: r#"<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,
            // initial-scale=1.0">
            <title>Dioxus Application</title>
        </head>
        <body>"#
                .to_string(),
            after_body: r#"</body>
        </html>"#
                .to_string(),
        },
    )
    .await
    .unwrap();
}

#[component]
fn Blog() -> Element {
    rsx! { div { "Blog" } }
}

#[component]
fn Post(id: usize) -> Element {
    rsx! { div { "PostId: {id}" } }
}

#[component]
fn PostHome() -> Element {
    rsx! { div { "Post" } }
}

#[component]
fn Home() -> Element {
    rsx! { div { "Home" } }
}

#[rustfmt::skip]
#[derive(Clone, Debug, PartialEq, Routable)]
enum Route {
    #[nest("/blog")]
        #[route("/")]
        Blog {},
        #[route("/post/index")]
        PostHome {},
        #[route("/post/:id")]
        Post {
            id: usize,
        },
    #[end_nest]
    #[route("/")]
    Home {},
}
```

## Пример

- [examples/static-hydrated](https://github.com/DioxusLabs/dioxus/tree/v0.5/packages/fullstack/examples/static-hydrated)

[`Routable`]: https://docs.rs/dioxus-router/latest/dioxus_router/components/fn.Routable.html
