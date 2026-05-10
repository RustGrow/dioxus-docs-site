---
title: Логирование
---

# Логирование

Dioxus поддерживает широкий спектр платформ, каждая со своими требованиями к логированию. Мы обсудим различные опции, доступные для ваших проектов.

## Логгер Dioxus

Dioxus предоставляет первичный логгер как часть `launch`. Это настраивает tracing subscriber, который чисто интегрируется с Dioxus CLI и платформами, такими как Web и Mobile. В режиме разработки установлен уровень трассировки `Debug`, а в релизе — только уровень `Info`.

```rust
use dioxus::prelude::*;

fn main() {
    dioxus::launch(|| {
        // Будет логировать только в режиме "dev"
        tracing::debug!("Rendering app!");

        // Будет логировать и в dev, и в release
        tracing::info!("Rendering app!");

        rsx! {}
    })
}
```

Чтобы переопределить значение по умолчанию или инициализировать логгер до `launch`, вы можете использовать функцию `init` самостоятельно:

Чтобы использовать Dioxus Logger, вызовите функцию `init()`:
```rs
use tracing::Level;

fn main() {
    // Инициализация логгера
    dioxus::logger::init(Level::INFO).expect("failed to init logger");

    // Код запуска Dioxus
    dioxus::launch(|| rsx! {})
}
```

## Крейт Tracing

Крейт [Tracing](https://crates.io/crates/tracing) — это интерфейс логирования, который использует dioxus-logger. Он не обязателен для использования, но вы не будете получать логи от библиотеки Dioxus.

Крейт Tracing предоставляет различные простые макросы, похожие на `println`, с разными уровнями серьёзности.
Доступные макросы следующие, с наивысшей серьёзностью снизу:
```rs
fn main() {
    tracing::trace!("trace");
    tracing::debug!("debug");
    tracing::info!("info");
    tracing::warn!("warn");
    tracing::error!("error");
}
```
Все логгеры, представленные на этой странице, помимо конфигурации и инициализации, используются через эти макросы. Часто вы также будете использовать `Level` enum из крейта Tracing. Этот enum обычно представляет максимальную серьёзность логов, которую вы хотите, чтобы ваше приложение выводило, и может быть загружен из различных источников, таких как файл конфигурации, переменная окружения и т.д.

Для получения дополнительной информации посетите [документацию](https://docs.rs/tracing/latest/tracing/) крейта Tracing.

## Особенности платформ

В вебе Dioxus Logger будет использовать [tracing-wasm](https://crates.io/crates/tracing-wasm). На десктопе и серверных целях Dioxus Logger будет использовать `FmtSubscriber` из [tracing-subscriber](https://crates.io/crates/tracing-subscriber).

## Просмотр логов

Логи Android отправляются в logcat. Чтобы использовать logcat через Android-отладчик, выполните:
```cmd
adb -d logcat
```
На вашем Android-устройстве должны быть включены параметры разработчика / отладка по USB.

Для получения дополнительной информации посетите [документацию](https://docs.rs/android_logger/latest/android_logger/) android_logger.

Логи iOS отправляются в oslog.

Для получения дополнительной информации посетите [oslog](https://crates.io/crates/oslog).

#### Заключительные замечания

Dioxus Logger — предпочтительный логгер для использования с Dioxus, если он соответствует вашим потребностям. Впереди ещё много функций. Если у вас есть какие-либо предложения по функциям или проблемы с Dioxus Logger, не стесняйтесь обращаться на [Dioxus Discord Server](https://discord.gg/XgGxMSkvUM)!

Для получения дополнительной информации посетите [документацию](https://docs.rs/dioxus-logger/latest/dioxus_logger/) Dioxus Logger.
