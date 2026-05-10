---
title: "Миграция: Пропсы"
---

# Миграция пропсов

В dioxus 0.4 пропсы передаются в компонент через скоуп. В dioxus 0.5 пропсы передаются в компонент напрямую через структуру пропсов.

## Пропсы с владением

Раньше пропсы заимствовались с lifetime из скоупа. Теперь пропсы клонируются при каждом рендере и передаются в компонент как значение с владением.

Dioxus 0.4:
```rust
#[component]
fn Comp(cx: Scope, name: String) -> Element {
    // Вы передаёте владение пропсом, но внутри компонента он заимствован (name имеет тип &String внутри функции)
    let owned_name: String = name.clone();

    cx.render(rsx! {
        "Hello {owned_name}"
    })
}
```
Dioxus 0.5:
```rust
// In dioxus 0.5, props are always owned. You pass in owned props and you get owned props in the body of the component
#[component]
fn Comp(name: String) -> Element {
Name is owned here already (name is the type String inside the function)
    let owned_name: String = name;

    rsx! {"Hello {owned_name}"}
}
```

Поскольку пропсы клонируются при каждом рендере, рекомендуется делать пропсы `Copy`. Вы можете легко сделать поле `Copy`, принимая `ReadOnlySignal<T>` вместо `T` в структуре пропсов:

```rust
// In dioxus 0.5, props are always owned. You pass in owned props and you get owned props in the body of the component
#[component]
fn CopyPropsComp(name: ReadOnlySignal<String>) -> Element {
    rsx! {
        button {
// You can easily copy the value of a signal into a closure
            onclick: move |_| {
                println!("Hello {name}");
                async move {
                    println!("Hello {name}");
                }
            },
            "Click me"
        }
    }
}

fn CopyPropsCompParent() -> Element {
    rsx! { CopyPropsComp { name: "World" } }
}
```

## Заимствованные пропсы

Заимствованные пропсы удалены в dioxus 0.5. Маппинг сигналов (mapped signals) может работать аналогично заимствованным пропсам, если ваши пропсы заимствуются из состояния.

Dioxus 0.4:
```rust
fn Parent(cx: Scope) -> Element {
    let state = use_state(cx, || (1, "World".to_string()));
    rsx! {
        BorrowedComp {
            name: &state.get().1
        }
    }
}

#[component]
fn BorrowedComp<'a>(cx: Scope<'a>, name: &'a str) -> Element<'a> {
    rsx! {
        "Hello {name}"
    }
}
```

Dioxus 0.5:
```rust
fn Parent() -> Element {
    let state = use_signal(|| (1, "World".to_string()));

    rsx! { BorrowedComp { name: state.map(|s| &s.1) } }
}

#[component]
fn BorrowedComp(name: MappedSignal<String>) -> Element {
    rsx! {"Hello {name}"}
}
```

## Ручные пропсы

Ручные структуры пропсов в dioxus 0.5 должны наследовать `Clone` в дополнение к `Props` и `PartialEq`:

Dioxus 0.4:
```rust
#[derive(Props, PartialEq)]
struct ManualProps {
    name: String,
}

// Функции принимают пропсы напрямую вместо скоупа
fn ManualPropsComponent(cx: Scope<ManualProps>) -> Element {
    render! {
        "Hello {cx.props.name}"
    }
}
```

Dioxus 0.5:
```rust
#[derive(Props, Clone, PartialEq)]
struct ManualProps {
    name: String,
}

// Functions accept the props directly instead of the component
fn ManualPropsComponent(props: ManualProps) -> Element {
    rsx! {"Hello {props.name}"}
}
```
