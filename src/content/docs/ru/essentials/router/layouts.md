---
title: Макеты
---

# Макеты

Макеты позволяют вам обернуть все дочерние маршруты в компонент. Это может быть полезно при создании чего-то вроде заголовка, который будет использоваться во многих различных маршрутах.

[`Outlet`] сообщает маршрутизатору, где рендерить содержимое в макетах. В следующем примере Index будет отображён внутри [`Outlet`].

Вот более полный пример макета, оборачивающего тело страницы.

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
    #[layout(Wrapper)]
        #[route("/")]
        Index {},
}

#[component]
fn Wrapper() -> Element {
    rsx! {
        header { "header" }
// The index route will be rendered here
        Outlet::<Route> {}
        footer { "footer" }
    }
}

#[component]
fn Index() -> Element {
    rsx! { h1 { "Index" } }
}
```

Пример выше выведет следующий HTML (переносы строк добавлены для удобства чтения):

```html
<header>заголовок</header>
<h1>Главная</h1>
<footer>подвал</footer>
```

## Макеты с динамическими сегментами

Вы можете комбинировать макеты с вложенными маршрутами для создания динамических макетов с содержимым, которое меняется в зависимости от текущего маршрута.

Как и маршруты, компоненты макетов должны принимать свойство для каждого динамического сегмента в маршруте. Например, если у вас есть маршрут с динамическим сегментом вроде `/:name`, ваш компонент макета должен принимать свойство `name`:

```rust
#[derive(Routable, Clone)]
    #[rustfmt::skip]
    enum Route {
        #[nest("/:name")]
            #[layout(Wrapper)]
                #[route("/")]
                Index {
                    name: String,
                },
    }

    #[component]
    fn Wrapper(name: String) -> Element {
        rsx! {
            header { "Welcome {name}!" }
// The index route will be rendered here
            Outlet::<Route> {}
            footer { "footer" }
        }
    }

    #[component]
    fn Index(name: String) -> Element {
        rsx! { h1 { "This is a homepage for {name}" } }
    }
```

Или чтобы получить полный маршрут, вы можете использовать хук `use_route`.

```rust
#[derive(Routable, Clone)]
    #[rustfmt::skip]
    enum Route {
        #[layout(Wrapper)]
            #[route("/:name")]
            Index {
                name: String,
            },
    }

    #[component]
    fn Wrapper() -> Element {
        let full_route = use_route::<Route>();
        rsx! {
            header { "Welcome to {full_route}!" }
// The index route will be rendered here
            Outlet::<Route> {}
            footer { "footer" }
        }
    }

    #[component]
    fn Index(name: String) -> Element {
        rsx! { h1 { "This is a homepage for {name}" } }
    }
```

[`Outlet`]: https://docs.rs/dioxus-router/latest/dioxus_router/components/fn.Outlet.html
[`use_route`]: https://docs.rs/dioxus-router/latest/dioxus_router/hooks/fn.use_route.html
