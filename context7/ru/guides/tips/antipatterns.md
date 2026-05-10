---
title: Антипаттерны
---

# Антипаттерны

В этом разделе показано, чего не следует делать, и даны причины, почему тот или иной паттерн считается «антипаттерном». Большинство антипаттернов считаются неправильными по соображениям производительности или повторного использования кода.

## Неправильные ключи итераторов

Как описано в [главе о rsx](../../essentials/ui/iteration.md), элементы списка должны иметь уникальные ключи, которые связаны с одними и теми же элементами между рендерами. Это помогает Dioxus ассоциировать состояние с содержащимися компонентами и обеспечивает хорошую производительность диффинга. Не опускайте ключи, если только вы не знаете, что список никогда не изменится.

```rust
let data: &HashMap<_, _> = &props.data;

// ❌ No keys
    rsx! {
        ul {
            for value in data.values() {
                li { "List item: {value}" }
            }
        }
    };

// ❌ Using index as keys
    rsx! {
        ul {
            for (index , value) in data.values().enumerate() {
                li { key: "{index}", "List item: {value}" }
            }
        }
    };

// ✅ Using unique IDs as keys:
    rsx! {
        ul {
            for (key , value) in props.data.iter() {
                li { key: "{key}", "List item: {value}" }
            }
        }
    }
```

## Избегайте внутренней изменчивости в пропсах

Хотя технически допустимо иметь `Mutex` или `RwLock` в пропсах, они будут трудны в использовании.

Предположим, у вас есть структура `User`, содержащая поле `username: String`. Если вы передадите проп `Mutex<User>` в компонент `UserComponent`, этот компонент может захотеть записать в поле `username`. Однако когда он это сделает, родительский компонент не узнает об изменении, и компонент не перерисуется, что приведёт к рассинхронизации UI с состоянием. Вместо этого рассмотрите передачу реактивного значения, такого как `Signal`, или неизменяемых данных.

```rust
// ❌ Mutex/RwLock/RefCell in props
#[derive(Props, Clone)]
struct AntipatternInteriorMutability {
    map: Rc<RefCell<HashMap<u32, String>>>,
}

impl PartialEq for AntipatternInteriorMutability {
    fn eq(&self, other: &Self) -> bool {
        std::rc::Rc::ptr_eq(&self.map, &other.map)
    }
}

fn AntipatternInteriorMutability(map: Rc<RefCell<HashMap<u32, String>>>) -> Element {
    rsx! {
        button {
            onclick: {
                let map = map.clone();
                move |_| {
// Writing to map will not rerun any components
                    map.borrow_mut().insert(0, "Hello".to_string());
                }
            },
            "Mutate map"
        }
// Since writing to map will not rerun any components, this will get out of date
        "{map.borrow().get(&0).unwrap()}"
    }
}

// ✅ Use a signal to pass mutable state
#[component]
fn AntipatternInteriorMutabilitySignal(map: Signal<HashMap<u32, String>>) -> Element {
    rsx! {
        button {
            onclick: move |_| {
// Writing to map will rerun any components that read the map
                map.write().insert(0, "Hello".to_string());
            },
            "Mutate map"
        }
// Since writing to map will rerun subscribers, this will get updated
        "{map.read().get(&0).unwrap()}"
    }
}
```

## Избегайте обновления состояния во время рендера

Каждый раз, когда вы обновляете состояние, Dioxus должен перерисовать компонент — это неэффективно! Рассмотрите возможность рефакторинга вашего кода, чтобы избежать этого.

Кроме того, если вы безусловно обновляете состояние во время рендера, он будет перерисовываться в бесконечном цикле.

```rust
// ❌ Updating state in render
    let first_signal = use_signal(|| 0);
    let mut second_signal = use_signal(|| 0);

// Updating the state during a render can easily lead to infinite loops
    if first_signal() + 1 != second_signal() {
        second_signal.set(first_signal() + 1);
    }

// ✅ Update state in an effect
    let first_signal = use_signal(|| 0);
    let mut second_signal = use_signal(|| 0);

// The closure you pass to use_effect will be rerun whenever any of the dependencies change without re-rendering the component
    use_effect(move || {
        if first_signal() + 1 != second_signal() {
            second_signal.set(first_signal() + 1);
        }
    });

// ✅ Deriving state with use_memo
    let first_signal = use_signal(|| 0);
// Memos are specifically designed for derived state. If your state fits this pattern, use it.
    let second_signal = use_memo(move || first_signal() + 1);
```

## Избегайте больших групп состояния

Может возникнуть соблазн иметь одну большую структуру состояния, содержащую всё состояние вашего приложения. Однако это может привести к проблемам:
- Можно легко случайно изменить состояние так, что это вызовет бесконечный цикл
- Может быть сложно рассуждать о том, когда и как обновляется состояние
- Это может привести к проблемам с производительностью, потому что многие компоненты будут нуждаться в перерисовке при изменении состояния

Вместо этого рассмотрите возможность разбиения состояния на более мелкие, управляемые части. Это упростит рассуждение о состоянии, поможет избежать циклов обновления и повысит производительность.

```rust
fn app() -> Element {
// ❌ Large state struct
    #[derive(Props, Clone, PartialEq)]
    struct LargeState {
        users: Vec<User>,
        logged_in: bool,
        warnings: Vec<String>,
    }

    #[derive(Props, Clone, PartialEq)]
    struct User {
        name: String,
        email: String,
    }

    let mut all_my_state = use_signal(|| LargeState {
        users: vec![User {
            name: "Alice".to_string(),
            email: "alice@example.com".to_string(),
        }],
        logged_in: true,
        warnings: vec![],
    });

    use_effect(move || {
// It is very easy to accidentally read and write to the state object if it contains all your state
        let read = all_my_state.read();
        let logged_in = read.logged_in;
        if !logged_in {
            all_my_state
                .write_unchecked()
                .warnings
                .push("You are not logged in".to_string());
        }
    });

// ✅ Use multiple signals to manage state
    let users = use_signal(|| {
        vec![User {
            name: "Alice".to_string(),
            email: "alice@example.com".to_string(),
        }]
    });
    let logged_in = use_signal(|| true);
    let mut warnings = use_signal(|| vec![]);

    use_effect(move || {
// Now you can read and write to separate signals which will not cause issues
        if !logged_in() {
            warnings.write().push("You are not logged in".to_string());
        }
    });

// ✅ Use memos to create derived state when larger states are unavoidable
// Notice we didn't split everything into separate signals. Users still make sense as a vec of data
    let users = use_signal(|| {
        vec![User {
            name: "Alice".to_string(),
            email: "alice@example.com".to_string(),
        }]
    });
    let logged_in = use_signal(|| true);
    let warnings: Signal<Vec<String>> = use_signal(|| vec![]);

// In child components, you can use the memo to create derived that will only update when a specific part of the state changes
// This will help you avoid unnecessary re-renders and infinite loops
    #[component]
    fn FirstUser(users: Signal<Vec<User>>) -> Element {
        let first_user = use_memo(move || users.read().first().unwrap().clone());

        rsx! {
            div {
                "First user: {first_user().name}"
            }
        }
    }

    rsx! {
        FirstUser {
            users
        }
    }
}
```

## Запуск недетерминированного кода в теле компонента

Если у вас есть компонент, содержащий недетерминированный код, этот код, как правило, не должен выполняться в теле компонента. Если он помещён в тело компонента, он будет выполняться каждый раз при перерисовке компонента, что может привести к проблемам с производительностью.

Вместо этого рассмотрите возможность перемещения недетерминированного кода в хук, который запускается только при первом создании компонента, или в эффект, который перезапускается при изменении зависимостей.

```rust
// ❌ Non-deterministic code in the body of a component
#[component]
fn NonDeterministic(name: String) -> Element {
    let my_random_id = rand::random::<u64>();

    rsx! {
        div {
// Id will change every single time the component is re-rendered
            id: "{my_random_id}",
            "Hello {name}"
        }
    }
}

// ✅ Use a hook to run non-deterministic code
fn NonDeterministicHook(name: String) -> Element {
// If you store the result of the non-deterministic code in a hook, it will stay the same between renders
    let my_random_id = use_hook(|| rand::random::<u64>());

    rsx! {
        div {
            id: "{my_random_id}",
            "Hello {name}"
        }
    }
}
```

## Слишком разрешительный PartialEq для пропсов

Вы, возможно, заметили, что `Props` требует реализации `PartialEq`. Этот `PartialEq` очень важен для правильной работы Dioxus. Он используется для определения, должен ли компонент перерисовываться или нет, когда перерисовывается родительский компонент.

Если вы не можете вывести `PartialEq` для ваших `Props`, вам нужно будет реализовать его самостоятельно. Если вы реализуете `PartialEq`, убедитесь, что возвращаете `false` всякий раз, когда пропсы изменяются так, что это повлияет на UI дочернего компонента.

В целом, возврат `false` из `PartialEq`, если вы не уверены, изменились ли пропсы или нет, лучше, чем возврат `true`. Это поможет вам избежать устаревшего UI в дочерних компонентах.

```rust
// ❌ Permissive PartialEq for Props
#[derive(Props, Clone)]
struct PermissivePartialEqProps {
    name: String,
}

// This will cause the component to **never** re-render when the parent component re-renders
impl PartialEq for PermissivePartialEqProps {
    fn eq(&self, _: &Self) -> bool {
        true
    }
}

fn PermissivePartialEq(name: PermissivePartialEqProps) -> Element {
    rsx! {
        div {
            "Hello {name.name}"
        }
    }
}

#[component]
fn PermissivePartialEqParent() -> Element {
    let name = use_signal(|| "Alice".to_string());

    rsx! {
        PermissivePartialEq {
// The PermissivePartialEq component will not get the updated value of name because the PartialEq implementation says that the props are the same
            name: name()
        }
    }
}

// ✅ Derive PartialEq for Props
#[derive(Props, Clone, PartialEq)]
struct DerivePartialEqProps {
    name: String,
}

fn DerivePartialEq(name: DerivePartialEqProps) -> Element {
    rsx! {
        div {
            "Hello {name.name}"
        }
    }
}

#[component]
fn DerivePartialEqParent() -> Element {
    let name = use_signal(|| "Alice".to_string());

    rsx! {
        DerivePartialEq {
            name: name()
        }
    }
}

// ✅ Return false from PartialEq if you are unsure if the props have changed
#[derive(Debug)]
struct NonPartialEq;

#[derive(Props, Clone)]
struct RcPartialEqProps {
    name: Rc<NonPartialEq>,
}

impl PartialEq for RcPartialEqProps {
    fn eq(&self, other: &Self) -> bool {
// This will almost always return false because the Rc will likely point to a different value
// Implementing PartialEq for NonPartialEq would be better, but if it is controlled by another library, it may not be possible
// **Always** return false if you are unsure if the props have changed
        std::rc::Rc::ptr_eq(&self.name, &other.name)
    }
}

fn RcPartialEq(name: RcPartialEqProps) -> Element {
    rsx! {
        div {
            "Hello {name.name:?}"
        }
    }
}

fn RcPartialEqParent() -> Element {
    let name = use_signal(|| Rc::new(NonPartialEq));

    rsx! {
        RcPartialEq {
// Generally, RcPartialEq will rerun even if the value of name hasn't actually changed because the Rc will point to a different value
            name: name()
        }
    }
}
```
