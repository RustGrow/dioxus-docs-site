---
title: Static Generation
---

# Static Generation

## Getting the Sitemap

The [`Routable`] trait includes an associated [`SITE_MAP`] constant that contains the map of all of the routes in the enum.

By default, the sitemap is a tree of (static or dynamic) RouteTypes, but it can be flattened into a list of individual routes with the `.flatten()` method.

## Generating a Sitemap

To statically render pages, we need to flatten the route tree and generate a file for each route that contains only static segments:

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
        // &mut renderer,
        &DefaultRenderer {
            before_body: r#"<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,
            initial-scale=1.0">
            // <title>Dioxus Application</title>
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

## Example

- [examples/static-hydrated](https://github.com/DioxusLabs/dioxus/tree/v0.5/packages/fullstack/examples/static-hydrated)

[`Routable`]: https://docs.rs/dioxus-router/latest/dioxus_router/components/fn.Routable.html

