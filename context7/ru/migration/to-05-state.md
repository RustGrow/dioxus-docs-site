---
title: "Миграция: Состояние"
---

# Миграция состояния

Хуки `use_state` и `use_ref` были заменены хуком `use_signal`. Хук `use_signal` — это более гибкая и мощная версия хука `use_ref` с более умными скоупами, которые подписываются на сигнал только если он прочитан внутри скоупа.

С `use_state`, если у вас был такой код:
```rust
fn Parent(cx: Scope) -> Element {
	let state = use_state(cx, || 0);

	render! {
		Child {
			state: state.clone()
		}
	}
}

#[component]
fn Child(cx: Scope, state: UseState<i32>) -> Element {
	render! {
  "{state}"
	}
}
```

Родительский компонент перерисовывался каждый раз при изменении состояния, даже если только дочерний компонент использовал состояние. С новым хуком `use_signal` родительский компонент перерисуется только если состояние изменено внутри родительского компонента:

```rust
fn Parent() -> Element {
        let state = use_signal(|| 0);

        rsx! { Child { state } }
    }

    #[component]
    fn Child(state: Signal<i32>) -> Element {
        rsx! {"{state}"}
    }
```
Только дочерний компонент будет перерисовываться при изменении состояния, потому что только дочерний компонент читает состояние.

## Состояние на основе контекста

Хуки `use_shared_state_provider` и `use_shared_state` были заменены использованием хуков `use_context_provider` и `use_context` с `Signal`:

```rust
fn Parent() -> Element {
// Create a new signal and provide it to the context API
        let state = use_context_provider(|| Signal::new(0));

        rsx! { Child {} }
    }

    fn Child() -> Element {
// Get the state from the context API
        let state = use_context::<Signal<i32>>();

        rsx! {"{state}"}
    }
```

Сигналы достаточно умны, чтобы обрабатывать подписку на правильные скоупы без специального хука общего состояния.

## Отказ от подписок

Некоторые хуки состояния, включая `use_shared_state` и `use_ref`, имели в версии `0.4` функцию `write_silent`. Эта функция позволяла обновлять состояние без вызова перерисовки подписчиков. Эта функция была удалена в `0.5`.

Вместо этого вы можете использовать функцию `peek` для чтения текущего значения сигнала без подписки на него. Это инвертирует модель подписки, позволяя вам отказаться от подписки на сигнал вместо того, чтобы отписывать всех подписчиков от обновлений:

```rust
fn Parent() -> Element {
        let state = use_signal(|| 0);

// Even though we are reading the state, we don't need to subscribe to it
        let read_without_subscribing = state.peek();
        println!("{}", state.peek());

        rsx! { Child { state } }
    }

    #[component]
    fn Child(state: Signal<i32>) -> Element {
        rsx! {
            button { onclick: move |_| {
                    state += 1;
                }, "count is {state}" }
        }
    }
```

`peek` даёт вам более тонкий контроль над тем, когда вы хотите подписываться на сигнал. Это может быть полезно для оптимизации производительности и для обновления состояния без перерисовки компонентов.

## Глобальное состояние

В `0.4` крейт fermi предоставлял отдельный API глобального состояния, называемый атомами. В `0.5` тип `Signal` был расширен для предоставления API глобального состояния. Вы можете использовать функцию `Signal::global` для создания глобального сигнала:

```rust
static COUNT: GlobalSignal<i32> = Signal::global(|| 0);

    fn Parent() -> Element {
        rsx! {
            div { "{COUNT}" }
            button {
                onclick: move |_| {
                    *COUNT.write() += 1;
                },
                "Increment"
            }
        }
    }
```

Подробнее о глобальных сигналах читайте в [руководстве по миграции Fermi](to-05-fermi.md).
