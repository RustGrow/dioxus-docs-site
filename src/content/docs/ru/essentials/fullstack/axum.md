---
title: Роутер и состояние (Axum)
---

# Роутер Axum

Dioxus Fullstack построен на популярном бэкенд-крейте Axum. Функция `dioxus::launch` по умолчанию инициализирует стандартный Axum-сервер для вашего fullstack-проекта. Если вам нужно больше контроля, вы можете легко настроить роутер с помощью `dioxus::serve`.

Функция `dioxus::serve` — это основная точка входа для приложений Dioxus, которые запускаются на сервере, как это стандартно для fullstack-приложений. Для fullstack-приложений вы обычно будете использовать и `dioxus::launch`, и `dioxus::serve`, включая каждую точку входа на основе фичи `"server"`.

```rust
fn main() {
    // Запускаем `serve()` только на сервере
    #[cfg(feature = "server")]
    dioxus::serve(|| async move {
        // Создаём новый роутер для нашего приложения, используя функцию `router`
        let mut router = dioxus::server::router(app);

        .. настраиваем роутер, добавляя слои и новые маршруты

        // И затем возвращаем роутер
        Ok(router)
    });

    // Когда не на сервере, просто запускаем `launch()` как обычно
    #[cfg(not(feature = "server"))]
    dioxus::launch(app);
}
```

Обратите внимание, как мы используем встроенный макрос Rust `#[cfg]` для условного запуска приложения на основе фичи `server`. Когда фича `server` включена, мы включаем `dioxus::serve`, а когда она выключена — включаем `dioxus::launch`.

Функция `dioxus::server::router` создаёт новый axum-роутер, который настраивает несколько важных частей:

- Статические ресурсы: автоматически отдаёт директорию `public`, index.html и ресурсы
- SSR: автоматически запускает приложение, рендерит его в HTML и сериализует данные для гидратации
- Серверные функции: автоматически инициализирует API-эндпоинты

Dioxus использует методы расширения на Axum-роутере (предоставляемые `DioxusRouterExt`), что эквивалентно включению каждого из этих элементов вручную:

```rust
axum::Router::new()
	.register_server_functions()
	.serve_static_assets()
	.fallback(
		get(render_handler).with_state(RenderHandleState::new(cfg, app)),
	)
```

## Регистрация серверных функций

Когда вы используете `dioxus::server::router` или `dioxus::launch` для запуска вашего fullstack-сервера, Dioxus Fullstack регистрирует все серверные функции автоматически. Это означает, что вы можете быстро создать свой бэкенд, не нуждаясь в явном подключении эндпоинтов к центральному роутеру.

Если вам нужно больше контроля с пользовательской настройкой axum, вы можете вручную пройтись по списку глобальных серверных функций и зарегистрировать отдельные эндпоинты, или создать новые роутеры с подмножеством маршрутов с помощью `ServerFunction::collect()`:

```rust
// Мы можем пройтись по всем серверным функциям:
for func in ServerFunction::collect() {
	// Читаем их данные
 tracing::info!(
		"Registering server function: {} {}",
		func.method(),
		func.path()
	);

	// И добавляем их в наш роутер
	router = func.register_server_fn_on_router(router);
}
```

## Добавление новых маршрутов

Один распространённый сценарий использования пользовательского axum-роутера — добавление новых маршрутов в роутер, которые *не* определены с помощью серверных функций. Мы можем захотеть включить специальные эндпоинты, которые отвечают динамически или возвращают типы данных, отличные от HTML.

Этот пример добавляет три новых маршрута в наше приложение:

```rust
dioxus::serve(|| async move {
    use dioxus::server::axum::routing::{get, post};

    let router = dioxus::server::router(app)
        .route("/submit", post(|| async { "Form submitted!" }))
        .route("/about", get(|| async { "About us" }))
        .route("/contact", get(|| async { "Contact us" }));

    Ok(router)
});
```

Обратите внимание, что обработчик серверного рендеринга зарегистрирован как *fallback*-обработчик. Любые маршруты, которые мы регистрируем вручную, будут иметь приоритет над приложением Dioxus. Поскольку эти обработчики являются axum-обработчиками, они могут принимать типичные модификаторы, такие как `.with_state()`, `.layer()` и т. д.

```rust
let router = dioxus::server::router(app)
    .route(
        "/submit",
        post(
            |state: State<FormSubmitter>, ping: Extension<Broadcast>, cookie: TypedHeader<Cookie>| async {
                ... логика эндпоинта
            },
        ),
    )
    .with_state(FormSubmitter::new())
    .layer(Extension(Broadcast::new()));
```

В [документации Axum](https://docs.rs/axum/latest/axum/index.html) есть больше информации об определении маршрутов и обработчиков вне серверных функций.

## Добавление `Layers`

Axum позволяет вам прикреплять промежуточное ПО (middleware) ко многим частям вашего роутера:

- К целым роутерам с помощью [Router::layer](https://docs.rs/axum/latest/axum/struct.Router.html#method.layer) и [Router::route_layer](https://docs.rs/axum/latest/axum/struct.Router.html#method.route_layer).
- К методным роутерам с помощью [MethodRouter::layer](https://docs.rs/axum/latest/axum/routing/method_routing/struct.MethodRouter.html#method.layer) и [MethodRouter::route_layer](https://docs.rs/axum/latest/axum/routing/method_routing/struct.MethodRouter.html#method.route_layer).
- К отдельным обработчикам с помощью [Handler::layer](https://docs.rs/axum/latest/axum/handler/trait.Handler.html#method.layer).


## Добавление состояния с помощью Extensions

По мере развития вашего приложения вы можете захотеть предоставить состояние вашим эндпоинтам и запросам. Axum предоставляет два способа добавления состояния к эндпоинтам: `Extension` и `State<T>`. Extensions позволяют вам прикреплять дополнительные данные к запросам по мере их обработки вашим роутером.

Вы можете использовать extensions *либо* как форму глобального состояния, *либо* как способ прикрепления состояния к запросам. Чтобы поделиться определённым фрагментом данных со всеми эндпоинтами, вы можете прикрепить extension как слой к роутеру в `dioxus::serve`:

```rust
dioxus::serve(|| async move {
    use dioxus::server::axum::Extension;
    use tokio::sync::broadcast;

    let router = dioxus::server::router(app)
        .layer(Extension(broadcast::channel::<String>(16).0));

    Ok(router)
});
```

Теперь в наших обработчиках мы можем извлечь extension из запроса:

```rust
#[post("/api/broadcast", ext: Extension<broadcast::Sender<String>>)]
async fn broadcast_message() -> Result<()> {
    ext.send("New broadcast message".to_string())?;
    Ok(())
}
```

Если мы хотим прикрепить состояние к единичному запросу — как в случае с session middleware — мы можем прикрепить новое промежуточное ПО к роутеру, которое динамически вставляет новый extension в запрос.

```rust
use axum::{extract::Request, middleware::Next, middleware};

let router = dioxus::server::router(app)
    .layer(middleware::from_fn(|req: Request, next: Next| async move {
        // Прикрепляем некоторое дополнительное состояние к запросу
        req.extensions_mut().insert(Session::new());

        // И затем возвращаем ответ с помощью `next.run()`
        Ok::<_, Infallible>(next.run(req).await)
    }))
```

## Использование `Lazy<T>` как глобального состояния

Как более простая альтернатива axum extensions и `State<T>`, вы также можете использовать встроенный тип `Lazy<T>` для доступа к серверным ресурсам без необходимости настраивать выделенную точку входа `dioxus::serve`. Тип `Lazy<T>` очень похож на тип стандартной библиотеки `LazyLock<T>`, позволяя инициализировать асинхронные данные, такие как соединения с базами данных.

Просто создайте новый экземпляр `Lazy<T>` как `static` переменную:


```rust
static DATABASE: Lazy<sqlx::SqlitePool> = Lazy::new(|| async move {
    dioxus::Ok(
        SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with("sqlite::memory:".parse().unwrap())
            .await?,
    )
});
```

Затем, когда вы обращаетесь к объекту `DATABASE` в вашем коде, Dioxus гарантирует, что он правильно инициализирован, блокируя текущий поток до завершения инициализатора. Это позволяет вам использовать асинхронные ресурсы *синхронно*, что делает их чрезвычайно эргономичными.

```rust
/// При использовании типа `Lazy<T>` он реализует `Deref<Target = T>`, поэтому вы можете использовать его как обычную ссылку.
#[get("/api/users")]
async fn get_users() -> Result<Vec<String>> {
    let users = DATABASE
        .fetch_all(sqlx::query("SELECT name FROM users"))
        .await?
        .iter()
        .map(|row| row.get::<String, _>("name"))
        .collect::<Vec<_>>();

    Ok(users)
}
```

Обычно Rust не поощряет использование глобальных переменных для управления состоянием, но для приложений вроде веб-серверов, как правило, допустимо иметь один общий объект для всего приложения.

Обратите внимание, что вы также можете использовать встроенный стандартный тип `LazyLock` для простых синхронных данных:

```rust
static MESSAGES: LazyLock<Mutex<Vec<String>>> = LazyLock::new(|| Mutex::new(Vec::new()));

#[post("/api/messages")]
async fn add_message() -> Result<()> {
    MESSAGES.lock().await.push("New message".to_string());
    Ok(())
}
```
