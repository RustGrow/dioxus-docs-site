---
title: Десктоп
---

# Десктоп

Это руководство охватывает концепции, специфичные для десктопного рендерера Dioxus.

Приложения, собранные с помощью Dioxus Desktop, используют системный WebView для рендеринга страницы. Это делает итоговый размер приложения значительно меньше, чем у других рендереров WebView (обычно менее 5 МБ).

Хотя десктопные приложения рендерятся в WebView, ваш код Rust выполняется нативно. Это означает, что браузерные API *недоступны*, поэтому рендеринг WebGL, Canvas и т.д. не так прост, как в вебе. Однако нативные системные API *доступны*, поэтому стриминг, WebSockets, файловая система и т.д. легко доступны через системные API.

Dioxus Desktop построен поверх [wry](https://github.com/tauri-apps/wry), библиотеки Rust для создания десктопных приложений с WebView.

> В будущем мы планируем перейти на собственный DOM-рендерер на основе веб-рендерера с интеграцией WGPU ([Blitz](https://github.com/DioxusLabs/blitz)).

## Примеры

- [File Explorer](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/file-explorer#readme)
- [Tailwind App](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind#readme)

[![Скриншот Tailwind App](/assets/static/tailwind_desktop_app.png)](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind#readme)

## Запуск JavaScript

Dioxus предоставляет функцию `document::eval` для выполнения JavaScript-кода в вашем приложении. Подробнее см. в [руководстве по интеропу с JavaScript](../../guides/utilities/eval.md).

## Пользовательские ресурсы

Вы можете ссылаться на локальные ресурсы в Dioxus Desktop вместо использования URL:

```rust
use dioxus::prelude::*;

fn main() {
    launch(app);
}

fn app() -> Element {
    rsx! {
        div {
            img { src: asset!("/assets/static/scanner.png") }
        }
    }
}
```

## Диалоги выбора файлов

Начиная с Dioxus 0.7.1, диалоги выбора файлов на десктопе стали **асинхронными** вместо синхронных. Это предотвращает зависание UI во время выбора файла:

```rust
use dioxus::prelude::*;

fn app() -> Element {
    let mut file_content = use_signal(|| String::new());

    rsx! {
        button {
            onclick: move |_| async move {
                if let Some(path) = rfd::AsyncFileDialog::new().pick_file().await {
                    if let Ok(content) = tokio::fs::read_to_string(path.path()).await {
                        file_content.set(content);
                    }
                }
            },
            "Выбрать файл"
        }
        pre { "{file_content}" }
    }
}
```

> **Примечание:** Диалоги выбора файлов требуют fallback вроде `zenity` на Linux, если `rfd` не может найти нативную реализацию диалога.

## Интеграция с Wry

В случаях, когда вам нужен более низкоуровневый контроль над окном, вы можете использовать API wry, доступные через [Desktop Config](https://docs.rs/dioxus-desktop/latest/dioxus_desktop/struct.Config.html) и [хук use_window](https://docs.rs/dioxus-desktop/latest/dioxus_desktop/fn.use_window.html)
