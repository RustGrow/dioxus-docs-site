---
title: Загрузка данных
---

# Загрузка данных

## Добавление зависимостей

Dioxus не предоставляет встроенных утилит для загрузки данных. Существуют крейты вроде [dioxus-query](https://github.com/marc2332/dioxus-query), но для этого туториала мы реализуем загрузку данных с нуля.

Сначала нам нужно добавить две новые зависимости в наше приложение: [serde](https://crates.io/crates/serde) и [reqwest](https://crates.io/crates/reqwest).

- Reqwest предоставляет HTTP-клиент для загрузки.
- Serde позволит нам вывести JSON Deserializer для декодирования ответа.

В новом окне терминала добавьте эти крейты в ваше приложение с помощью `cargo add`.

```bash
cargo add reqwest --features json
cargo add serde --features derive
```

## Определение типа ответа

Мы будем использовать потрясающий [dog.ceo/dog-api](https://dog.ceo/dog-api/) для загрузки изображений собак для *HotDog*. К счастью, ответ API довольно просто десериализовать. Давайте создадим новую Rust-структуру, которая соответствует формату API, и выведем `Deserialize` для нее.

Документация Dog API описывает образец ответа API:
```json
{
    "message": "https://images.dog.ceo/breeds/leonberg/n02111129_974.jpg",
    "status": "success"
}
```

Наша Rust-структура должна соответствовать этому формату, хотя пока мы будем включать только поле "message".
```rust
#[derive(serde::Deserialize)]
struct DogApi {
    message: String,
}
```

## Использование `reqwest` и `async`

Dioxus имеет отличную поддержку асинхронного Rust. Мы можем просто преобразовать наш обработчик `onclick` в `async`, а затем установить `img_src` после того, как future будет разрешен.

<video src="/assets/06_docs/fetch-dog.mp4" controls></video>

Изменения в нашем коде довольно просты — просто добавьте вызов `reqwest::get`, а затем вызовите `.set()` на `img_src` с результатом.

```rust
#[component]
    fn DogView() -> Element {
        let mut img_src = use_signal(|| "".to_string());

        let save = move |_| async move {
            let response = reqwest::get("https://dog.ceo/api/breeds/image/random")
                .await
                .unwrap()
                .json::<DogApi>()
                .await
                .unwrap();

            img_src.set(response.message);
        };

..

        rsx! {
            div { id: "dogview",
                img { src: "{img_src}" }
            }
            div { id: "buttons",
..
                button { onclick: save, id: "save", "save!" }
            }
        }
    }
```

Dioxus автоматически вызывает `dioxus::spawn` на асинхронных замыканиях. Вы также можете использовать `dioxus::spawn` для выполнения async-работы *без* async-замыканий — просто вызовите `dioxus::spawn()` на любом async-блоке. Futures, созданные с помощью `dioxus::spawn`, автоматически выполняются на текущем async-исполнителе и удаляются автоматически.

```rust
rsx! {
            button {
                onclick: move |_| {
                    spawn(async move {
// do some async work...
                    });
                }
            }
        }
```

Futures, переданные в `dioxus::spawn`, не могут заимствовать данные извне async-блока. Данные, которые являются `Copy`, *могут* быть захвачены async-блоками, но все остальные данные должны быть *перемещены*, обычно путем вызова `.clone()`.

## Загрузка данных с помощью `use_resource`

В конечном итоге использование голого `async` может привести к состояниям гонки и странным багам состояния. Например, если пользователь слишком быстро нажимает кнопку *fetch*, то два запроса будут выполняться параллельно. Если запрос обновляет данные где-то еще, неправильный запрос может завершиться раньше и вызвать состояние гонки.

В Dioxus *Resources* — это части состояния, чье значение зависит от завершения некоторой асинхронной работы. Хук `use_resource` предоставляет объект `Resource` с полезными методами для запуска, остановки, паузы и модификации асинхронного состояния.

Давайте изменим наш компонент на использование resource:

```rust
#[component]
    fn DogView() -> Element {
        let mut img_src = use_resource(|| async move {
            reqwest::get("https://dog.ceo/api/breeds/image/random")
                .await
                .unwrap()
                .json::<DogApi>()
                .await
                .unwrap()
                .message
        });

        rsx! {
            div { id: "dogview",
                img { src: img_src.cloned().unwrap_or_default() }
            }
            div { id: "buttons",
                button { onclick: move |_| img_src.restart(), id: "skip", "skip" }
                button { onclick: move |_| img_src.restart(), id: "save", "save!" }
            }
        }
    }
```

Resources очень мощны: они интегрируются с Suspense, Streaming HTML, реактивностью и многим другим.

Детали API `Resource` не так уж важны прямо сейчас, но вы будете часто использовать Resources в более крупных приложениях, поэтому неплохо бы [прочитать документацию](https://docs.rs/dioxus-hooks/latest/dioxus_hooks/fn.use_resource.html).
