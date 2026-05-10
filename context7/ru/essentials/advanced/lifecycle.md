---
title: Жизненный цикл компонента
---

# Жизненный цикл компонента

## Инициализация состояния с помощью `use_hook`

`use_hook` позволяет вам создавать новое состояние для вашего компонента. Замыкание, которое вы передаёте в `use_hook`, будет вызвано один раз при первом рендере компонента. Каждый раз, когда компонент перерендеривается, будет переиспользоваться значение, созданное при первом запуске.

```rust
fn UseHook() -> Element {
// The closure that is passed to use_hook will be called once the first time the component is rendered
        let random_number = use_hook(|| {
            let new_random_number = random_number();

            log!("{new_random_number}");

            new_random_number
        });

        rsx! {
            div { "Random {random_number}" }
        }
    }
```

## Перерендеринг

Вы можете использовать отслеживаемые значения для перерендеринга вашего компонента всякий раз, когда значение изменяется.

```rust
fn Rerenders() -> Element {
        let mut count = use_signal(|| 0);

        log!("Rerendering parent component with {}", *count.peek());

        rsx! {
            button { onclick: move |_| count += 1, "Increment" }
// Since we read count here, the component will rerender when count changes
            Count { current_count: count() }
        }
    }

// If the count prop changes, the component will rerender
    #[component]
    fn Count(current_count: i32) -> Element {
        log!("Rerendering child component with {current_count}");

        rsx! {
            div { "The count is {current_count}" }
        }
    }
```

### ⚠️ Не изменяйте состояние в теле компонента

Вам следует избегать изменения состояния в теле компонента. Если вы читаете и записываете состояние в теле компонента, вы можете вызвать бесконечный цикл, так как компонент будет пытаться перерендериться из-за изменения, которое вызывает другое изменение состояния.

```rust
fn Bad() -> Element {
        let mut count = use_signal(|| 0);

❌ Don't mutate state in the body of the component.
// It can easily cause an infinite loop!
        count += 1;

        rsx! { "{count}" }
    }
```

Вместо этого выводите состояние с помощью `use_memo`, `use_resource` или изменяйте состояние в эффекте.

## Использование эффектов

Вы можете использовать эффекты для запуска кода всякий раз, когда компонент рендерится.

```rust
fn Effect() -> Element {
// Effects run after the component is rendered
// You can use them to read or modify the rendered component
        use_effect(|| {
            log!("Effect ran");
            document::eval(&format!(
                "document.getElementById('effect-output').innerText = 'Effect ran'"
            ));
        });

        rsx! {
            div { id: "effect-output", "This will be changed by the effect" }
        }
    }
```

## Очистка компонентов с помощью Drop

Перед уничтожением компонента он уничтожит все свои хуки. Вы можете использовать это поведение уничтожения для очистки любых ресурсов, которые использует ваш компонент. Если вам нужен только эффект уничтожения, вы можете использовать хук [`use_drop`](https://docs.rs/dioxus/latest/dioxus/prelude/fn.use_drop.html).

```rust
fn TogglesChild() -> Element {
        let mut show = use_signal(|| true);

        rsx! {
            button { onclick: move |_| show.toggle(), "Toggle" }
            if show() {
                Child {}
            }
        }
    }

    fn Child() -> Element {
// You can use the use_drop hook to clean up any resources
        dioxus::core::use_drop(|| {
            log!("Child dropped");
        });

        rsx! {
            div { "Child" }
        }
    }
```
