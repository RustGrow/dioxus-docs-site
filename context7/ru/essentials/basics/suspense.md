---
title: Suspense
---

# Suspense

[Ресурсы](../basics/resources.md) позволяют загружать данные асинхронно в Dioxus, но может быть громоздко обрабатывать состояние загрузки каждого ресурса индивидуально. Dioxus предоставляет компонент `SuspenseBoundary` для группировки нескольких асинхронных задач и показа представления загрузки, пока любая из них приостановлена.

Вы можете создать `SuspenseBoundary` с замыканием загрузки и дочерними элементами. Затем вы можете вызвать `.suspend()?` на любом ресурсе внутри дочерних элементов, чтобы приостановить рендеринг этого компонента до завершения future. Граница suspense будет показывать представление загрузки, пока любой из ее дочерних элементов приостановлен. Как только suspense разрешается, она снова покажет дочерние элементы.

Мы можем использовать границу suspense, чтобы показать сетку различных пород собак, не обрабатывая каждое состояние загрузки индивидуально:

```rust
fn DogGrid() -> Element {
    rsx! {
        SuspenseBoundary {
            // When any child components (like BreedGallery) are suspended, this closure will
            // be called and the loading view will be rendered instead of the children
            fallback: |_| rsx! {
                div {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    align_items: "center",
                    justify_content: "center",
                    "Loading..."
                }
            },
            div {
                display: "flex",
                flex_direction: "column",
                BreedGallery {
                    breed: "hound"
                }
                BreedGallery {
                    breed: "poodle"
                }
                BreedGallery {
                    breed: "beagle"
                }
            }
        }
    }
}

#[component]
fn BreedGallery(breed: ReadSignal<String>) -> Element {
    let response = use_resource(move || async move {
        // Artificially slow down the request to make the loading indicator easier to seer
        gloo_timers::future::TimeoutFuture::new(1000).await;
        reqwest::Client::new()
            .get(format!("https://dog.ceo/api/breed/{breed}/images"))
            .send()
            .await?
            .json::<BreedResponse>()
            .await
    })
    // Calling .suspend()? will suspend the component and return early while the future is running
    .suspend()?;

    // Then you can just handle the happy path with the resolved future
    rsx! {
        div {
            display: "flex",
            flex_direction: "row",
            match &*response.read() {
                Ok(urls) => rsx! {
                    for image in urls.iter().take(3) {
                        img {
                            src: "{image}",
                            width: "100px",
                            height: "100px",
                        }
                    }
                },
                Err(err) => rsx! { "Failed to fetch response: {err}" },
            }
        }
    }
}
```

## Настройка представления загрузки из дочерних элементов

Если вам нужно изменить представление загрузки, пока загружается конкретная задача, вы можете предоставить другое представление загрузки с помощью метода `with_loading_placeholder`. Заполнитель загрузки, который вы возвращаете из метода, будет передан в границу suspense и может быть отрендерен вместо представления загрузки по умолчанию:

```rust
fn DogGrid() -> Element {
    rsx! {
        SuspenseBoundary {
            // The fallback closure accepts a SuspenseContext which contains
            // information about the suspended component
            fallback: |suspense_context: SuspenseContext| {
                rsx! {
                    div {
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        align_items: "center",
                        justify_content: "center",
                        "Loading..."
                    }
                }
            },
            div {
                display: "flex",
                flex_direction: "column",
                BreedGallery {
                    breed: "hound"
                }
                BreedGallery {
                    breed: "poodle"
                }
                BreedGallery {
                    breed: "beagle"
                }
            }
        }
    }
}

#[component]
fn BreedGallery(breed: ReadSignal<String>) -> Element {
    let response = use_resource(move || async move {
        gloo_timers::future::TimeoutFuture::new(breed().len() as u32 * 100).await;
        reqwest::Client::new()
            .get(format!("https://dog.ceo/api/breed/{breed}/images"))
            .send()
            .await?
            .json::<BreedResponse>()
            .await
    })
    .suspend()?;

    // Then you can just handle the happy path with the resolved future
    rsx! {
        div {
            display: "flex",
            flex_direction: "row",
            match &*response.read() {
                Ok(urls) => rsx! {
                    for image in urls.iter().take(3) {
                        img {
                            src: "{image}",
                            width: "100px",
                            height: "100px",
                        }
                    }
                },
                Err(err) => rsx! { "Failed to fetch response: {err}" },
            }
        }
    }
}
```

## Suspense с Fullstack

Dioxus fullstack будет ожидать приостановленные futures во время серверного рендеринга. Это означает, что ваша асинхронная загрузка данных начинается раньше, и поисковые системы могут видеть разрешенную версию вашей страницы. Однако использование suspense в fullstack требует некоторых изменений для совместимости с гидратацией.

Чтобы использовать suspense в вашем fullstack приложении, вам нужно переключить каждый приостановленный ресурс на хук `use_server_future`. `use_server_future` обрабатывает сериализацию результата future на сервере и десериализацию этого результата на клиенте. Он также приостанавливается автоматически, поэтому вам не нужно вызывать `.suspend()` на ресурсе.

```rust
#[component]
fn BreedGallery(breed: ReadOnlySignal<String>) -> Element {
    // use_server_future is very similar to use_resource, but the value returned from the future
    // must implement Serialize and Deserialize and it is automatically suspended
    let response = use_server_future(move || async move {
        // The future will run on the server during SSR and then get sent to the client
        reqwest::Client::new()
            .get(format!("https://dog.ceo/api/breed/{breed}/images"))
            .send()
            .await
            reqwest::Result does not implement Serialize, so we need to map it to a string which
            // can be serialized
            .map_err(|err| err.to_string())?
            .json::<BreedResponse>()
            .await
            .map_err(|err| err.to_string())
        // use_server_future calls `suspend` internally, so you don't need to call it manually, but you
        // do need to bubble up the suspense variant with `?`
    })?;

    // If the future was still pending, it would have returned suspended with the `?` above
    // we can unwrap the None case here to get the inner result
    let response_read = response.read();
    let response = response_read.as_ref().unwrap();

    // Then you can just handle the happy path with the resolved future
    rsx! {
        div {
            display: "flex",
            flex_direction: "row",
            match response {
                Ok(urls) => rsx! {
                    for image in urls.iter().take(3) {
                        img {
                            src: "{image}",
                            width: "100px",
                            height: "100px",
                        }
                    }
                },
                Err(err) => rsx! { "Failed to fetch response: {err}" },
            }
        }
    }
}
```

В отличие от `use_resource`, `use_server_future` является реактивным только в замыкании, а не в самом future. Если вам нужно подписаться на другое реактивное значение, вам нужно прочитать его в замыкании, прежде чем передавать его в future:

```rust
let id = use_signal(|| 0);
// ❌ The future inside of use_server_future is not reactive
use_server_future(move || {
    async move {
        // But the future is not reactive which means that the future will not subscribe to any reads here
        println!("{id}");
    }
});
// ✅ The closure that creates the future for use_server_future is reactive
use_server_future(move || {
    // The closure itself is reactive which means the future will subscribe to any signals you read here
    let cloned_id = id();
    async move {
        // But the future is not reactive which means that the future will not subscribe to any reads here
        println!("{cloned_id}");
    }
});
```

### Стриминг Suspense

Поведение по умолчанию для серверного рендеринга — ожидать завершения всех приостановленных futures, а затем отправить полностью разрешенную страницу. Если вы [включите](https://docs.rs/dioxus/0.7/dioxus/prelude/struct.ServeConfigBuilder.html#method.enable_out_of_order_streaming) out of order streaming, dioxus будет отправлять готовые HTML-чанки клиенту по одному за раз по мере их разрешения. Это позволяет вам показывать представления загрузки в ваших границах suspense, пока вы все еще ждете завершения других futures на сервере:

```rust
fn main() {
    dioxus::LaunchBuilder::new()
        .with_context(server_only! {
            // Enable out of order streaming during SSR
            dioxus::server::ServeConfig::builder().enable_out_of_order_streaming()
        })
        .launch(DogGrid);
}
```

<video src="/assets/06_docs/streaming_dogs.mp4" controls></video>

Для получения дополнительной информации о стриминге см. [документацию по стримингу](../../essentials/fullstack/streaming.md).
