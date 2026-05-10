---
title: Выход из абстракции
---

# Выход за пределы Dioxus

Dioxus упрощает создание реактивных пользовательских интерфейсов. Однако бывают случаи, когда вам может понадобиться выйти за рамки реактивной парадигмы, чтобы взаимодействовать с DOM напрямую.

## Взаимодействие с JavaScript с помощью `eval` и `web-sys`

Dioxus предоставляет ограниченный набор [веб-API](https://developer.mozilla.org/en-US/docs/Web/API) с более удобным интерфейсом. Если вам нужен доступ к большему количеству API, вы можете использовать функцию `eval` для запуска JavaScript в браузере.


Например, вы можете использовать функцию eval для чтения домена текущей страницы:

```rust
pub fn Eval() -> Element {
        let mut domain = use_signal(String::new);
        rsx! {
            button {
// When you click the button, some javascript will run in the browser
// to read the domain and set the signal
                onclick: move |_| async move {
                    domain.set(document::eval("return document.domain").await.unwrap().to_string());
                },
                "Read Domain"
            }
            "Current domain: {domain}"
        }
    }
```

Если вы ориентируетесь только на веб, вы также можете использовать крейт [`web-sys`](https://crates.io/crates/web-sys) для типизированного доступа к веб-API. Вот как выглядит чтение домена с помощью web-sys:

```rust
use ::web_sys::window;
    use wasm_bindgen::JsCast;
    pub fn WebSys() -> Element {
        let mut domain = use_signal(String::new);
        rsx! {
            button {
// When you click the button, we use web-sys to read the domain and a signal
                onclick: move |_| {
                    domain
                        .set(
                            window()
                                .unwrap()
                                .document()
                                .unwrap()
                                .dyn_into::<::web_sys::HtmlDocument>()
                                .unwrap()
                                .domain(),
                        );
                },
                "Read Domain"
            }
            "Current domain: {domain}"
        }
    }
```

## Синхронизация обновлений DOM с помощью `use_effect`

Если вам нужно взаимодействовать с DOM напрямую, вы должны делать это в хуке `use_effect`. Этот хук выполнится после того, как компонент отрендерится и весь UI Dioxus будет отображён. Вы можете читать или изменять DOM в этом хуке.


Например, вы можете использовать хук `use_effect` для записи в элемент canvas после его создания:

```rust
pub fn Canvas() -> Element {
        let mut count = use_signal(|| 0);

        use_effect(move || {
// Effects are reactive like memos, and resources. If you read a value inside the effect, the effect will rerun when that value changes
            let count = count.read();

// You can use the count value to update the DOM manually
            document::eval(&format!(
                r#"var c = document.getElementById("dioxus-canvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = "30px Arial";
    ctx.fillText("{count}", 10, 50);"#
            ));
        });

        rsx! {
            button {
// When you click the button, count will be incremented and the effect will rerun
                onclick: move |_| count += 1,
                "Increment"
            }
            canvas { id: "dioxus-canvas" }
        }
    }
```

## Получение доступа к элементам с помощью `onmounted`

Если вам нужна ссылка на элемент, отрендеренный dioxus, вы можете использовать событие `onmounted`. Это событие сработает после того, как элемент впервые будет смонтирован в DOM. Оно возвращает живую ссылку на элемент с некоторыми методами для взаимодействия с ним.


Вы можете использовать событие onmounted для таких действий, как фокусировка или прокрутка к элементу после его рендеринга:

```rust
pub fn OnMounted() -> Element {
        let mut input_element = use_signal(|| None);

        rsx! {
            div { height: "100px",
                button {
                    class: "focus:outline-2 focus:outline-blue-600 focus:outline-dashed",
// The onmounted event will run the first time the button element is mounted
                    onmounted: move |element| input_element.set(Some(element.data())),
                    "First button"
                }

                button {
// When you click the button, if the button element has been mounted, we focus to that element
                    onclick: move |_| async move {
                        if let Some(header) = input_element() {
                            let _ = header.set_focus(true).await;
                        }
                    },
                    "Focus first button"
                }
            }
        }
    }
```

## Приведение событий web-sys

Dioxus предоставляет платформонезависимые обёртки над каждым типом события. Эти обёртки часто удобнее взаимодействовать, чем сырые типы событий, но они могут быть более ограниченными. Если вы ориентируетесь на веб, вы можете привести событие с помощью метода `as_web_event` к базовому событию web-sys:

```rust
pub fn Downcast() -> Element {
        let mut event_text = use_signal(|| 0);

        rsx! {
            div {
                onmousemove: move |event| {
                    #[cfg(feature = "web")]
                    {
                        use dioxus::web::WebEventExt;
                        event_text.set(event.as_web_event().movement_x());
                    }
                },
                "movement_x was {event_text}"
            }
        }
    }
```
