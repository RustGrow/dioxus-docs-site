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
    DogView, // <---- компонент DogView должен быть в области видимости
}

fn DogView() -> Element {
    todo!()
}
```

## Рендеринг маршрута

Теперь, когда наш `Route` определен, нам нужно отрендерить его. Давайте изменим наш компонент `app`, чтобы он рендерил компонент `Router` вместо `DogView`.

```rust
fn app() -> Element {
    rsx! {
        document::Stylesheet { href: asset!("/assets/main.css") }

        Router::<Route> {}
    }
}
```

## Рендеринг NavBar с Layout

Чтобы добавить навигационную панель на каждую страницу, мы создадим компонент `NavBar` с компонентом `Outlet` для рендеринга текущего маршрута.

Компонент `Link` принимает множество разных аргументов, позволяя расширять и настраивать его под ваш use-case.

В `NavBar` мы также добавим компонент `Outlet::<Route> {}`. Когда компонент Router рендерится, он сначала ищет любые дочерние компоненты `Outlet`. Если такой присутствует, он рендерит текущий маршрут *под outlet*. Это позволяет нам оборачивать текущую страницу в дополнительные элементы — в данном случае, NavBar. Если Outlet отсутствует, то текущий маршрут просто рендерится там, где объявлен `Router {}`.

Чтобы фактически добавить компонент NavBar в наше приложение, нам нужно обновить наш enum `Route` с атрибутом `#[layout]`. Это заставляет роутер сначала рендерить компонент `NavBar`, чтобы он мог отобразить свой `Outlet {}`.

```rust
#[derive(Routable, PartialEq, Clone)]
enum Route {
    #[layout(NavBar)] // <---- добавьте атрибут #[layout]
    #[route("/")]
    DogView,
}
```

Атрибут `layout` инструктирует Router оборачивать следующие варианты enum в данный компонент.
```rust ignore
Router  {
    NavBar {
        Outlet {
            if route == "/" {
                DogView {}
            }
        }
    }
}
```

Визуально это должно быть просто для понимания. Обратите внимание, что Router и Outlet используют один и тот же generic-тип `Route`.

![RouterLayout](/assets/06_docs/routeroutlet.png)

## Добавление маршрута Избранное

Теперь, когда мы понимаем основы маршрутизации, давайте наконец добавим нашу страницу *Избранное*, чтобы мы могли просматривать сохраненные фото собак.

Мы начнем с создания пустого компонента `src/components/favorites.rs`:

```rust
use dioxus::prelude::*;

#[component]
pub fn Favorites() -> Element {
    rsx! { "favorites!" }
}
```

А затем добавим новый вариант в наш enum `Route`:

```rust
#[derive(Routable, PartialEq, Clone)]
enum Route {
    #[layout(NavBar)]
    #[route("/")]
    DogView,

    #[route("/favorites")]
    Favorites, // <------ добавьте этот новый вариант
}
```

Чтобы пользователь мог попасть на эту страницу, давайте также добавим кнопку в навигацию, указывающую на нее.

```rust
use crate::Route;
use dioxus::prelude::*;

#[component]
pub fn NavBar() -> Element {
    rsx! {
        div { id: "title",
            Link { to: Route::DogView,
                h1 { "🌭 HotDog! " }
            }
            Link { to: Route::Favorites, id: "heart", "♥️" } // <------- добавьте этот Link
        }
        Outlet::<Route> {}
    }
}
```

## Наша страница Избранное

Наконец, мы можем построить нашу страницу избранного. Давайте добавим новую серверную функцию `list_dogs`, которая получает 10 последних сохраненных фото собак:

```rust
// Запрос к базе данных и возврат последних 10 собак и их url
#[server]
pub async fn list_dogs() -> Result<Vec<(usize, String)>, ServerFnError> {
    let dogs = DB.with(|f| {
        f.prepare("SELECT id, url FROM dogs ORDER BY id DESC LIMIT 10")
            .unwrap()
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
            .unwrap()
            .map(|r| r.unwrap())
            .collect()
    });

    Ok(dogs)
}
```

Теперь мы можем заполнить наш компонент. Разрешение запроса с сервера может занять некоторое время, поэтому мы используем `use_server_future(...)?` для ожидания завершения запроса перед отображением содержимого в виде списка. `use_server_future` очень похож на `use_resource`, но он ждет завершения future перед продолжением рендеринга и интегрируется с dioxus fullstack для сериализации данных с сервера на клиент.

```rust
use dioxus::prelude::*;

#[component]
pub fn Favorites() -> Element {
    // Создаем pending resource, который разрешается в список собак с бэкенда
    // Ждем разрешения списка избранного с помощью `?`
    let mut favorites = use_server_future(super::backend::list_dogs)?;

    rsx! {
        div { id: "favorites",
            div { id: "favorites-container",
                for (id, url) in favorites().unwrap().unwrap() {
                    // Рендерим div для каждого фото, используя ID собаки как ключ списка
                    div {
                        key: "{id}",
                        class: "favorite-dog",
                        img { src: "{url}" }
                    }
                }
            }
        }
    }
}
```

В качестве дополнительного задания попробуйте добавить кнопку, которая позволяет пользователю также удалять элементы из базы данных.

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
    Favorites, // <------ добавьте этот новый вариант
}
```

## Заключение

Теперь наше приложение HotDog имеет несколько страниц с типобезопасной навигацией! Пользователи могут просматривать собак, сохранять их в избранное и просматривать свою коллекцию.
