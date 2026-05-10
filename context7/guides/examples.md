---
title: Examples
description: A collection of example apps and code snippets demonstrating Dioxus patterns.
---

# Examples

The Dioxus repository includes a variety of examples ranging from simple UI patterns to full applications. Each example is designed to demonstrate specific concepts and can be used as a starting point for your own projects.

You can find the source code for all examples in the [`dioxus-examples`](https://github.com/DioxusLabs/dioxus/tree/main/examples) directory of the Dioxus repository.

## App Demos

Complete applications demonstrating real-world patterns.

| Example | Description | Related Topics |
|---------|-------------|----------------|
| [Calculator](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/calculator.rs) | iOS-style calculator with signals and closures | [Signals](../essentials/basics/signals.md), [Event Handlers](../essentials/basics/event-handlers.md) |
| [Calculator (Mutable)](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/calculator_mutable.rs) | Calculator using a single struct for state | [State Management](../essentials/basics/hooks.md), [Collections](../essentials/basics/collections.md) |
| [Counters](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/counters.rs) | Multiple independent counters | [Signals](../essentials/basics/signals.md), [Components](../essentials/ui/components.md) |
| [CRM](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/crm.rs) | Customer relationship management UI | [Forms](../essentials/ui/elements.md), [Lists](../essentials/ui/iteration.md) |
| [Dog App](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/dog_app.rs) | Fetches dog breeds and images from an API | [Data Fetching](../essentials/basics/resources.md), [Async](../essentials/basics/async.md) |
| [Image Generator](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/image_generator_openai.rs) | OpenAI image generation integration | [Server Functions](../essentials/fullstack/server-functions.md), [Async](../essentials/basics/async.md) |
| [Repo Readme](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/repo_readme.rs) | GitHub README viewer | [Data Fetching](../essentials/basics/resources.md) |
| [TodoMVC](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/todomvc.rs) | Classic TodoMVC implementation | [State Management](../essentials/basics/hooks.md), [Collections](../essentials/basics/collections.md) |
| [TodoMVC Store](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/todomvc_store.rs) | TodoMVC with a global store pattern | [Global Context](../essentials/basics/context.md), [Stores](../essentials/basics/collections.md) |
| [Weather App](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/weather_app.rs) | Weather forecast viewer | [Data Fetching](../essentials/basics/resources.md), [Effects](../essentials/basics/effects.md) |
| [WebSocket Chat](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/websocket_chat.rs) | Real-time chat with WebSockets | [WebSockets](../essentials/fullstack/websockets.md), [Streams](../essentials/fullstack/streams.md) |

## Building UI

Patterns for constructing user interfaces with RSX.

| Example | Description | Related Topics |
|---------|-------------|----------------|
| [Checkbox & Radio](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/checkbox_radio.rs) | Form controls with state | [Event Handlers](../essentials/basics/event-handlers.md), [Forms](../essentials/ui/elements.md) |
| [Children](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/children.rs) | Passing children to components | [Components](../essentials/ui/components.md) |
| [Components](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/components.rs) | Defining and using components with props | [Components](../essentials/ui/components.md), [Props](../essentials/ui/components.md) |
| [Conditional Rendering](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/conditional_rendering.rs) | if/else and match in RSX | [Conditional Rendering](../essentials/ui/conditional.md) |
| [Counter](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/counter.rs) | Simple counter with signals | [Signals](../essentials/basics/signals.md) |
| [Disabled](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/disabled.rs) | Disabling elements conditionally | [Attributes](../essentials/ui/attributes.md) |
| [Dynamic Classes](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/dynamic_classes.rs) | Changing CSS classes at runtime | [Styling](../essentials/ui/styling.md), [Attributes](../essentials/ui/attributes.md) |
| [Event Handler Prop](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/event_handler_prop.rs) | Passing callbacks as props | [Event Handlers](../essentials/basics/event-handlers.md), [Components](../essentials/ui/components.md) |
| [Forms](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/forms.rs) | Form handling and validation | [Event Handlers](../essentials/basics/event-handlers.md), [Elements](../essentials/ui/elements.md) |
| [Inputs](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/inputs.rs) | Text inputs and controlled components | [Event Handlers](../essentials/basics/event-handlers.md) |
| [Lists](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/lists.rs) | Rendering lists with keys | [Lists](../essentials/ui/iteration.md) |
| [Nested Listeners](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/nested_listeners.rs) | Event bubbling and nested handlers | [Event Handlers](../essentials/basics/event-handlers.md) |
| [SVG](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/svg.rs) | Inline SVG rendering | [Elements](../essentials/ui/elements.md) |

## Assets & Styling

Working with CSS, images, fonts, and other assets.

| Example | Description | Related Topics |
|---------|-------------|----------------|
| [CSS Modules](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/css_modules.rs) | Scoped CSS with modules | [Styling](../essentials/ui/styling.md) |
| [Custom Assets](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/custom_assets.rs) | Loading images and files | [Assets](../essentials/ui/assets.md) |
| [Document Title](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/document_title.rs) | Changing the page title dynamically | [Head](../essentials/ui/head.md) |
| [Dynamic Assets](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/dynamic_assets.rs) | Switching assets at runtime | [Assets](../essentials/ui/assets.md) |
| [Dynamic Styles](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/dynamic_styles.rs) | Updating CSS dynamically | [Styling](../essentials/ui/styling.md) |
| [Favicon](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/favicon.rs) | Setting the page favicon | [Head](../essentials/ui/head.md) |
| [Fonts](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/fonts.rs) | Loading custom fonts | [Assets](../essentials/ui/assets.md), [Styling](../essentials/ui/styling.md) |
| [Inline Styles](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/inline_styles.rs) | Style attributes in RSX | [Styling](../essentials/ui/styling.md) |
| [Meta](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/meta.rs) | Meta tags for SEO | [Head](../essentials/ui/head.md) |
| [Script](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/script.rs) | Including external scripts | [Head](../essentials/ui/head.md), [JavaScript Interop](../guides/utilities/eval.md) |
| [Stylesheet](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/stylesheet.rs) | Loading CSS files | [Styling](../essentials/ui/styling.md), [Assets](../essentials/ui/assets.md) |

## Managing State

State management patterns with signals, hooks, and context.

| Example | Description | Related Topics |
|---------|-------------|----------------|
| [Context API](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/context_api.rs) | Sharing state via context | [Context](../essentials/basics/context.md) |
| [Custom Hook](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/custom_hook.rs) | Writing reusable hooks | [Custom Hooks](../essentials/advanced/custom-hooks.md) |
| [Error Handling](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/error_handling.rs) | Handling errors in components | [Error Handling](../essentials/basics/error-handling.md) |
| [Global](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/global.rs) | Global state with signals | [Global Context](../essentials/basics/context.md) |
| [Lifting State](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/lifting_state.rs) | Moving state up the tree | [Hoisting State](../essentials/basics/hoisting.md) |
| [Memo Chain](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/memo_chain.rs) | Chained computed values | [Effects and Memos](../essentials/basics/effects.md) |
| [Read Signal](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/read_signal.rs) | Read-only signals | [Signals](../essentials/basics/signals.md) |
| [Reducer](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/reducer.rs) | Redux-like reducer pattern | [State Management](../essentials/basics/hooks.md) |
| [Signals](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/signals.rs) | Core signal patterns | [Signals](../essentials/basics/signals.md), [Effects](../essentials/basics/effects.md) |
| [Struct Signal](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/struct_signal.rs) | Signals in structs | [Signals](../essentials/basics/signals.md) |
| [Use Effect](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_effect.rs) | Side effects with use_effect | [Effects and Memos](../essentials/basics/effects.md) |
| [Use Memo](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_memo.rs) | Memoized computations | [Effects and Memos](../essentials/basics/effects.md) |
| [Vec Signal](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/vec_signal.rs) | Signals with collections | [Collections](../essentials/basics/collections.md) |

## Routing

Router configuration and navigation patterns.

| Example | Description | Related Topics |
|---------|-------------|----------------|
| [Flat Router](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/flat_router.rs) | Simple flat route structure | [Defining Routes](../essentials/router/routes.md) |
| [Hash Fragment](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/hash_fragment_state.rs) | URL hash-based state | [Navigation](../essentials/router/navigation.md) |
| [Link](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/link.rs) | Navigation with Link component | [Navigation](../essentials/router/navigation.md) |
| [Query Segment](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/query_segment_search.rs) | Query parameters in routes | [Defining Routes](../essentials/router/routes.md) |
| [Router](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router.rs) | Advanced router with layouts | [Layouts](../essentials/router/layouts.md), [Nested Routes](../essentials/router/nested.md) |
| [Router Resource](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router_resource.rs) | Data fetching with routing | [Data Fetching](../essentials/basics/resources.md), [Navigation](../essentials/router/navigation.md) |
| [Restore Scroll](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router_restore_scroll.rs) | Restoring scroll position | [Navigation](../essentials/router/navigation.md) |
| [Simple Router](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/simple_router.rs) | Basic routing setup | [Introduction](../essentials/router/introduction.md) |

## Integrations

Third-party integrations and advanced setups.

| Example | Description | Related Topics |
|---------|-------------|----------------|
| [Native Headless](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/native-headless) | Headless native rendering | [Custom Renderer](../guides/utilities/custom-renderer.md) |
| [PWA](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/pwa) | Progressive Web App setup | [Deployment](../guides/deploy/index.md), [Web](../guides/platforms/web.md) |
| [Tailwind](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind) | TailwindCSS integration | [Tailwind](../guides/utilities/tailwind.md) |
| [WGPU Texture](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/wgpu-texture) | Custom WGPU rendering | [Custom Renderer](../guides/utilities/custom-renderer.md), [Desktop](../guides/platforms/desktop.md) |

## Running Examples

To run an example locally, clone the Dioxus repository and use `dx serve`:

```sh
git clone https://github.com/DioxusLabs/dioxus
cd dioxus/examples/01-app-demos
dx serve --example calculator
```

Or run directly with Cargo:

```sh
cargo run --example calculator
```
