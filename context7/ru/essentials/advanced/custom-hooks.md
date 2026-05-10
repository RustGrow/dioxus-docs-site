---
title: Пользовательские хуки
---

# Пользовательские хуки

Хуки — отличный способ инкапсулировать бизнес-логику. Если ни один из существующих хуков не подходит для вашей задачи, вы можете написать свой собственный.

При написании хука вы можете создать функцию, начинающуюся с `use_`, и принимающую любые аргументы, которые вам нужны. Затем вы можете использовать метод `use_hook` для создания хука, который будет вызван при первом рендере компонента.

## Композиция хуков

Чтобы избежать повторений, вы можете инкапсулировать бизнес-логику на основе существующих хуков для создания нового хука.

Например, если многим компонентам нужен доступ к структуре `AppSettings`, вы можете создать «ярлык»-хук:

```rust
fn use_settings() -> Signal<AppSettings> {
    consume_context()
}
```

Или если вы хотите обернуть хук, который сохраняет состояние при перезагрузках с помощью API хранилища, вы можете построить поверх хука use_signal для работы с изменяемым состоянием:

```rust
use gloo_storage::{LocalStorage, Storage};
use serde::{de::DeserializeOwned, Serialize};

/// A persistent storage hook that can be used to store data across application reloads.
#[allow(clippy::needless_return)]
pub fn use_persistent<T: Serialize + DeserializeOwned + Default + 'static>(
// A unique key for the storage entry
    key: impl ToString,
// A function that returns the initial value if the storage entry is empty
    init: impl FnOnce() -> T,
) -> UsePersistent<T> {
// Use the use_signal hook to create a mutable state for the storage entry
    let state = use_signal(move || {
// This closure will run when the hook is created
        let key = key.to_string();
        let value = LocalStorage::get(key.as_str()).ok().unwrap_or_else(init);
        StorageEntry { key, value }
    });

// Wrap the state in a new struct with a custom API
    UsePersistent { inner: state }
}

struct StorageEntry<T> {
    key: String,
    value: T,
}

/// Storage that persists across application reloads
pub struct UsePersistent<T: 'static> {
    inner: Signal<StorageEntry<T>>,
}

impl<T> Clone for UsePersistent<T> {
    fn clone(&self) -> Self {
        *self
    }
}

impl<T> Copy for UsePersistent<T> {}

impl<T: Serialize + DeserializeOwned + Clone + 'static> UsePersistent<T> {
    /// Returns a reference to the value
    pub fn get(&self) -> T {
        self.inner.read().value.clone()
    }

    /// Sets the value
    pub fn set(&mut self, value: T) {
        let mut inner = self.inner.write();
// Write the new value to local storage
        LocalStorage::set(inner.key.as_str(), &value);
        inner.value = value;
    }
}
```

## Пользовательская логика хуков

Вы можете использовать [`use_hook`](https://docs.rs/dioxus/latest/dioxus/prelude/fn.use_hook.html) для создания собственных хуков. На самом деле, именно на нём построены все стандартные хуки!

`use_hook` принимает одно замыкание для инициализации хука. Оно будет выполнено только один раз при первом рендере компонента. Возвращаемое значение этого замыкания будет использоваться в качестве значения хука — Dioxus возьмёт его и сохранит, пока компонент жив. При каждом рендере (не только при первом!) вы получите ссылку на это значение.

> Примечание: вы можете использовать хук `use_on_destroy` для очистки любых ресурсов, используемых хуком, когда компонент уничтожается.

Внутри замыкания инициализации вы обычно будете вызывать другие методы рантайма dioxus. Например:

- Хук `use_signal` отслеживает состояние в значении хука и использует [`ReactiveContext`](https://docs.rs/dioxus/latest/dioxus/prelude/struct.ReactiveContext.html), чтобы заставить Dioxus перерендерить любой компонент, который его наблюдал, всякий раз, когда значение сигнала изменяется.

Вот упрощённая реализация хука `use_signal`:

```rust
use std::cell::RefCell;
use std::collections::HashSet;
use std::rc::Rc;
use std::sync::{Arc, Mutex};

struct Signal<T> {
    value: Rc<RefCell<T>>,
    subscribers: Arc<Mutex<HashSet<ReactiveContext>>>,
}

impl<T> Clone for Signal<T> {
    fn clone(&self) -> Self {
        Self {
            value: self.value.clone(),
            subscribers: self.subscribers.clone(),
        }
    }
}

fn my_use_signal<T: 'static>(init: impl FnOnce() -> T) -> Signal<T> {
    use_hook(|| {
// A set of subscribers to notify about changes to this signals value
        let subscribers = Default::default();
// Create the initial state
        let value = Rc::new(RefCell::new(init()));

        Signal { value, subscribers }
    })
}

impl<T: Clone> Signal<T> {
    fn get(&self) -> T {
// Subscribe the context observing the signal (if any) to updates of its value.
        if let Some(reactive_context) = ReactiveContext::current() {
            reactive_context.subscribe(self.subscribers.clone());
        }

        self.value.borrow().clone()
    }

    fn set(&self, value: T) {
// Update the state
        *self.value.borrow_mut() = value;
// Trigger a re-render of the components that observed the signal's previous value
        let mut subscribers = std::mem::take(&mut *self.subscribers.lock().unwrap());
        subscribers.retain(|reactive_context| reactive_context.mark_dirty());
// Extend the subscribers list instead of overwriting it in case a subscriber is added while reactive contexts are marked dirty
        self.subscribers.lock().unwrap().extend(subscribers);
    }
}
```

- Хук `use_context` вызывает [`consume_context`](https://docs.rs/dioxus/latest/dioxus/prelude/fn.consume_context.html) (вызов которого при каждом рендере был бы дорогим) для получения контекста из компонента.

Вот реализация хуков `use_context` и `use_context_provider`:

```rust
pub fn use_context<T: 'static + Clone>() -> T {
    use_hook(|| consume_context())
}

pub fn use_context_provider<T: 'static + Clone>(f: impl FnOnce() -> T) -> T {
    use_hook(|| {
        let val = f();
// Provide the context state to the component
        provide_context(val.clone());
        val
    })
}
```

## Создание реактивных хуков

Примитив `use_hook` предоставляет только способ *хранить* значение. Он напрямую не интегрируется с рантаймом Dioxus, чтобы позволить *изменять* состояние или ставить эффекты в очередь.

Чтобы поставить компонент в очередь на перерендеринг, вы можете использовать примитив `dioxus::core::needs_update`. Он отправляет сообщение внутреннему планировщику Dioxus, чтобы поставить текущий компонент в очередь на перерендеринг.

```rust
log!("Перерендеринг!");

rsx! {
    // Нажатие этой кнопки принудительно вызовет перерендеринг
    button {
        onclick: move |_| dioxus::core::needs_update(),
        "Поставить в очередь на перерендеринг"
    }
}
```

Мы можем комбинировать `needs_update`, `use_hook` и [внутреннюю изменчивость](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html) для создания хуков, работающих с системой реактивности Dioxus.

```rust
// Объявляем новый тип "ReactiveString", который вызывает `needs_update` при изменении
#[derive(Default)]
struct ReactiveString { inner: Rc<RefCell<String>> }
impl ReactiveString {
    fn get(&self) -> String {
        self.inner.borrow().to_string()
    }
    fn set(&mut self, new: String) {
        *self.inner.write() = new;
        dioxus::core::needs_update();
    }
}

// Храним ReactiveString в хуке
fn use_reactive_string(init: impl FnOnce() -> String) -> ReactiveString {
    let inner = use_hook(|| Rc::new(RefCell::new(init())));
    ReactiveString { inner }
}

// И затем можем использовать его в нашем компоненте
let mut name = use_reactive_string(|| "Jane".to_string());

rsx! {
    // Нажатие кнопки вызовет `needs_update` и поставит в очередь перерендеринг
    button {
        onclick: move |_| name.set("Bob".to_string()),
        "Имя: {name.get()}"
    }
}
```

На практике вам никогда не понадобится создавать примитивы управления состоянием самостоятельно. Мы приводим эти примеры, чтобы помочь вам понять, как они работают.
