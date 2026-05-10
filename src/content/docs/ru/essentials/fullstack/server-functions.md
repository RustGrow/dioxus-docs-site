---
title: Серверные функции
---

# Серверные функции

Dioxus Fullstack предоставляет эргономичное решение для быстрого создания вашего бэкенд-API и вызова этих эндпоинтов на клиенте, называемое *серверными функциями*. Серверные функции — это обычные функции Rust, которые определяют совместимый с Axum эндпоинт:

```rust
#[get("/api/hello-world")]
async fn hello_world() -> Result<String> {
	Ok("Hello world!".to_string())
}
```

Серверные функции автоматически генерируют HTTP-эндпоинт для вашего приложения. После запуска вашего приложения вы можете обратиться к эндпоинту напрямую через `curl`:

```sh
# возвращает "Hello world!"
curl http://127.0.0.1:8080/api/hello-world
```

Серверные функции можно вызывать прямо с клиента как обычную функцию:

```rust
let onclick = move |_| async move {
	let msg = hello_world().await;
 ...
}
```

Серверные функции могут принимать всевозможные модификаторы, такие как экстракторы только для сервера и пользовательские axum-пейлоады, что делает их ещё более мощными, чем обычный axum-обработчик:

```rust
#[get("/api/users/{user_id}", db: SqlDb)]
async fn get_user(user_id: Uuid) -> Result<UserData> {
    db.get(user_id)
}
```

В конечном счёте, серверная функция — это просто axum-эндпоинт — вы можете чисто использовать всю экосистему Axum с серверными функциями!

## Анатомия серверной функции

Серверная функция — это HTTP-эндпоинт в форме функции Rust. Мы можем превратить обычную функцию в серверную, аннотируя её одним из нескольких процедурных макросов:

- Явно, используя макросы `#[get]`, `#[post]`, `#[put]`, `#[delete]`, `#[patch]`
- Анонимно, с помощью макроса `#[server]`

Чтобы создать серверную функцию, просто добавьте один из `#[get]`, `#[post]` и т. д. поверх вашей функции. У этой функции есть несколько ограничений — она должна:

- Быть асинхронной функцией
- Возвращать `Result<T, E>`
- Принимать аргументы, которые либо `Serialize + Deserialize`, *либо* `IntoRequest + FromRequest`
- Возвращать тип, который либо `Serialize + Deserialize`, *либо* `IntoResponse + FromResponse`

Dioxus использует некоторую «магию» специализации, чтобы обеспечить гибкие типы входных и выходных данных, поэтому ошибки для типов, не удовлетворяющих этим границам, могут быть довольно громоздкими.

По сути, не-URL входные данные должны быть либо набором элементов, которые очевидно сериализуемы (подумайте о строках, числах, пользовательских типах):

```rust
// Входные данные функции создают один сериализуемый объект, который выглядит так:
//
// ```
// #[derive(Serialize, Deserialize)]
// struct Body {
//     a: String,
//     b: i32,
//     c: serde_json::Value,
// }
// ```
#[get("/api/json-body")]
async fn json_body(a: String, b: i32, c: serde_json::Value) -> Result<()> {
	Ok(())
}
```

*либо*, входные данные должны быть единичным объектом, который реализует трейт Axum `FromRequest` и трейт Dioxus `IntoRequest`. Dioxus Fullstack предоставляет ряд встроенных типов, которые реализуют эти трейты и могут использоваться как на клиенте, так и на сервере:

```rust
// Тип `FileStream` позволяет нам передавать загруженные файлы от клиента к серверу
#[get("/api/upload")]
async fn upload(file: FileStream) -> Result<()> {
 ....
}
```

Аналогично, выходной тип может быть либо сериализуемым объектом (строки, числа, пользовательские структуры)

```rust
// Наш пользовательский пейлоад реализует `Serialize + Deserialize`
#[derive(Serialize, Deserialize)]
struct Payload {
 a: i32,
 b: String
}

#[get("/api/json-out")]
async fn json_body() -> Result<Payload> {
	Ok(Payload {
		a: 123,
		b: "hello".to_string(),
	})
}
```

*либо* объект, который реализует трейт Axum `IntoResponse` и трейт Dioxus `FromResponse`. Многие встроенные типы реализуют эти трейты и могут быть возвращены клиенту:

```rust
#[get("/api/stream")]
async fn stream() -> Result<Streaming<String>> {
 ...
}
```

Если вы хотите использовать сторонний тип ответа Axum, но он не реализует `FromResponse`, то вам нужно вызвать `.into_response()` и вернуть тип `axum::response::Response`:

```rust
#[get("/api/video", range: RangeHeader)]
async fn video_endpoint() -> Result<axum::response::Response> {
	let chunk = get_chunk_from_range(range);
	Ok(chunk.into_response())
}
```

### Экстракторы пути и запроса

Мы можем комбинировать пользовательские тела пейлоада с query- и path-экстракторами, что позволяет нам создавать API, подходящие как для нашего Rust-фронтенда, так и для любого другого HTTP-клиента. Это может быть особенно полезно, если ваше API потребляется как вашим собственным приложением, так и внешними клиентами.

Чтобы добавить query- и path-экстракторы, мы можем использовать синтаксис маршрутов Axum в макросе. Макрос распарсит маршрут и сгенерирует для вас связанные axum-экстракторы:

```rust
#[get("/api/products/{product}?color&quantity")]
async fn get_product_data(product: String, color: String, quantity: Option<i32>) -> Result<Vec<Product>> {
 ...
}
```

Под капотом мы генерируем объекты `axum::extract::Query<T>` и `axum::extract::Path<T>`, поэтому вы можете использовать любые допустимые типы, например `Option<T>`. При извлечении из URL значения кодируются в URL и декодируются из URL. Обратите внимание, что не все структуры могут быть чисто закодированы в URL, поэтому мы рекомендуем придерживаться простых типов данных, где это возможно.

Мы можем комбинировать path- и query-экстракторы с body-экстрактором. Это особенно полезно при отправке дополнительных данных вместе с пользовательскими пейлоадами.

```rust
// мы можем передавать дополнительные данные объектам вроде потоков!
#[post("/api/photos/upload?name&rating")]
async fn upload_photo(name: String, rating: i32, image: FileStream) -> Result<i32> {
 ...
}
```

### Серверные экстракторы

Начиная с Dioxus 0.7.3, серверные функции поддерживают **серверные экстракторы (server-only extractors)**. Это типы, которые могут быть извлечены только на стороне сервера и не отправляются с клиента. Это полезно для доступа к серверному состоянию, такому как базы данных, заголовки запросов или информация о сессии:

```rust
#[get("/api/admin/stats")]
async fn get_admin_stats(db: SqlDb, headers: HeaderMap) -> Result<Stats> {
    // `db` и `headers` доступны только на сервере
    // Они не сериализуются с клиента
    db.get_stats().await
}
```

Серверные экстракторы автоматически обнаруживаются и пропускаются при генерации клиентского запроса. Вы можете свободно смешивать серверные экстракторы с обычными аргументами.

### Поддержка query string

Начиная с Dioxus 0.7.1, серверные функции используют `serde_qs` для сериализации query string. Это позволяет использовать сложные вложенные query-параметры, которые невозможны с простыми `key=value` парами:

```rust
#[derive(Serialize, Deserialize)]
struct Filter {
    category: String,
    tags: Vec<String>,
    price_range: Option<(f64, f64)>,
}

#[get("/api/search")]
async fn search(filter: Filter) -> Result<Vec<Product>> {
    // `filter` десериализуется из query string с помощью serde_qs
    // Поддерживает вложенные объекты, массивы и опциональные поля
    Ok(vec![])
}
```

### Пользовательские входные данные

Ранее мы упоминали, что не-query аргументы серверной функции должны быть одного из двух типов:

- Группа сериализуемых типов (строки, целые числа, пользовательские сериализуемые структуры)
- Единичный тип, реализующий `FromRequest` и `IntoRequest`

Второй тип — `FromRequest + IntoRequest` — чрезвычайно мощный. Это позволяет нам создавать новые тела, которые абстрагируют клиентский запрос с помощью методов Rust, делая возможными такие встроенные типы, как `WebsocketOptions` и `Websocket`.

```rust
#[get("/api/ws")]
async fn get_updates(options: WebsocketOptions) -> Result<Websocket> {
	Ok(options.on_upgrade(|mut socket| {
  ...
	}))
}
```

Тип `WebsocketOptions` реализует два ключевых Rust-трейта, упомянутых выше: `FromRequest` и `IntoRequest`.

Первый трейт, [`FromRequest`](https://docs.rs/axum/latest/axum/extract/trait.FromRequest.html), приходит из Axum — библиотеки, на которой построен Dioxus Fullstack.

Чтобы реализовать трейт `FromRequest`, нам нужно определить наш новый тип, а затем реализовать метод `from_request`. Если вы не уверены, какой тип `Rejection` использовать в реализации, вы можете использовать встроенный тип `ServerFnError`, который интегрируется с остальной частью Dioxus Fullstack.

```rust
struct WebsocketOptions {}

impl<S: Send> FromRequest<S> for WebSocketOptions {
    type Rejection = axum::response::Response;

    fn from_request(
        request: Request,
        state: &S,
    ) -> impl Future<Output = Result<Self, Self::Rejection>> + Send {
		async move {
   .. реализация для нашего типа
		}
	}
}
```

Реализация `FromRequest` позволяет нам использовать тип `WebsocketOptions` как Axum-экстрактор. Теперь нам нужно реализовать `IntoRequest`, который позволяет создавать `WebsocketOptions` на клиенте, прежде чем передавать их на сервер.

Трейт `IntoRequest` обобщён над скрытым параметром типа «состояние» (state). Как правило, вы реализуете простой тип `IntoRequest`, но для сложных типов, таких как Websockets, нам нужен пользовательский объект состояния, который ответ (`Websocket`) будет использовать для инициализации. В этом случае мы создаём новый тип состояния под названием `UpgradingWebsocket`, который будет хранить состояние из исходного запроса, чтобы правильно преобразовать ответ сервера в хэндл `Websocket`.

```rust
struct UpgradingWebsocket {
	/// .. состояние для соединения
}

// IntoRequest обобщён над `UpgradingWebsocket`
impl IntoRequest<UpgradingWebsocket> for WebSocketOptions {
    fn into_request(
        self,
        request: ClientRequest,
    ) -> impl Future<Output = std::result::Result<UpgradingWebsocket, RequestError>> + 'static {
		async move {
			let stream = send_request(request).await?;

			return Ok(UpgradingWebsocket {
    ... передаём поток дальше
			})
		}
	}
}
```

Для тел, которым не нужно пользовательское состояние, вы можете просто использовать тип `IntoRequest` по умолчанию, который обобщён над типом `ClientResponse` Dioxus Fullstack:

```rust
// состояние по умолчанию — `ClientResponse`:
pub trait IntoRequest<R = ClientResponse>: Sized {
    fn into_request(
        self,
        req: ClientRequest,
    ) -> impl Future<Output = Result<R, RequestError>> + 'static;
}
```

Теперь, когда клиент делает запрос к нашему эндпоинту, структура `WebsocketOptions` может использоваться для хранения состояния соединения:

```rust
// Теперь мы можем использовать `WebsocketOptions` как пользовательское тело:
#[get("/api/ws/")]
async fn get_updates(options: WebsocketOptions) -> Result<()> {
 ...
}

// Вызов эндпоинта всё ещё довольно прост:
_ = get_updates(WebsocketOptions::new()).await?;
```

### Пользовательские выходные данные

Трейты `IntoRequest` и `FromRequest` позволяют нам отправлять произвольные типы данных на сервер, но иногда нам нужно возвращать произвольные типы данных клиенту. В нашем примере выше это был бы тип возврата `Websocket`:

```rust
#[get("/api/ws")]
async fn get_updates(options: WebsocketOptions) -> Result<Websocket> {
	Ok(options.on_upgrade(|mut socket| {
  ...
	}))
}
```

Как упоминалось выше, возвращаемый тип серверной функции должен быть одного из двух типов:
- Очевидно сериализуемый объект (строка, целое число, пользовательская структура)
- Тип, реализующий `IntoResponse` и `FromResponse`

Трейт [`IntoResponse`](https://docs.rs/axum/latest/axum/response/trait.IntoResponse.html) приходит из Axum и довольно прост в реализации. Чтобы реализовать трейт `IntoResponse`, нам просто нужно реализовать метод `into_response` для нашего пользовательского типа. Тип возврата здесь — Axum `Response`, который очень просто сконструировать:

```rust
impl IntoResponse for Websocket {
	fn into_response(self) -> Response {
        Response::builder()
			.status(200)
			.header(/* */)
			.body(/* */)
			.unwrap()
	}
}
```

Ответ здесь напрямую передаётся клиенту. Dioxus Fullstack может добавить некоторые дополнительные заголовки к ответу, но тело ответа останется нетронутым по мере его возврата через Axum-роутер.

Теперь, чтобы использовать наш тип `Websocket` на клиенте, нам нужно реализовать `FromResponse`. Трейт `FromResponse` — аналог трейта `IntoResponse` с похожим определением:

```rust
pub trait FromResponse<R = ClientResponse>: Sized {
    fn from_response(res: R) -> impl Future<Output = Result<Self, ServerFnError>>;
}
```

Как и `IntoRequest`, трейт `FromResponse` обобщён над параметром состояния по умолчанию (обычно `ClientResponse`). Как и раньше, мы обычно *не* обобщаемся по параметру состояния, поскольку тип `ClientResponse` сам по себе довольно полезен, но для `Websocket` мы хотим убедиться на этапе компиляции, что входной запрос имеет требуемое состояние.

Чтобы реализовать `FromResponse`, нам нужно создать новый экземпляр нашего типа из сохранённого состояния:

```rust
impl FromResponse<UpgradingWebsocket> for Websocket {
    fn from_response(res: UpgradingWebsocket) -> impl Future<Output = Result<Self, ServerFnError>> {
		async move {
   ...
		}
	}
}
```

Обратите внимание, что тип ошибки здесь — `ServerFnError`. Этот тип гарантирует, что клиентский код может правильно привести любые ошибки, возникающие при выполнении запроса, к стандартному типу ошибки. Тип `ServerFnError` включает ряд полезных вариантов ошибок, позволяя нам выражать всевозможные режимы отказа, некоторые со стандартизированным HTTP-кодом состояния и деталями.

### Серверные экстракторы

По мере создания всё более сложных бэкендов вам может понадобиться больше контроля над извлечением данных из запроса. Это может быть обработка таких вещей, как auth-токены, cookies, range-заголовки или любое количество задач, связанных с запросом и его заголовками. Иногда эти значения не могут быть отправлены напрямую с клиента.

В случае аутентификации мы можем захотеть извлечь stateful-расширение из запроса или прочитать конкретный заголовок, такой как auth-bearer. Во многих случаях клиент явно не передаёт эти типы на сервер, поскольку они либо извлекаются с использованием состояния только для сервера, либо неявно прикрепляются, как cookies.

Чтобы извлечь произвольные данные из запроса, мы можем «поднять» аргументы функции в макрос. Эти типы должны реализовывать трейт Axum `FromRequestParts` — или `FromRequest`, если нет тела только для клиента.

```rust
// Наш аргумент `auth` — это аргумент функции, поднятый в список аргументов процедурного макроса
#[post("/api/user/login", auth: auth::Session)]
pub async fn login() -> Result<()> {
    auth.login_user(2);
    Ok(())
}
```

Поскольку здесь типы должны реализовывать `FromRequestParts`, мы можем использовать широкое разнообразие встроенных экстракторов. Например, мы можем извлечь весь объект `HeaderMap` из запроса:

```rust
#[get("/api/headers", headers: dioxus::fullstack::HeaderMap)]
async fn get_headers() -> Result<String> {
    Ok(format!("{:#?}", headers))
}
```

Мы можем накапливать столько таких экстракторов, сколько захотим:

```rust
#[post("/api/user/login", header: TypedHeader<Cookie>, auth: Session)]
pub async fn login() -> Result<()> {
    ...
}
```

Серверные экстракторы облегчают миграцию существующих axum-обработчиков на серверные функции без слишком больших модификаций кода.

## Обработка ошибок

### Допустимые типы ошибок

По умолчанию Dioxus экспортирует пользовательский тип `Result<T>` в прелюдии (prelude). Всякий раз, когда вы вызываете `use dioxus::prelude::*`, вы импортируете этот тип `Result<T>` в область видимости модуля. Этот тип `Result<T>` на самом деле является реэкспортом типа `Result<T>` из anyhow.

Тип Result из anyhow — это широко используемый «динамический» тип ошибки в приложениях на Rust. Он чрезвычайно гибок, позволяя вам использовать мощный синтаксис вопросительного знака (`?`) Rust с любым типом ошибки, реализующим `std::Error`.

Это означает, что приведённые выше примеры эквивалентны прямому использованию типа ошибки anyhow:

```rust
#[post("/api/user/login")]
pub async fn login() -> Result<(), anyhow::Error> {
    ...
}
```

К сожалению, когда ошибки создаются на сервере, Dioxus Fullstack не может сохранить тип ошибки на клиенте. Поэтому все ошибки от эндпоинтов, использующих простой `Result<T>`, всегда будут приведены к типу `ServerFnError` Dioxus Fullstack:

```rust
// Делаем запрос, предполагая, что он всегда завершается ошибкой, разворачивая ошибку
let res = login().await.unwrap_err();

// Мы можем привести эту ошибку только к `ServerFnError`
let error = res.downcast_ref::<ServerFnError>().unwrap();
```

Если вы хотите больше деталей о типе ошибки, вы можете использовать тип `ServerFnError` напрямую или `ServerFnResult`:

```rust
#[post("/api/user/login")]
pub async fn login() -> Result<(), ServerFnError> {
    ...
}
```

Тип `ServerFnError` — это специальный тип ошибки, который чисто интегрируется с остальной частью Dioxus. Его многочисленные варианты представляют различные точки отказа при обработке данного запроса. Два его наиболее важных варианта — `ServerError` и `RequestError`.

```rust
pub enum ServerFnError {
    /// Возникает при ошибке во время фактического выполнения функции на сервере.
    #[error("error running server function: {message} (details: {details:#?})")]
    ServerError {
        /// Человекочитаемое сообщение, описывающее ошибку.
        message: String,

        /// HTTP-код состояния, связанный с ошибкой.
        code: u16,

		/// Сериализованный пользовательский тип ошибки
        details: Option<serde_json::Value>,
    },

    /// Возникает на клиенте при сетевой ошибке при попытке выполнить функцию на сервере.
    #[error("error reaching server to call server function: {0} ")]
    Request(RequestError),

 ...
}
```

Если эндпоинт возвращает `ServerFnError`, вы можете сопоставить результат на клиенте, предоставляя более полезную обратную связь пользователю в случае сбоя:

```rust
match login().await {
	Err(ServerFnError::ServerError { code, .. }) => {
		if code == 404 {
   .. обработка not found
		}

		if code == 401 {
   .. обработка unauthorized
		}
	}
	_ => { /* */ }
}
```

Эндпоинты могут принимать широкое разнообразие типов ошибок, включая:

- `anyhow::Error`: простой, гибкий тип ошибки для быстрой разработки
- `ServerFnError`: структурированная ошибка для детальной обработки типов ошибок
- `StatusCode`: простая обёртка вокруг HTTP-кода состояния
- `HttpError`: тип ошибки, возвращаемый из типа `OrHttpError`
- Пользовательские ошибки: определяемые пользователем ошибки (см. ниже)

### Пользовательские ошибки

Помимо `anyhow::Error`, `ServerFnError` и `HttpError`, серверные функции могут возвращать пользовательские, определяемые пользователем ошибки. Эти ошибки должны реализовывать `Serialize`, `Deserialize` и дополнительный трейт `AsStatusCode`. `AsStatusCode` требует, чтобы ошибка реализовывала `From<ServerFnError>` и метод для получения фактического кода состояния из самой ошибки.

Вы можете легко создавать новые типы ошибок, используя макрос `Error` из крейта `thiserror`. Атрибут `#[from]` позволяет легко преобразовывать `ServerFnError` в пользовательский тип ошибки.

```rust
#[derive(thiserror::Error, Debug, Serialize, Deserialize)]
enum MyCustomError {
    #[error("bad request")]
    BadRequest { custom_name: String },

    #[error("not found")]
    NotFound,

    #[error("internal server error: {0}")]
    ServerFnError(#[from] ServerFnError),
}
```

Затем мы должны реализовать `AsStatusCode`, чтобы Dioxus Fullstack знал, какой код состояния возвращать клиенту в случае ошибки.

```rust
impl AsStatusCode for MyCustomError {
    fn as_status_code(&self) -> StatusCode {
        match self {
            MyCustomError::BadRequest { .. } => StatusCode::BAD_REQUEST,
            MyCustomError::NotFound => StatusCode::NOT_FOUND,
            MyCustomError::ServerFnError(e) => e.as_status_code(),
        }
    }
}
```

### Эргономичная обработка ошибок

Dioxus Fullstack предоставляет служебный трейт `OrHttpError` для преобразования распространённых случаев отказа в правильные HTTP-коды состояния и сообщения об ошибках. Этот трейт упрощает следование правильной веб-семантике (например, 404 для not-found, 401 для not-authorized и т. д.), оставаясь в русле эргономичной обработки ошибок в Rust.

Вы можете использовать методы `OrHttpError` на любом `Result<T>`, `Option<T>` или `bool`, чтобы вернуть `Err(HttpError)`.

Например, мы можем написать метод `authorize`, который выбрасывает ошибку, если авторизация не удалась. Мы можем использовать метод `.or_unauthorized()?` для преобразования ошибки в соответствующий код состояния.

```rust
#[post("/api/user/login")]
pub async fn login() -> Result<(), ServerFnError> {
	authenticate_user()
		.or_unauthorized("You must be logged in to view this resource")?;
 ..
}
```

Чтобы не загрязнять глобальную область видимости, по умолчанию доступно только несколько служебных методов. Вы можете использовать `or_http_error` для возврата любого кода состояния:

```rust
#[post("/api/user/login")]
pub async fn login() -> Result<(), ServerFnError> {
	authenticate_user()
		.or_http_error(StatusCode::UNAUTHORIZED, "Log in first!")?;
 ..
}
```

Обратите внимание, что даже когда мы используем `anyhow::Error`, Dioxus автоматически извлечёт соответствующий код состояния из ошибки:

```rust
// наш `Result<T>` содержит объект `HttpError`
#[post("/api/user/login")]
pub async fn login() -> Result<()> {
	authenticate_user()
		.or_http_error(StatusCode::UNAUTHORIZED, "Log in first!")?;
 ..
}
```

Это справедливо для `HttpError`, `StatusCode` и `ServerFnError`, все из которых приводятся из типа ошибки anyhow.
