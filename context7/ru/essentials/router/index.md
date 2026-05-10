---
title: Введение
---

# Введение

По мере роста вашего приложения может быть полезно организовать его в несколько страниц или представлений, между которыми можно переключаться. В веб-приложении каждое представление имеет связанный URL, который можно сохранить и поделиться им. Роутер Dioxus помогает управлять состоянием URL вашего приложения. Он предоставляет типобезопасный интерфейс, который проверяет все маршруты во время компиляции, чтобы предотвратить ошибки во время выполнения.

## Установка роутера

Чтобы начать, вы можете добавить фичу `router` в вашу зависимость `dioxus` в `Cargo.toml`:

```toml
[dependencies]
dioxus = { version = "0.7", features = ["router"] }
```

## Создание перечисления Routable

Ядро роутера — это ваше перечисление `Routable`. Вы будете использовать это перечисление по всему приложению для навигации по различным страницам. Каждый вариант перечисления — это отдельная страница представления в вашем приложении, которая обрабатывает:

1. Парсинг вашего маршрута из URL
2. Отображение вашего маршрута как URL
3. Рендеринг вашего маршрута как компонента

Чтобы создать перечисление `Routable`, вам нужно вывести `Routable` с атрибутом `#[route(..)]` на каждом варианте, который описывает формат маршрута. У вас должен быть компонент в области видимости, имя которого совпадает с именем каждого варианта для рендеринга маршрута:

```rust
use dioxus::prelude::*;

#[derive(Clone, Debug, PartialEq, Routable)]
enum Route {
    #[route("/")]
    Home,

    #[route("/about")]
    About,

    #[route("/user/:id")]
    User { id: u32 },
}

#[component]
fn Home() -> Element {
    rsx! { "Welcome to the home page!" }
}

#[component]
fn About() -> Element {
    rsx! { "This is the about page." }
}

#[component]
fn User(id: u32) -> Element {
    rsx! { "User page for user with id: {id}" }
}
```

<details>
<summary>Использование другого имени компонента</summary>

По умолчанию каждый вариант рендерит компонент с тем же именем. Вы можете указать другой компонент как второй аргумент `#[route]`:

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
    // By default, the component rendered for a route matches the variant name.
    // You can specify a different component as the second argument:
    #[route("/", HomePage)]
    Index {},
}

// This component will be rendered for the Index route
#[component]
fn HomePage() -> Element {
    rsx! { "Welcome home!" }
}
```

</details>

## Рендеринг роутера

Теперь, когда вы определили свои маршруты, вы можете использовать компонент `Router` для их рендеринга. Компонент `Router` принимает ваше перечисление `Routable` как дженерик-аргумент для определения парсинга и рендеринга маршрутов.

```rust
fn main() {
    dioxus::launch(|| rsx! { Router::<Route> {} });
}
```

## Ссылка на первый маршрут

Для навигации между маршрутами вы можете использовать компонент `Link`, предоставляемый роутером. Компонент `Link` принимает свойство `to`, которое может быть либо непроверенной строкой маршрута, либо вариантом вашего перечисления `Routable`:

```rust
...

#[component]
fn Home() -> Element {
    rsx! {
        div {
            "Welcome to the home page!"
            Link { to: Route::About, "Go to About Page" }
        }
    }
}
```
