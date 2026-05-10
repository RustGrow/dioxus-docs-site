---
title: Потоковая передача HTML
---

# Потоковая передача

Для некоторых сайтов чрезвычайно важно оптимизировать «время до первого байта». Пользователи хотят видеть результаты как можно скорее, даже если не *все* результаты готовы сразу.

Dioxus поддерживает этот сценарий с помощью технологии под названием *«потоковая передача HTML»*. Потоковая передача HTML позволяет вам быстро отправить пользователю начальный скелет страницы, а затем заполнять различные компоненты по мере загрузки их данных.

## Что такое потоковая передача?

Режим рендеринга по умолчанию в Dioxus Fullstack ожидает разрешения всех [границ ожидания](../basics/suspense.md#suspense-with-fullstack) перед отправкой всей страницы как HTML клиенту. Если у вас есть страница с несколькими фрагментами асинхронных данных, сервер будет ждать, пока все они завершатся, прежде чем отрендерить страницу.

Когда потоковая передача включена, сервер может отправлять фрагменты HTML клиенту, как только разрешается каждая граница ожидания. Вы можете начать взаимодействие со страницей, как только отправлена первая часть HTML, вместо ожидания готовности всей страницы. Это может привести к гораздо более быстрому начальному времени загрузки.

Ниже показан тот же [пример hackernews](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/hackernews), отрендеренный с включённой и выключенной потоковой передачей. Хотя обе страницы загружают все данные за одинаковое время, страница с включённой потоковой передачей слева показывает вам данные, как только они становятся доступны.

## SEO и отсутствие JS

Когда потоковая передача включена, всё содержимое страницы всё ещё рендерится в HTML-документ, поэтому поисковые системы всё ещё могут сканировать и индексировать полный контент страницы. Однако контент не будет виден пользователям, если у них не включён JavaScript. Если вы хотите поддерживать пользователей без JavaScript, вам нужно будет отключить потоковую передачу и использовать режим рендеринга по умолчанию.

## Нужна ли вам потоковая передача?

Потоковая передача HTML лучше всего подходит для приложений вроде интернет-магазинов, где большая часть данных рендерится быстро (изображение продукта, описание и т. д.), но некоторые данные разрешаются гораздо дольше. В таких случаях вы не хотите заставлять пользователя слишком долго ждать загрузки страницы, поэтому вы отправляете то, что имеете, как можно скорее.

Потоковая передача добавляет некоторые небольшие накладные расходы и сложность в ваше приложение, поэтому она отключена по умолчанию.

## Включение потоковой передачи

Вы можете включить потоковую передачу в билдере ServeConfig с помощью метода `enable_out_of_order_streaming`. Если вы запускаете ваше приложение через `dioxus::LaunchBuilder`, вы можете использовать метод `with_cfg` для передачи конфигурации, включающей потоковую передачу:

```rust
pub fn main() {
        dioxus::LaunchBuilder::new()
            .with_cfg(server_only! {
                dioxus::server::ServeConfig::builder().enable_out_of_order_streaming()
            })
            .launch(app);
    }
```

или если вы используете пользовательный axum-сервер, вы можете передать конфигурацию напрямую в `serve_dioxus_application`:

```rust
#[cfg(feature = "server")]
    #[tokio::main]
    async fn main() {
        let addr = dioxus::cli_config::fullstack_address_or_localhost();
        let router = axum::Router::new()
// Server side render the application, serve static assets, and register server functions
            .serve_dioxus_application(
                dioxus::server::ServeConfig::builder().enable_out_of_order_streaming(),
                app,
            )
            .into_make_service();
        let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
        axum::serve(listener, router).await.unwrap();
    }
```

## Head-элементы с потоковой передачей

Head-элементы могут быть отрендерены только в начальном фрагменте HTML, содержащем тег `<head>`. Вы должны включить все ваши элементы `document::Link`, `document::Meta` и `document::Title` в первую часть вашей страницы, если это возможно. Если у вас есть какие-либо head-элементы, не включённые в первый фрагмент, они будут отрендерены клиентом после гидратации, что не будет видно ни поисковым системам, ни пользователям без JavaScript.

Начальный фрагмент HTML отправляется после того, как [commit_initial_chunk](https://docs.rs/dioxus-fullstack/0.7.0-alpha.1/dioxus_fullstack/prelude/fn.commit_initial_chunk.html) вызван в первый раз. Если вы используете роутер, это произойдёт автоматически, когда все границы ожидания выше роутера разрешатся. Если вы не используете роутер, вы можете вызвать `commit_initial_chunk` вручную после того, как все ваши блокирующие head-элементы были отрендерены.

```rust
/// An enum of all of the possible routes in the app.
    #[derive(Routable, Clone)]
    enum Route {
// The home page is at the / route
        #[route("/")]
        Home,
    }

    fn Home() -> Element {
        let title = use_server_future(get_title)?;
        let description = use_server_future(get_description)?;

        rsx! {
This will be rendered on the server because it is inside the same (root)
// suspense boundary as the `Router` component.
            document::Title { {title} }
            SuspenseBoundary {
                fallback: |_| {
                    rsx! { "Loading..." }
                },
                AsyncHead {}
            }
        }
    }

    fn AsyncHead() -> Element {
        let description = use_server_future(get_description)?;
// The resource should always be resolved at this point because the `?` above bubbles
// up the async case if it is pending
        let current_description = description.read_unchecked();
        let current_description = current_description.as_ref().unwrap();

        rsx! {
// This will be rendered on the client because it is in a
// suspense boundary below the `Router` component.
            document::Meta { name: "description", content: "{current_description}" }
        }
    }
```

## Заголовки ответа с потоковой передачей

При рендеринге приложения с включённой потоковой передачей Dioxus будет ждать, пока приложение зафиксирует свой начальный скелет, прежде чем отправить ответ на запрос пользователя. Это делается с помощью метода `commit_initial_chunk()`.

Как только начальный фрагмент зафиксирован, вы больше не можете изменять заголовки ответа, ни изменять HTTP-статус.

Например, у вас может быть серверная функция, которая выбрасывает код состояния 404:

```rust
#[get("/api/post/{id}")]
async fn get_post(id: u32) -> Result<String, HttpError> {
    match id {
        1 => Ok("first post".to_string()),
        _ => HttpError::not_found("Post not found"),
    }
}
```

С выключенной потоковой передачей, если этот код состояния всплывает до корневого компонента как ошибка, пользователь получит статус `404 NOT FOUND` в ответе.

```rust
#[component]
fn Post(id: ReadSignal<u32>) -> Element {
    // Если `get_post` возвращает 404, то пользователь тоже получит 404
    let post_data = use_loader(move || get_post(id()))?;

    rsx! {
        h1 { "Пост {id}" }
        p { "{post_data}" }
    }
}
```

Однако когда потоковая передача *включена*, код состояния из этой серверной функции будет распространён пользователю *только* до вызова `commit_initial_chunk()`.

Обычно вы не будете вызывать `commit_initial_chunk()` самостоятельно, поскольку компонент `Router` вызывает его за вас, как только разрешится корневая граница ожидания.

Это означает, что когда ожидание включено, серверные функции не будут устанавливать HTTP-код состояния, если они вызываются изнутри выделенной границы ожидания:

```rust
fn Home() -> Element {
    rsx! {
        SuspenseBoundary {
            fallback: |_| rsx! { "загрузка..." },

            // Ошибки здесь не будут распространяться на заголовки ответа
            Post { id: 123 }
        }
    }
}
```

