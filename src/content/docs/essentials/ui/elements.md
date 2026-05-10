---
title: Elements and Text
---

# Elements and Text

User interfaces are assembled by combining text and UI elements together in a useful and visually appealing tree. An example of some text and elements with RSX may look like:

```rust
let author = "Dioxus Labs";
let content = "Build cool things ✌️";

rsx! {
    h1 { "Welcome to Dioxus!" }
    h3 { "Brought to you by {author}" }
    p { class: "main-content", {content} }
}
```

## Text Nodes

Any content surrounded by quotes is rendered as a text node in RSX:

```rust
rsx! { "Hello world" }
```


Text nodes in Dioxus automatically implement the same rules as Rust's [`format!`](https://doc.rust-lang.org/std/macro.format.html) macro, including [Display](https://doc.rust-lang.org/std/fmt/trait.Display.html) and [Debug](https://doc.rust-lang.org/std/fmt/trait.Debug.html) printing.

```rust
let world = "earth";
rsx! { "Hello {world}!" }
```


Unlike Rust's format macro, `rsx!` lets us embed entire Rust expressions which can be quite handy when working with complex objects or calling functions inline.

```rust
let user = use_signal(|| User {
        name: "Dioxus".to_string(),
    });
    rsx! { "Hello {user.read().name}" }
```


## Elements

The most basic building block of HTML is an element. In RSX, an element is declared with a name and then curly braces. One of the most common elements is the `input` element. The input element creates an interactive input box:

```rust
rsx! {
    input {}
}
```

Elements can take additional parameters called attributes that modify how the element is rendered. Attributes are added inline, similar to adding fields to a struct instantiation:

```rust
rsx! {
    input { placeholder: "type something cool!" }
}
```

There are a huge number of HTML elements available, including, but not limited to:

- Text and Content: `p`, `h1`, `span`, `div`, `a`, `pre`, etc.
- Forms and Input: `form`, `input`, `textarea`, `select`, `button`, etc.
- Media and Content: `img`, `video`, `audio`, `source`, `canvas`, `svg`, `iframe`, etc.
- Tables: `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, etc.
- Semantic Elements: `details`, `summary`, `dialog`, `progress`, `meter`, `time`, etc.

Check the [HTML Element reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) for the full list.

## Placeholders

Input elements can have placeholders to display a hint when the field is empty:

```rust
rsx! {
    input { placeholder: "type something cool!" }
}
```

## The `Element` type

The `rsx!` macro returns an object with the type of `Element`. These objects can be assigned to variables, cheaply cloned, and stored in state.

```rust
let header: Element = rsx! {
    div {
        h1 { "Dioxus!" }
    }
}
```

We can even create functions that return an `Element`:

```rust
fn create_description(content: &str) -> Element {
    rsx! {
        span { class: "description", "{content}" }
    }
}
```

Under the hood, the `Element` type is actually an alias for `Result<VNode>`. In Rust, a [Result](https://doc.rust-lang.org/std/result/) is an enumerated value that can either be an `Ok(value)` or an `Err(error)`. This means we can match on an Element, or even throw errors while rendering it:

```rust
fn create_description(content: &str) -> Element {
    if content.is_empty() {
        return Err("Missing description".into());
    }

    rsx! {
        span { class: "description", "{content}" }
    }
}
```

Dioxus defines its own error based on the [`anyhow`](https://docs.rs/anyhow/latest/anyhow/) error which then composes with other utilities like Error Boundaries and Server Functions.

## Custom Elements and Namespaces

The Dioxus `rsx!` macro can accept any compile-time correct namespace. The `dioxus-html` crate provides the HTML (and SVG) namespaces which get imported in the Dioxus prelude. However, this abstraction enables you to add any namespace of elements, provided they're in scope when `rsx!` is called.

Elements for Dioxus must implement the `DioxusElement` trait to be used in the `rsx!` macro:

```rust ignore
struct div;
impl DioxusElement for div {
    const TAG_NAME: &'static str = "div";
    const NAME_SPACE: Option<&'static str> = None;
}
```

All elements should be defined as a zero-sized struct (unit struct). These structs are zero-cost and just provide the type-level trickery to Rust for compile-time correct templates. Attributes are then implemented as constants on these unit structs.

### Extending the HTML Namespace

Whenever the `rsx!` macro is called, it relies on a module `dioxus_elements` to be in scope. When you enable the `html` feature in Dioxus, this module gets imported in the prelude. However, you can extend this with your own set of custom elements by making your own `dioxus_elements` module and re-exporting the HTML namespace:

```rust ignore
mod dioxus_elements {
    use dioxus::prelude::dioxus_elements::*;
    struct my_element;
    impl DioxusElement for my_element {
        const TAG_NAME: &'static str = "my-element";
        const NAME_SPACE: Option<&'static str> = None;
    }
}
```

This is currently a not-very-explored part of Dioxus. However, the namespacing system does make it possible to provide syntax highlighting, documentation, "go to definition" and compile-time correctness, so it's worth having it abstracted.

