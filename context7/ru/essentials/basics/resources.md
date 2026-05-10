---
title: Загрузка Данных
---

# Загрузка Данных

Одна из самых распространенных асинхронных операций в приложениях — выполнение сетевых запросов. Это руководство охватывает, как загружать данные в Dioxus, как избегать водопадов (waterfalls), и использование библиотек для управления кэшированием и инвалидацией запросов.

Хуки и техники, которые мы рассматриваем здесь, построены поверх примитивов Future и Signal.

## Зависимости Библиотек

Хотя Dioxus не предоставляет встроенный HTTP-клиент, вы можете использовать популярную библиотеку [reqwest](https://docs.rs/reqwest/latest/reqwest/) для выполнения асинхронных сетевых запросов. Мы будем использовать библиотеку reqwest в примерах на этой странице. Прежде чем начать, убедитесь, что добавили библиотеки `reqwest` и `serde` в ваш `Cargo.toml`:

```sh
cargo add reqwest --features json
cargo add serde --features derive
```

Ваш Cargo.toml должен содержать библиотеки reqwest и serde:
```toml
[dependencies]
# ... dioxus и другие зависимости
reqwest = { version = "*", features = ["json"] }
serde = { version = "1", features = ["derive"] }
```

Мы планируем в конечном итоге интегрировать библиотеку вроде [dioxus-query](https://crates.io/crates/dioxus-query) непосредственно в Dioxus для лучшей интеграции с роутером приложения.

## Запросы из Обработчиков Событий

Самый простой способ запросить данные — просто прикрепить асинхронное замыкание к EventHandler.

```rust
#[derive(serde::Deserialize)]
struct DogApi {
    message: String,
}

let mut img_src = use_signal(|| "image.png".to_string());

let fetch_new = move |_| async move {
    let response = reqwest::get("https://dog.ceo/api/breeds/image/random")
        .await
        .unwrap()
        .json::<DogApi>()
        .await
        .unwrap();

    img_src.set(response.message);
};

rsx! {
    img { src: img_src }
    button { onclick: fetch_new, "Fetch a new dog!" }
}
```

Всякий раз, когда пользователь нажимает кнопку, замыкание `fetch_new` срабатывает, запускается новый Future, и выполняется сетевой запрос. Когда ответ получен, мы устанавливаем `img_src` в возвращенное значение.

К сожалению, загрузка данных не всегда так проста. Если пользователь быстро нажимает кнопку загрузки, одновременно выполняется несколько запросов, и источник изображения перезаписывается несколько раз. Чтобы смягчить это, мы можем добавить "loading" Сигнал для предотвращения множественных запросов:

```rust
let mut img_src = use_signal(|| "image.png".to_string());
let mut loading = use_signal(|| false);

let fetch_new = move |_| async move {
    if loading() {
        return;
    }

    loading.set(true);
    let response = reqwest::get("https://dog.ceo/api/breeds/image/random")
        .await
        .unwrap()
        .json::<DogApi>()
        .await
        .unwrap();

    img_src.set(response.message);
    loading.set(false);
};

...
```

Ручная обработка крайних случаев загрузки данных может быть утомительной, поэтому мы построили более общее решение для futures с помощью `use_resource`.

## Асинхронное Состояние с `use_resource`

Хук [`use_resource`](https://docs.rs/dioxus-hooks/latest/dioxus_hooks/fn.use_resource.html) может использоваться для *выведения* асинхронного состояния. Эта функция принимает асинхронное замыкание, которое возвращает Future. Пока future опрашивается, `use_resource` отслеживает вызовы `.read()` любых содержащихся Signals. Если другое действие вызывает `.write()` на отслеживаемых сигналах, `use_resource` немедленно перезапускается.

```rust
let mut breed = use_signal(|| "hound".to_string());
    let dogs = use_resource(move || async move {
        reqwest::Client::new()
            // Since breed is read inside the async closure, the resource will subscribe to the signal
            // and rerun when the breed is written to
            .get(format!("https://dog.ceo/api/breed/{breed}/images"))
            .send()
            .await?
            .json::<BreedResponse>()
            .await
    });

    rsx! {
        input {
            value: "{breed}",
            // When the input is changed and the breed is set, the resource will rerun
            oninput: move |evt| breed.set(evt.value()),
        }

        div {
            display: "flex",
            flex_direction: "row",
            // You can read resource just like a signal. If the resource is still
            // running, it will return None
            if let Some(response) = &*dogs.read() {
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
            } else {
                "Loading..."
            }
        }
    }
```

Хук `use_resource` может выглядеть похоже на хук `use_memo`. В отличие от `use_memo`, вывод ресурса не мемоизируется с помощью `PartialEq`. Это означает, что любые компоненты/реактивные хуки, которые читают вывод, будут перезапускаться, если future перезапустится, даже если возвращаемое значение будет таким же:

```rust
let mut number = use_signal(|| 0);

// Resources rerun any time their dependencies change. They will
// rerun any reactive scopes that read the resource when they finish
// even if the value hasn't changed
let halved_resource = use_resource(move || async move { number() / 2 });

    log!("Component reran");

    rsx! {
        button {
            onclick: move |_| number += 1,
            "Increment"
        }
        p {
            if let Some(halved) = halved_resource() {
                "Halved: {halved}"
            } else {
                "Loading..."
            }
        }
    }
```

## Состояние Ресурса

Ресурсы возвращают значение на основе некоторого существующего состояния. Вы можете читать состояние ресурса, чтобы проверить, выполняется ли future, завершился ли он или был остановлен:

```rust no_run
let mut count = use_signal(|| 1);
let double_count = use_resource(move || async move {
    let response = reqwest::get(format!("https://myserver.com/doubleme?count={count}")).await.unwrap();
    response.text().await.unwrap()
});

// Вызов .state() на ресурсе вернет Signal<UseResourceState> с информацией о текущем статусе ресурса
println!("{:?}", double_count.state().read()); // Печатает "UseResourceState::Pending"

// Вы также можете попробовать получить последнее разрешенное значение ресурса с помощью метода .value()
println!("{:?}", double_count.read()); // Печатает "None"
```

## С Нереактивными Зависимостями

`use_resource` может автоматически определять зависимости с любым реактивным значением (Signals, ReadSignals, Memos, Resources и т.д.). Если вам нужно перезапустить future, когда изменяется обычное Rust-значение, вы можете добавить его как зависимость с помощью хука `use_reactive`:

```rust
#[component]
fn Comp(count: u32) -> Element {
    // Мы вручную добавляем ресурс в список зависимостей с помощью хука `use_reactive`
    // Каждый раз, когда `count` меняется, ресурс перезапустится
    let new_count = use_resource(use_reactive!(|(count,)| async move {
        sleep(100).await;
        // count + 1
    }));
    rsx! { "{new_count:?}" }
}

// Если ваше значение уже реактивно, вам никогда не нужно вызывать `use_reactive` вручную
// Вместо ручного добавления count в список зависимостей, вы можете сделать ваш проп реактивным, обернув его в `ReadSignal`
#[component]
fn ReactiveComp(count: ReadSignal<u32>) -> Element {
    // Поскольку `count` реактивен, ресурс автоматически знает, что нужно перезапуститься, когда `count` меняется
    let new_count = use_resource(move || async move {
        sleep(100).await;
        count() + 1
    });
    rsx! { "{new_count:?}" }
}
```

## Отличия от `use_future` и `use_memo`

Так же как и `use_future`, `use_resource` запускает асинхронную задачу в компоненте. Однако, в отличие от `use_future`, `use_resource` возвращает результат future и перезапустится при изменении любых зависимостей.

Ресурсы возвращают значение на основе некоторого существующего состояния, точно так же, как мемо, но в отличие от мемо, ресурсы не мемоизируют вывод замыкания. Они всегда будут перезапускать любые части вашего приложения, которые читают значение ресурса, когда future разрешается, даже если вывод не изменился.

> Примечание: Future, переданный в `use_resource`, должен быть cancel safe (безопасным к отмене). Cancel-safe futures — это futures, которые можно остановить в любой точке await без возникновения проблем. Например, эта задача не является cancel safe:
>
> ```rust
static RESOURCES_RUNNING: GlobalSignal<HashSet<String>> = Signal::global(|| HashSet::new());
    let mut breed = use_signal(|| "hound".to_string());
    let dogs = use_resource(move || async move {
    // Modify some global state
    RESOURCES_RUNNING.write().insert(breed());

    // Wait for a future to finish. The resource may cancel
    // without warning if breed is changed while the future is running. If
    // it does, then the breed pushed to RESOURCES_RUNNING will never be popped
    let response = reqwest::Client::new()
            .get(format!("https://dog.ceo/api/breed/{breed}/images"))
            .send()
            .await?
            .json::<BreedResponse>()
            .await;

    // Restore some global state
    RESOURCES_RUNNING.write().remove(&breed());

        response
    });
```
> ```
>
>
>
> Это можно исправить, убедившись, что глобальное состояние восстановлено при удалении future:
> ```rust
static RESOURCES_RUNNING: GlobalSignal<HashSet<String>> = Signal::global(|| HashSet::new());
    let mut breed = use_signal(|| "hound".to_string());
    let dogs = use_resource(move || async move {
    // Modify some global state
    RESOURCES_RUNNING.write().insert(breed());

    // Automatically restore the global state when the future is dropped, even if
    // it isn't finished
        struct DropGuard(String);
        impl Drop for DropGuard {
            fn drop(&mut self) {
                RESOURCES_RUNNING.write().remove(&self.0);
            }
        }
        let _guard = DropGuard(breed());

    // Wait for a future to finish. The resource may cancel
    // without warning if breed is changed while the future is running. If
    // it does, then it will be dropped and the breed will be popped
    reqwest::Client::new()
            .get(format!("https://dog.ceo/api/breed/{breed}/images"))
            .send()
            .await?
            .json::<BreedResponse>()
            .await
    });
```
> ```
>
>
> Асинхронные методы часто упоминают в документации, являются ли они безопасными к отмене.

## Асинхронное Состояние с `use_loader`

Хук `use_resource` отлично подходит для загрузки произвольных значений. Однако работа с ресурсами, возвращающими результаты, может быть немного громоздкой. В некоторых случаях хук `use_loader` является лучшим выбором.

Хук `use_loader` разработан для работы с реактивными futures, возвращающими `Result<T, E>`. Вместо возврата `Resource<T>`, как `use_resource`, хук `use_loader` *фактически* возвращает `Result<Loader<T>, Loading>`. Тип возврата `Loading` тесно интегрируется с Границами Ошибок (Error Boundaries) и Suspense — оба очень полезны при серверном рендеринге (SSR).

Поскольку `use_loader` возвращает Result, вы можете использовать синтаксис `?` для раннего возврата, если ресурс находится в ожидании или завершился с ошибкой:

```rust
// Загружаем список пород из Dog API, используя синтаксис `?` для приостановки или выбрасывания ошибок
let breed_list = use_loader(move || async move {
    reqwest::get("https://dog.ceo/api/breeds/list/all")
        .await?
        .json::<ListBreeds>()
        .await
})?;
```

Как правило, мы рекомендуем использовать `use_resource` при клиентской загрузке данных и `use_loader` при гибридной клиент/сервер загрузке.

## Избегание Водопадов

Одна распространенная проблема при загрузке данных — эффект "водопада", когда запросы выполняются последовательно. Это может привести к медленному времени загрузки и плохому пользовательскому опыту. Чтобы избежать водопадов, вы можете поднять логику загрузки данных на более высокий уровень в дереве компонентов и избегать раннего возврата перед завершением несвязанных запросов.

Давайте посмотрим на приложение, которое вызывает эффект водопада:

```rust
fn fetch_dog_image(
        breed: impl Display,
    ) -> impl Future<Output = dioxus::Result<String, CapturedError>> {
        async move {
            let response = reqwest::get(format!("https://dog.ceo/api/breed/{breed}/images/random"))
                .await?
                .json::<DogApi>()
                .await?;
            Ok(response.message)
        }
    }

    #[component]
    fn DogView() -> Element {
        let poodle_img = use_resource(|| fetch_dog_image("poodle"));

        let poodle_img = match poodle_img() {
            Some(Ok(src)) => src,
            _ => {
                return rsx! {
                    p { "Loading or error..." }
                };
            }
        };

        let golden_retriever_img = use_resource(|| fetch_dog_image("golden retriever"));

        let golden_retriever_img = match golden_retriever_img() {
            Some(Ok(src)) => src,
            _ => {
                return rsx! {
                    p { "Loading or error..." }
                };
            }
        };

        let pug_img = use_resource(|| fetch_dog_image("pug"));

        let pug_img = match pug_img() {
            Some(Ok(src)) => src,
            _ => {
                return rsx! {
                    p { "Loading or error..." }
                };
            }
        };

        rsx! {
            div {
                h1 { "Dog Images" }
                img { src: "{poodle_img}" }
                img { src: "{golden_retriever_img}" }
                img { src: "{pug_img}" }
            }
        }
    }
```

В этом примере мы возвращаемся раньше времени из компонента, когда любой из запросов все еще загружается. Запрос на изображение золотистого ретривера и мопса не начнется, пока не загрузится изображение пуделя, вызывая эффект водопада.

![эффект водопада](/assets/07/waterfall_effect.png)

Мы можем избежать этой проблемы, переместив все ранние возвраты после начала загрузки данных для всех трех изображений. Таким образом, все запросы начнутся одновременно, что означает, что они могут выполняться параллельно:

```rust
let poodle_img = use_resource(|| fetch_dog_image("poodle"));
        let golden_retriever_img = use_resource(|| fetch_dog_image("golden retriever"));
        let pug_img = use_resource(|| fetch_dog_image("pug"));

        let poodle_img = match poodle_img() {
            Some(Ok(src)) => src,
            _ => {
                return rsx! {
                    p { "Loading or error..." }
                };
            }
        };
        let golden_retriever_img = match golden_retriever_img() {
            Some(Ok(src)) => src,
            _ => {
                return rsx! {
                    p { "Loading or error..." }
                };
            }
        };
        let pug_img = match pug_img() {
            Some(Ok(src)) => src,
            _ => {
                return rsx! {
                    p { "Loading or error..." }
                };
            }
        };

        rsx! {
            div {
                h1 { "Dog Images" }
                img { src: "{poodle_img}" }
                img { src: "{golden_retriever_img}" }
                img { src: "{pug_img}" }
            }
        }
```

![нет эффекта водопада](/assets/07/no_waterfall_effect.png)

## Организация Загрузки Данных

Хотя может быть заманчиво размещать вызовы `use_resource` *везде* в вашем приложении, мы настоятельно рекомендуем ограничиваться лишь несколькими источниками загрузки данных. Как правило, легче рассуждать о централизованных состояниях загрузки, чем о многих фрагментированных источниках.

По мере добавления большего количества источников загрузки данных мы также добавляем большее количество комбинаций состояний загрузки. Если возможно, лучше загружать "имя" пользователя и "id" в *одном* запросе, а не в двух.

## Библиотеки для Загрузки Данных

`use_resource` — отличный способ загружать данные в Dioxus, но он может быть громоздким для управления сложными сценариями загрузки данных. Библиотеки, такие как [Dioxus query](https://docs.rs/dioxus-query/latest/dioxus_query/), предоставляют более продвинутые возможности для загрузки данных, такие как кэширование, инвалидация и polling. Мы не будем подробно рассматривать API этих библиотек здесь, но вы можете ознакомиться со списком [dioxus awesome](https://dioxuslabs.com/awesome/) для получения дополнительных библиотек, которые могут помочь вам с загрузкой данных.

## Связанные примеры

- [Dog App](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/dog_app.rs) — Загрузка пород собак и изображений из API
- [Weather App](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/weather_app.rs) — Просмотр прогноза погоды
- [Repo Readme](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/repo_readme.rs) — Просмотрщик README GitHub
- [Router Resource](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router_resource.rs) — Загрузка данных с маршрутизацией
