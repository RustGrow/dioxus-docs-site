---
title: Dioxus Documentation
description: Documentation for Dioxus 0.7 — a Rust framework for building cross-platform apps.
---

# Dioxus Documentation

Welcome to the Dioxus documentation! Dioxus is a framework for building cross-platform apps with the Rust programming language. With one codebase, you can build apps that run on web, desktop, and mobile platforms.

## What is Dioxus?

Dioxus is a Rust UI framework that makes it easy to build beautiful, interactive user interfaces. It uses a React-like component model with RSX (a JSX-like syntax for Rust) and supports:

- **Web apps** — Compile to WASM and run in the browser
- **Desktop apps** — Native desktop applications using WebView or WGPU
- **Mobile apps** — iOS and Android applications
- **Fullstack** — Server-side rendering with server functions
- **LiveView** — Real-time server-rendered UIs

## Quick Links

- [Getting Started](/getting-started/welcome) — Learn the basics and set up your first Dioxus app
- [Tutorial](/tutorial/overview) — Build a complete app step by step
- [Core Concepts](/essentials/ui/rsx) — Dive deep into UI, state, routing, and more
- [API Reference](/guides/tools/creating) — Explore the full API

## Example

```rust
use dioxus::prelude::*;

fn main() {
    launch(app);
}

fn app() -> Element {
    let mut count = use_signal(|| 0);

    rsx! {
        h1 { "High-Five counter: {count}" }
        button { onclick: move |_| count += 1, "Up high!" }
        button { onclick: move |_| count -= 1, "Down low!" }
    }
}
```

## Community

- [Discord](https://discord.gg/XgGxMSkvUM)
- [GitHub](https://github.com/DioxusLabs/dioxus)
- [Crates.io](https://crates.io/crates/dioxus)
