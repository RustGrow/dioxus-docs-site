---
title: Перенаправления
---

# Перенаправления

В некоторых случаях мы можем захотеть перенаправить наших пользователей на другую страницу всякий раз, когда они открывают определённый путь. Мы можем указать маршрутизатору сделать это с помощью атрибута `#[redirect]`.

Атрибут `#[redirect]` принимает маршрут и замыкание со всеми параметрами, определёнными в маршруте. Замыкание должно возвращать [`NavigationTarget`].

В следующем примере мы перенаправим всех с `/myblog` и `/myblog/:id` на `/blog` и `/blog/:id` соответственно.

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
