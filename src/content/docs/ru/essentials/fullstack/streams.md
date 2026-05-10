---
title: Потоки и SSE
---

# Потоки и SSE

Dioxus Fullstack предоставляет простой способ отправки и получения потоковых данных с сервера. Это может быть полезно для реализации функциональности вроде потоковой передачи ответов LLM, загрузки файлов и серверных событий (SSE).

В отличие от веб-сокетов, которые позволяют двустороннее общение, потоки однонаправлены. В браузерах обычно невозможно иметь одновременно потоковый ввод *и* потоковый вывод, поэтому вам следует использовать потоки для таких вещей, как текстовые/байтовые ответы или отправка файлов.

## Потоковая передача текста

Dioxus Fullstack предоставляет тип `TextStream` для лёгкой отправки фрагментов текста между клиентом и сервером. Мы можем использовать этот тип как входные или выходные данные серверной функции:

```rust
// Выходные данные — `TextStream`
#[get("/api/test_stream?start")]
async fn text_stream(start: Option<i32>) -> Result<TextStream> {
    let mut count = start.unwrap_or(0);

    // Мы можем создать новый текстовый поток с помощью `spawn`
    Ok(TextStream::spawn(move |tx| async move {

        // Отправляем сообщение с помощью `unbounded_send`
        while tx.unbounded_send(format!("Hello, world! {}", count)).is_ok() {
            count += 1;

            // и затем немного ждём
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        }
    }))
}
```

Вы можете создать новый поток с помощью `TextStream::spawn`, который даёт вам объект `UnboundedSender`, или из `TextStream::new()`, который принимает существующий тип, реализующий трейт `Stream`:

```rust
// `rx` здесь реализует `Stream`, который может использоваться в `new()`
let (tx, rx) = futures::channel::mpsc::unbounded();

tokio::spawn(async move {
    let mut count = start.unwrap_or(0);
    loop {
        let message = format!("Hello, world! {}", count);
        if tx.unbounded_send(message).is_err() {
            break;
        }

        count += 1;
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    }
});

Ok(Streaming::new(rx))
```

## Потоковая передача байтов

Тип `TextStream` является надмножеством типа `ByteStream`. Чтобы отправлять сырые байты между клиентом и сервером, просто используйте `ByteStream` так же, как `TextStream`, но с типом `Bytes` в качестве входных данных:

```rust
#[post("/api/upload_as_bytestream")]
async fn upload_as_bytestream(mut stream: ByteStream) -> Result<()> {
    while let Some(chunk) = stream.next().await {
        ... обработка фрагмента
    }

    Ok(())
}
```

Обратите внимание, что в этом примере мы *потребляем* байтовый поток, используя `.next()`. Потоки в Dioxus реализуют стандартный трейт [`Stream`](https://docs.rs/futures/latest/futures/prelude/trait.Stream.html), который имеет ряд [полезных расширений](https://docs.rs/futures/latest/futures/stream/trait.StreamExt.html).

## Обобщённый тип `Streaming<T, E>`

И `TextStream`, и `ByteStream` реализованы как конкретные вариации обобщённого типа `Streaming<T, E>`. Под капотом оба типа потоков — это просто потоки `Vec<u8>`. Тип `ByteStream` оборачивает входящие байты в тип `Bytes`, в то время как `TextStream` гарантирует, что они являются корректным utf-8 текстом.

Вы можете использовать любую кодировку при условии, что она реализует трейт `Encoding`.

```rust
pub trait Encoding {
    fn content_type() -> &'static str;
    fn stream_content_type() -> &'static str;
    fn to_bytes(data: impl Serialize) -> Option<Bytes>;
    fn from_bytes<O: DeserializeOwned>(bytes: Bytes) -> Option<O>;
}
```

Dioxus предоставляет ряд встроенных кодировок:

- JsonEncoding: JSON-текст, закодированный в строку
- CborEncoding: Бинарные данные в формате [CBOR](https://cbor.io)
- PostcardEncoding: Бинарная кодировка, построенная на [Postcard](https://docs.rs/postcard/latest/postcard/), предназначенная для использования в no_std приложениях
- MsgPackEncoding: Компактная бинарная кодировка в формате [«JSON, но меньше»](https://msgpack.org/index.html)

По мере прибытия каждого элемента в потоке он будет соответствующим образом фрагментирован и затем десериализован с использованием реализаций `from_bytes` и `to_bytes` кодировки.

Это означает, что мы можем передавать произвольные данные — даже пользовательские структуры!

```rust
#[derive(Serialize, Deserialize, Debug)]
struct Dog {
    name: String,
    age: u8,
}

/// Пользовательский эндпоинт `Streaming<T, E>`, который передаёт JSON-кодированные структуры `Dog` клиенту.
///
/// Dioxus предоставляет тип `JsonEncoding`, который может использоваться для кодирования и декодирования JSON-данных.
#[get("/api/json_stream")]
async fn json_stream() -> Result<Streaming<Dog, JsonEncoding>> {
    Ok(Streaming::spawn(|tx| async move {
        for count in 0..10 {
            let dog = Dog {
                name: format!("Dog {}", count),
                age: (count % 10) as u8,
            };

            if tx.unbounded_send(dog).is_err() {
                break;
            }

            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        }
    }))
}
```

## Потоки файлов

Последний тип потока, `FileStream`, — это специальный тип потока, *не* построенный на `Streaming<T, E>`. Потоки файлов используют нативные для платформы оптимизации для эффективной передачи файлов без буферизации всего файла в памяти.

Мы можем создать объект `FileStream` различными способами. Например, мы можем использовать `from_path` для эффективной передачи произвольных файлов из файловой системы сервера:

```rust
/// Этот эндпоинт использует `file!()` для возврата `PathBuf` текущего файла
#[get("/api/download_as_filestream")]
async fn download_as_filestream() -> Result<FileStream> {
    Ok(FileStream::from_path(file!()).await?)
}
```

Тип `FileStream` может быть создан из типа `FileData` из dioxus-html. Это упрощает добавление потоковой загрузки файлов в ваше приложение из HTML-элементов `<input />` и `<form />`:

```rust
// Наш клиентский компонент вызывает эндпоинт с помощью `file.into()`
fn app() -> Element {
    rsx! {
        h3 { "Загрузка как FileUpload" }
        div {
            ondragover: move |evt| evt.prevent_default(),
            ondrop: move |evt| async move {
                evt.prevent_default();
                for file in files {
                    _ = upload_file_as_filestream(file.into()).await;
                }
            },
            "Перетащите файлы сюда"
        }
    }
}

// Наш серверный эндпоинт принимает `FileStream`
#[post("/api/upload_as_file_stream")]
async fn upload_file_as_filestream(mut upload: FileStream) -> Result<()> {
    ...
}
```

Тип `FileStream` также устанавливает дополнительные заголовки, такие как `Content-Disposition` и `X-Content-Size`, которые дают серверному эндпоинту больше информации для эффективной обработки загрузки.
