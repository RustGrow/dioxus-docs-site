---
title: Обработка Ошибок
---

# Обработка ошибок

Одно из главных преимуществ использования Rust для веб-разработки — его легендарная надежность. Распространенное мнение разработчиков, разворачивающих сервисы на Rust:

> "Мы развернули наш сервис на Rust и забыли про него, потому что он просто продолжал работать без каких-либо проблем"

Rust предоставляет разработчикам мощные инструменты для отслеживания мест возникновения ошибок и простые способы их обработки. Аналогично, в Dioxus мы предоставляем дополнительные инструменты, такие как ранние возвраты, специальный тип RenderError и ErrorBoundaries, чтобы помочь вам обрабатывать ошибки декларативным способом.

## Возврат Ошибок из Компонентов

Напомним, что компоненты Dioxus — это функции, которые принимают пропсы и возвращают `Element`. Проницательные наблюдатели могут заметить, что тип `Element` на самом деле является псевдонимом для `Result<VNode, RenderError>`!

Тип `RenderError` может быть создан из типа ошибки, реализующего `Error`. Вы можете использовать `?`, чтобы пробрасывать любые встреченные ошибки при рендеринге к ближайшей границе ошибок:

```rust
#[component]
    fn ThrowsError() -> Element {
// You can return any type that implements `Error`
        let number: i32 = use_hook(|| "1.234").parse()?;

        todo!()
    }
```

[`RenderError`](https://docs.rs/anyhow/latest/anyhow/) — это специальный тип ошибки, который является перечислением либо `Error(CapturedError)`, либо `Suspended(SuspendedFuture)`. `RenderError` автоматически реализует `From<CapturedError>`, который реализует `From<anyhow::Error>`.

```rust
/// Ошибка, которая может возникнуть при рендеринге компонента
#[derive(Debug, Clone, PartialEq)]
pub enum RenderError {
    /// Функция рендера вернулась раньше времени из-за ошибки.
    ///
    /// Мы захватили ошибку, обернули ее в Arc и сохранили здесь. Вы больше не можете изменить ошибку,
    /// но можете дешево передавать ее.
    Error(CapturedError),

    /// Компонент был приостановлен
    Suspended(SuspendedFuture),
}
```

Поскольку `RenderError` может быть автоматически приведен из `anyhow::Error`, мы можем использовать трейт `Context` из anyhow для пробрасывания любой ошибки при рендеринге:

```rust
fn Counter() -> Element {
    let count = "123".parse::<i32>().context("Could not parse input")?;

    ...
}
```

## CapturedError, RenderError и anyhow::Error

На протяжении всего стека Dioxus существует множество различных типов ошибок. Их большое количество может привести к путанице.

### anyhow::Error

В отличие от многих других библиотек, Dioxus использует `anyhow::Error` как свой основной тип ошибки. Во многих API, принимающих пользовательский код — таких как колбэки, действия и загрузчики — вы можете аккуратно использовать тип Error из anyhow:

```rust
let mut breed = use_action(move |breed| async move {
    let res = reqwest::get(format!("https://dog.ceo/api/breed/{breed}/images/random"))
        .await
        .context("Failed to fetch")?
        .json::<DogApi>()
        .await
        .context("Failed to deserialize")?;

    anyhow::Ok(res)
});
```

Многие API также либо принимают, либо возвращают ошибку anyhow. Вы можете использовать `anyhow::Result` как тип результата для серверной функции:

```rust
#[get("/dogs")]
async fn get_dogs() -> anyhow::Result<i32> {
    Ok(123)
}
```

Крейт anyhow предоставляет эргономичный, динамический тип ошибки, который может поглощать любые ошибки, реализующие трейт `std::Error`. Мы выбрали использование типа ошибки anyhow, так как он чисто интегрируется с более широкой экосистемой Rust. GUI-приложения могут встретить множество различных типов ошибок на своем пути, и лишь немногие из них стоят полной обработки с помощью выделенного варианта.

Если вам нужно привести ошибку anyhow к конкретному типу ошибки, вы можете использовать `.downcast_ref::<T>()`. Другие утилиты, такие как `.context()`, `anyhow!()` и `bail!()`, бесшовно работают с остальной частью Dioxus.

### Captured Error

`CapturedError` — это прозрачный тип-обертка вокруг ошибки anyhow, который заставляет ее реализовывать трейт `Clone`. Реализация довольно проста:

```rust
#[derive(Debug, Clone)]
pub struct CapturedError(pub Arc<anyhow::Error>);
```

Тип `CapturedError` полезен, когда вам нужно вызвать `.clone()` на ошибке, как это требуется `use_resource`. Хук `use_resource` требует, чтобы выводимое значение было `Clone` — но стандартный тип `anyhow::Error` таковым *не* является.

В случаях, когда вам нужен конкретный тип ошибки, например в загрузчиках и действиях, рассмотрите использование `dioxus::Ok()`, который вернет `Result<T, CapturedError>`:

```rust
let value = use_resource(|| async move {
    let res = fetch("/dogs")?;
    dioxus::Ok(res)
});
```

## Перехват ошибок с помощью ErrorBoundaries

В JavaScript вы могли использовать `try` и `catch` для выбрасывания и перехвата ошибок в вашем коде:

```js
try {
    // Код, который может выбросить ошибку
    let result = riskyOperation();
    console.log(result);
} catch (error) {
    // Обработка ошибки
    console.error("Something went wrong:", error.message);
}
```

В Dioxus вы можете использовать аналогичный подход try/catch внутри дерева компонентов с помощью границ ошибок (error boundaries). Границы ошибок позволяют перехватывать и обрабатывать ошибки, возникающие при рендеринге нашего приложения.

[Границы Ошибок](/assets/07/error-boundaries.png)

Когда вы возвращаете ошибку из компонента, она выбрасывается к ближайшей границе ошибок. Эта граница ошибок может затем обработать ошибку и отрендерить fallback UI с помощью замыкания handle_error:

```rust
#[component]
    fn Parent() -> Element {
        rsx! {
            ErrorBoundary {
// The error boundary accepts a closure that will be rendered when an error is thrown in any
// of the children
                handle_error: |_| {
                    rsx! { "Oops, we encountered an error. Please report this to the developer of this application" }
                },
                ThrowsError {}
            }
        }
    }
```

## Выбрасывание Ошибок из Обработчиков Событий

Помимо компонентов, вы можете выбрасывать ошибки из обработчиков событий. Если вы выбросите ошибку из обработчика события, она всплывет к ближайшей границе ошибок, точно так же, как и из компонента:

```rust
#[component]
    fn ThrowsError() -> Element {
        rsx! {
            button {
                onclick: move |_| {
// Event handlers can return errors just like components
                    let number: i32 = "1...234".parse()?;

                    tracing::info!("Parsed number: {number}");

                    Ok(())
                },
                "Throw error"
            }
        }
    }
```

Это полезно при обработке асинхронной работы или работы, которая часто завершается с ошибкой.

## Добавление контекста к ошибкам

Вы можете добавлять дополнительный контекст к вашим ошибкам с помощью трейта [`Context`](https://docs.rs/anyhow/latest/anyhow/trait.Context.html) из anyhow. Вызов `context` на `Result` добавит контекст к варианту ошибки `Result`:

```rust
#[component]
    fn ThrowsError() -> Element {
// You can call the context method on results to add more information to the error
        let number: i32 = use_hook(|| "1.234")
            .parse()
            .context("Failed to parse name")?;

        todo!()
    }
```

Если вам нужно показать какой-то специфический UI для ошибки, мы рекомендуем обернуть ошибку в пользовательский тип, а затем выполнить downcast при перехвате.

## Приведение к Конкретным Типам Ошибок (Downcasting)

При обработке ошибок в Границах Ошибок вы можете сопоставлять конкретные типы ошибок, опционально выбирая перехватить ошибку и предотвратить ее всплытие.

По умолчанию ошибки перехватываются ближайшей Границей Ошибок. В некоторых сценариях мы можем не захотеть перехватывать конкретный тип ошибки, например NetworkError.

В нашем коде обработчика мы можем использовать `.error()`, чтобы получить текущую ошибку, а затем перебросить ее при необходимости:

```rust
rsx! {
    ErrorBoundary {
        handle_error: |error: ErrorContext| {
            // Ошибки сети нужно обработать другой границей ошибок!
            if let Some(err) = error.error() {
                return Err(e.into())
            }

            // В противном случае, обрабатываем ошибку здесь
            rsx! {
                div { "Oops, we encountered an error" }
            }
        },
        ...
    }
}
```

## Локальная Обработка Ошибок

Если вам нужен более детальный контроль над состояниями ошибок, вы можете хранить ошибки в реактивных хуках и использовать их как любое другое значение. Например, если вам нужно показать ошибку валидации номера телефона, вы можете сохранить ошибку в мемо и показать ее под полем ввода, если оно невалидно:

```rust
#[component]
    pub fn PhoneNumberValidation() -> Element {
        let mut phone_number = use_signal(|| String::new());
        let parsed_phone_number = use_memo(move || phone_number().parse::<PhoneNumber>());

        rsx! {
            input {
                class: "border border-gray-300 rounded-md p-2 mb-4",
                placeholder: "Phone number",
                value: "{phone_number}",
                oninput: move |e| {
                    phone_number.set(e.value());
                },
            }

            match parsed_phone_number() {
                Ok(phone_number) => rsx! {
                    div {
                        "Parsed phone number: {phone_number}"
                    }
                },
                Err(error) => rsx! {
                    div {
                        "Phone number is invalid: {error}"
                    }
                }
            }
        }
    }
```


## Связанные примеры

- [Error Handling](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/error_handling.rs) — Обработка ошибок в компонентах
