---
title: Генерация статических сайтов
---

# Генерация статических сайтов

Генерация статических сайтов (SSG) позволяет вам предварительно генерировать все статические страницы вашего приложения во время сборки. Получив статические HTML-страницы, вы можете развёртывать их на любом статическом хостинге, например GitHub Pages.

SSG чрезвычайно мощна, поскольку позволяет кэшировать рендеринг ваших страниц перед развёртыванием в production. Это снижает затраты на трафик, позволяет кэшировать контент на CDN и позволяет развёртывать *без* сервера. Многие хостинг-провайдеры позволяют вам развёртывать SSG-сайты бесплатно!

## Как работает SSG в Dioxus

Dioxus SSG работает, запуская ваше приложение локально, запрашивая у приложения карту сайта (sitemap), а затем индексируя ваш сайт вручную с помощью запросов `curl`. Если ваш сайт настроен на использование SSG, то он будет кэшировать HTML для каждой страницы в файловой системе.

Этот подход к SSG сильно отличается от традиционного генератора статических сайтов, такого как Hugo, Jekyll или Zola. Dioxus SSG разработан так, чтобы позволить вам писать весь ваш сайт на Rust, загружать данные так, как вы хотите, а затем развёртывать гибридное SSG-приложение, которое загружает SPA-контент.

## Возможно, вам не нужен SSG

Даже если ваше приложение имеет значительное количество статического контента, возможно, вам на самом деле не нужен SSG. Вы должны использовать SSG в нескольких случаях:

- У вас *много* статического контента, который выигрывает от предварительного рендеринга перед развёртыванием
- Вам не нужен бэкенд для вашего сайта

Сайты вроде документации и портфолио выигрывают от SSG, в то время как приложения вроде фоторедакторов — нет. Во многих случаях вы можете просто установить заголовки `Cache-Control` при рендеринге страниц и позволить вашему CDN или обратному прокси обрабатывать кэширование за вас!

## Настройка ServeConfig

SSG построен поверх функции инкрементального рендеринга Dioxus Fullstack. Нам нужно настроить `ServeConfig` для включения инкрементального рендеринга. Конфигурация инкрементального рендеринга должна рендерить в директорию `public`, где Dioxus размещает все остальные публичные файлы, такие как wasm-бинарник и статические ресурсы. Директория `public` в веб-папке всегда будет размещена рядом с серверным бинарником.

```rust
fn main() {
    dioxus::LaunchBuilder::new()
// Set the server config only if we are building the server target
        .with_cfg(server_only! {
            ServeConfig::builder()
// Enable incremental rendering
                .incremental(
                    dioxus::server::IncrementalRendererConfig::new()
// Store static files in the public directory where other static assets like wasm are stored
                        .static_dir(
                            std::env::current_exe()
                                .unwrap()
                                .parent()
                                .unwrap()
                                .join("public")
                        )
// Don't clear the public folder on every build. The public folder has other files including the wasm
// binary and static assets required for the app to run
                        .clear_cache(false)
                )
                .enable_out_of_order_streaming()
        })
        .launch(app);
}
```

## Конфигурирование статических маршрутов

Как только у вас включён инкрементальный рендеринг, вам нужно сообщить CLI о статических маршрутах в вашем приложении. CLI ищет серверную функцию на эндпоинте `"static_routes"`, которая возвращает список всех статических URL. Она вызовет эту серверную функцию во время сборки и предварительно отрендерит все маршруты из списка.

```rust
#[derive(Routable, Clone, PartialEq)]
pub enum Route {
// Any routes with no dynamic segments in your router will be included in the static routes list
    #[route("/")]
    Index {},

    #[route("/other")]
    Other {},
}

// The server function at the endpoint "static_routes" will be called by the CLI to generate the list of static
// routes. You must explicitly set the endpoint to `"static_routes"` in the server function attribute instead of
// the default randomly generated endpoint.
#[server(endpoint = "static_routes", output = server_fn::codec::Json)]
async fn static_routes() -> Result<Vec<String>, ServerFnError> {
// The `Routable` trait has a `static_routes` method that returns all static routes in the enum
    Ok(Route::static_routes()
        .iter()
        .map(ToString::to_string)
        .collect())
}
```

## Публикация статических сайтов

Наконец, вы можете собрать ваш сайт с помощью `dx bundle --web --ssg`. Как только CLI завершит сборку, вы должны увидеть папку `public` в директории dx вашего проекта:

![Dioxus SSG](/assets/06_docs/ssg_folder.png)

Папка содержит все статические ресурсы, необходимые для обслуживания вашего сайта. Вы можете скопировать папку public на любой статический хостинг, например GitHub Pages.
