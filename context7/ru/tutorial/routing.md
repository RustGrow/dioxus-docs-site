---
title: Маршрутизация и структура
---

# Добавление маршрутов

До сих пор у нашего приложения была только одна страница. Давайте это изменим!

В этой главе мы добавим Navbar, экран приветствия и страницу "избранное", где мы сможем просматривать наших любимых собак.

## Организация проекта

Прежде чем мы слишком далеко зайдем с добавлением новых страниц в наше приложение, давайте немного лучше организуем нашу кодовую базу. Для более крупных проектов вы можете разбить ваше приложение на разные, более мелкие крейты. Для HotDog мы будем держать все просто.

> Шаблоны Jumpstart и Workspace команды `dx new` предоставляют отличный скелетинг для новых приложений!

Мы обычно рекомендуем разделять ваши компоненты, модели и бэкенд-функциональность на разные файлы. Для HotDog мы будем использовать простую структуру директорий:

```sh
├── Cargo.toml
├── assets
│   └── main.css
└── src
    ├── backend.rs
    ├── components
    │   ├── favorites.rs
    │   ├── mod.rs
    │   ├── nav.rs
    │   └── view.rs
    └── main.rs
```

У нас будет `backend.rs`, содержащий наши серверные функции, и папка `components`, содержащая наши компоненты. У нас пока нет компонентов `NavBar` или `Favorites`, но мы все равно создадим соответствующие файлы перед их добавлением. Разделяя наши серверные функции в файл `backend.rs`, мы упростим извлечение нашего бэкенд-функционала как общей библиотеки для разных приложений в будущем.

Наш файл `components/mod.rs` будет просто импортировать и реэкспортировать компоненты из `view.rs`, `nav.rs` и `favorites.rs`:

```rust
mod favorites;
mod nav;
mod view;

pub use favorites::*;
pub use nav::*;
pub use view::*;
```

Наконец, нам нужно подключить `backend` и `components` в область видимости в нашем файле `main.rs`:

```rust
mod components;
mod backend;

use crate::components::*;
```

Для получения дополнительной информации об организации проектов Rust с модулями см. [раздел Модули](https://doc.rust-lang.org/book/ch07-02-defining-modules-to-control-scope-and-privacy.html) в Rust Book.

## Создание маршрута

Большинство приложений Dioxus, которые вы будете создавать, будут иметь разные экраны. Это может включать страницы вроде *Login*, *Settings* и *Profile*. Наше приложение HotDog будет иметь два экрана: страницу *DogView* и страницу *Favorites*.

Dioxus предоставляет роутер от первого лица, который нативно интегрируется с вебом, десктопом и мобильными устройствами. Например, в вебе, всякий раз, когда вы посещаете URL `/favorites` в вашем браузере, загрузится соответствующая страница *Favorites*. Роутер Dioxus очень мощный, и, что самое важное, типобезопасный. Вы можете быть уверены, что пользователи никогда не будут отправлены на невалидный маршрут. Чтобы достичь этого, нам сначала нужно добавить фичу "Router" в файл Cargo.toml:

```toml
[dependencies]
dioxus = { version = "0.7.0", features = ["fullstack", "router"] } # <----- добавьте "router"
```

Далее, роутер Dioxus определяется как enum с атрибутом derive `Routable`:

```rust
#[derive(Routable, Clone, PartialEq)]
enum Route {
    #[route("/")]
    DogView,
}
```

С помощью роутера Dioxus каждый маршрут является вариантом enum с атрибутом `#[route]`, который указывает URL маршрута. Всякий раз, когда роутер рендерит наш маршрут, будет отрендерен компонент с тем же именем.

```rust
use dioxus::prelude::*;

    #[derive(Routable, Clone, PartialEq)]
    enum Route {
        #[route("/")]
        // DogView, // <---- a DogView component must be in scope
    }

    fn DogView() -> Element {
        todo!()
    }
```

## Рендеринг маршрута

Чтобы отрендерить наш роутер, мы используем компонент `Router`:

```rust
fn app() -> Element {
        rsx! {
            document::Stylesheet { href: asset!("/assets/main.css") }

📣 delete Title and DogView and replace it with the Router component.
            Router::<Route> {}
        }
    }
```

## Catch-all маршруты

Вы можете определить catch-all маршруты с помощью атрибута `#[route("/:..segments")]`:

```rust
#[derive(Routable, Clone, PartialEq)]
    enum Route {
...
// We can collect the segments of the URL into a Vec<String>
        #[route("/:..segments")]
        PageNotFound { segments: Vec<String> },
    }
```

## Навигация

Для навигации между маршрутами вы можете использовать компонент `Link` или хук `use_navigator`:

```rust
use dioxus::prelude::*;

    #[component]
    pub fn NavBar() -> Element {
        rsx! {
            div { id: "title",
                Link { to: Route::DogView,
                    h1 { "🌭 HotDog! " }
                }
            }
            Outlet::<Route> {}
        }
    }
```

```rust
// Using the Link with Route
    Link { to: Route::DogView }

// Or passing in a "/" route directly
    Link { to: "/" }
```

## Вложенные маршруты

Вы можете вкладывать маршруты для создания иерархий страниц:

```rust
use dioxus::prelude::*;

    #[component]
    pub fn Favorites() -> Element {
        rsx! { "favorites!" }
    }
```

```rust
#[derive(Routable, PartialEq, Clone)]
    enum Route {
        #[layout(NavBar)]
        #[route("/")]
        DogView,

        #[route("/favorites")]
        // Favorites, // <------ add this new variant
    }
```

## Заключение

Теперь наше приложение HotDog имеет несколько страниц с типобезопасной навигацией! Пользователи могут просматривать собак, сохранять их в избранное и просматривать свою коллекцию.
