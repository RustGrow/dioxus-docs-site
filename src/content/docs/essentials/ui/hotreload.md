---
title: Hot-Reload
---

# Dioxus Hot-Reloading Reference

The Dioxus Hot-Reload engine is incredibly powerful. When used properly, it provides the fastest development experience for building apps with Rust.

> Dioxus 0.5 featured a limited form of hot-reloading, while Dioxus 0.6 drastically improved it.
>
> **Dioxus 0.7 introduces experimental Rust hot-reloading**, making it the first Rust framework to support hot-reloading of actual Rust code. 🎉🎉

Dioxus provides three forms of hotreloading.

*Element hot-reloading:*

<video src="/assets/07/dog_app_hotreload.mp4" controls></video>

*Asset hot-reloading:*

<video src="/assets/07/css-hotreload.mp4" controls></video>

*Rust hot-reloading:*

<video src="/assets/07/subsecond-tui.mp4" controls></video>

We provide this text guide as a resource for the details of hot-reloading. This guide has an accompanying video as well:

<iframe style="width: 100%" height="500px" class="centered-overflow" src="https://www.youtube.com/embed/Q4Xzz8OJEoc" title="Dioxus 0.6" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## RSX Hot-Reload

RSX hot-reloading is fundamental to the Dioxus development experience. It allows you to modify the structure, styling, and content of your user interface without recompiling your entire application.

RSX hot-reload enables you to instantly add, remove, or modify an elements in an `rsx!` block. The RSX parser works both at compile time, and in our devtools, letting DX sidestep recompiling your Rust code entirely.

```rust
fn App() -> Element {
    rsx! {
        // You can add, remove, or modify any elements
        div { class: "container" }
        h1 { "My App" }
        button { "Click me" }
    }
}
```

All string-based attributes support instant hot-reloading:
```rust
fn Button() -> Element {
    rsx! {
        button {
            // All of these can be hot-reloaded instantly
            class: "btn btn-primary",
            id: "my-button",
            title: "Click this button",
            style: "background: blue; color: white;",

            "Submit"
        }
    }
}
```

Hot-reload supports modifying complex formatted strings anywhere in your RSX. While you cannot instantly hot-reload the interior Rust expressions, you *can* move existing expressions between formatted strings.

```rust
fn Counter() -> Element {
    let count = use_signal(|| 0);

    rsx! {
        div {
            // We can move this `count` variable from here
            "Count: {count}"

            button {
                // ... to here, without a recompile!
                "Increment ({count})"
            }
        }
    }
}
```

You can hot-reload simple Rust expressions passed as component props. If the attribute value is a [Rust "literal"](https://doc.rust-lang.org/reference/expressions/literal-expr.html) - a single "token" like a number, boolean, or string - DX will hot-reload it by re-parsing the new attribute and modifying the component's props in place.

```rust
fn App() -> Element {
    rsx! {
        MyButton {
            text: "Click me", // try changing the text
            enabled: true, // try changing true to false!
            count: 123, // or changing the number value!
        }
    }
}

#[component]
fn MyButton(text: String, enabled: bool, count: i32, color: String) -> Element {
    rsx! {
        button { disabled: !enabled, "{text} - {count}" }
    }
}
```

Hot-reloading works inside conditional blocks, loops, and component children. Note that the interior *expressions* don't support instant RSX hot-reload, but the interior *elements* and *markup* do.

```rust
fn TodoList() -> Element {
    let todos = use_signal(|| vec!["Learn Dioxus", "Build an app"]);

    rsx! {
        ul {
            // We can modify the *body*
            for (i, todo) in todos().iter().enumerate() {
                li {
                    key: "{i}",
                    class: "todo-item",
                    "{todo}"
                }
            }
        }

        // Conditional blocks bodies are hot-reloadable too
        if todos().len() > 5 {
            div { class: "warning", "You have many todos!" }
        }
    }
}
```

## What Requires a Full Rebuild (or a hot-patch!)

While RSX hot-reloading is very capable, some changes still require a full application rebuild:

- **New variables or expressions** not present in the last compilation.
- **Logic changes** outside of RSX (function bodies, hooks, etc.).
- **Component signatures** (adding/removing props).
- **Import statements** and module structure.
- **Complex Rust expressions** in attributes that involve function calls.

When Rust hotpatching is enabled with the `--hotpatch` flag, DX will modify your app's assembly *in place* and not require a full rebuild. With hotpatching enabled, DX rarely issues full rebuilds. You can manually force a full rebuild of your app at any time by pressing the `r` key with the DX TUI open.


## Experimental: Rust Hot-patching

**New in Dioxus 0.7**, you can enable experimental Rust code hot-reloading using the `--hotpatch` flag. This feature is revolutionary - allowing you to modify Rust logic and see changes without rebuilding.

To use Rust hot-reloading, run `dx serve --hotpatch`. The extra flag is required while hot-patching is still experimental, though we plan to make it default in the future.

```bash
dx serve --hotpatch
```

This system, named **Subsecond**, can reload most changes to Rust code. However, there are a few limitations:

- You may add new globals at runtime, but their destructors will never be called.
- Globals are tracked across patches, but will renames are observed as introducing a new global.
- Changes to static initializers will not be observed.

Also, most importantly, Rust hot-patching currently only tracks the "tip" crate in your project. If you edit code in any of your dependencies - which might be *your* crate in a workspace - DX does *not* register that change. While RSX hot-reloading works across a workspace, Subsecond currently does not.

Subsecond also works outside Dioxus. Many projects have already adopted the Subsecond library for Rust hot-reloading. For example, Bevy and Iced already have Subsecond integrations:

<video src="/assets/07/bevy-hotpatch.mp4" controls></video>

### Subsecond API Overview

Subsecond is a standalone hot-reloading library for Rust. It provides a simple API for making any function hot-reloadable.

For library authors, you can use "hot" functions with `subsecond::current`:

```rust
/// A user-facing tick / launch / start function
pub fn tick(handler: Fn(Request) -> Response) {
    // Create a "hot" function that we can inspect
    let hot_fn = subsecond::current(handler);

    // Check if this function has been patched
    if hot_fn.changed() {
        // do thing
    }

    // Register a handler to be called when the function is patched
    hot_fn.on_changed(|| /* do thing */);

    // Call the hot function
    hot_fn.call((request))
}
```

For application authors, you can use `subsecond::call()` to make a function hot-reloadable:

```rust
fn handle_request(request: Request) -> Response {
    subsecond::call(|| {
        // do_thing...
    })
}
```

If a hot function is actively being called, Subsecond will rewind the stack to the "cleanest" entrypoint. For example, a hot-reloadable server will have two "hot" points: at the start of the server, and at the start of the request handler. When the server is reloaded, Subsecond will rewind the stack to the first hot point, and then call the function again.

```rust
// Changes to `serve` will reload the server
fn serve() {
    let router = Router::new();
    router.get("/", handle_request);
    router.serve("0.0.0.0:8080");
}

// Changes below "handle_request" won't reload the router
fn handle_request(request: Request) -> Response {
    // do thing
}
```

Framework authors can interleave their own hot-reload entrypoints alongside user code. This lets you add new anchors into long-running stateful code:

```rust
fn main() {
    // serve is "hot" and will rebuild the router if it changes
    webserver::serve("0.0.0.0:8080", || {
        Router::new()
            // get is "hot" and changes to handle_request won't rebuild the router
            .get("/", |req| Response::websocket(handle_socket))
    })
}

fn handle_socket(ws: &WebSocket) {
    subsecond::call(|| {
        // do things with the websocket
    })
}
```

## Asset Hot-Reload

Asset hot-reloading allows you to modify CSS, images, and other static files without rebuilding your application. This works seamlessly with the `asset!()` macro system.

### CSS Hot-Reloading

CSS files are automatically watched and hot-reloaded when changed:

```rust
fn App() -> Element {
    rsx! {
        // Editing this stylesheet will cause instant updates in the running app
        Stylesheet { href: asset!("/assets/main.css") }
        div { class: "my-component", "Hello World!" }
    }
}
```

```css
/* In assets/main.css - changes here are instantly applied */
.my-component {
    background: blue;
    color: white;
    padding: 20px;
    /* Change this to red and see instant updates! */
}
```

SCSS files are automatically re-compiled on changes and the generated CSS will be hot-reloaded.

### Image and Static Asset Hot-Reloading

Static assets like images also support hot-reloading:

```rust
fn Header() -> Element {
    rsx! {
        img { src: asset!("/assets/logo.png") }
    }
}
```

When you edit `/assets/logo.png`, the change appears instantly in your running application.

### Tailwind CSS Integration

When you `serve` your app, DX automatically downloads and starts the Tailwind CLI in the background. If a `tailwind.css` file is detected in the project root, the Tailwind watcher will watch your Rust code for changes and then recompile the output `/assets/tailwind.css` file.

<video src="/assets/07/tailwind-inline.mp4" controls></video>

You can manually customize the Tailwind input and output file locations using the `tailwind_input` and `tailwind_output` configuration fields in your project's Dioxus.toml.

