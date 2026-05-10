---
title: Redirects
---

# Redirects

In some cases, we may want to redirect our users to another page whenever they
open a specific path. We can tell the router to do this with the `#[redirect]`
attribute.

The `#[redirect]` attribute accepts a route and a closure with all of the parameters defined in the route. The closure must return a [`NavigationTarget`].

In the following example, we will redirect everybody from `/myblog` and `/myblog/:id` to `/blog` and `/blog/:id` respectively

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
    #[layout(NavBar)]
    #[route("/")]
    Home {},
    #[nest("/blog")]
    #[layout(Blog)]
    #[route("/")]
    BlogList {},
    #[route("/post/:name")]
    BlogPost { name: String },
    #[end_layout]
    #[end_nest]
    #[end_layout]
    #[nest("/myblog")]
    #[redirect("/", || Route::BlogList {})]
    #[redirect("/:name", |name: String| Route::BlogPost { name })]
    #[end_nest]
    #[route("/:..route")]
    PageNotFound {
        route: Vec<String>,
    },
}
```

[`NavigationTarget`]: https://docs.rs/dioxus-router/latest/dioxus_router/navigation/enum.NavigationTarget.html

