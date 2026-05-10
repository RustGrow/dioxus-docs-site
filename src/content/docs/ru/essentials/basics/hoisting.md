---
title: Подъем Состояния
---

# Подъем Состояния

Теперь у вас достаточно знаний Dioxus, чтобы создавать большие и сложные приложения! По мере роста ваших приложений вы можете захотеть рефакторить большие компоненты в коллекцию меньших компонентов. Альтернативно, вы можете добавить новый компонент, которому нужен доступ к состоянию из sibling-компонента.

В этих случаях нам нужно "поднять" общее состояние к ближайшему общему предку. Этот прием подъема общего состояния вверх по дереву называется *hoisting* (подъемом).

![Подъем Состояния](/assets/07/hoisting-state.png)

## Подъем Сигналов

Наиболее распространенные элементы для подъема — это сигналы и локальное состояние. По мере роста ваших приложений мы разбиваем большие компоненты на меньшие. Однако ваши меньшие дочерние компоненты по-прежнему нуждаются в доступе к одному и тому же состоянию. В этих случаях мы передаем состояние вниз по дереву.

Мы можем начать с большего компонента, который объединяет несколько источников состояния — в данном случае имя пользователя, email и некоторую валидацию в Мемо:

```rust
#[component]
fn EmailAndName() -> Element {
    let mut name = use_signal(|| "name".to_string());
    let mut email = use_signal(|| "email".to_string());
    let is_valid = use_memo(move || validate_name_and_email(name, email))
    rsx! {
        if !is_valid() { "Invalid name or email" }
        input { oninput: move |e| name.set(e.value()) }
        input { oninput: move |e| email.set(e.value()) }
    }
}
```

Мы можем захотеть вынести UI валидации в свой собственный компонент. В этом случае мы можем переместить разметку `Validator` в свой собственный дочерний компонент:

```rust
#[component]
fn EmailAndName() -> Element {
    let mut name = use_signal(|| "name".to_string());
    let mut email = use_signal(|| "email".to_string());
    rsx! {
        Validator { name, email }
        input { oninput: move |e| name.set(e.value()) }
        input { oninput: move |e| email.set(e.value()) }
    }
}

#[component]
fn Validator(name: Signal<String>, email: Signal<String>) -> Element {
    let is_valid = use_memo(move || validate_name_and_email(name, email));

    rsx! {
        if !is_valid() { "Invalid name or email" }
    }
}
```

По мере роста сложности нашего приложения мы можем захотеть использовать мемо `is_valid` в других компонентах. Например, мы можем захотеть стилизовать поле ввода по-другому, если ввод невалиден. В этом случае нужно *поднять* мемо `is_valid` из компонента `Validator` обратно в компонент `EmailAndName`:

```rust
#[component]
fn EmailAndName() -> Element {
    let mut name = use_signal(|| "name".to_string());
    let mut email = use_signal(|| "email".to_string());
    let is_valid = use_memo(move || validate_name_and_email(name, email));

    rsx! {
        Validator { is_valid }
        div { class: if !is_valid() { "border-red" },
            input { oninput: move |e| name.set(e.value()) }
            input { oninput: move |e| email.set(e.value()) }
        }
    }
}

#[component]
fn Validator(is_valid: Memo<bool>) -> Element {
    rsx! {
        if !is_valid() { "Invalid name or email" }
    }
}
```

Теперь наш компонент Validator зависит только от мемо `name` и `email`, а не от их содержимого. Обратите внимание, как мы начали с разбиения UI *сначала*, а *затем* состояния. Как правило, лучше централизовать наши примитивы состояния и передавать вниз производные значения, где это возможно.

## Приведение Readable Типов к ReadSignal

Если вы присмотритесь к компоненту `Validator`, вы можете заметить, что он в настоящее время принимает тип `Memo` как аргумент. Конечно, это тип, который возвращает `use_memo`! Однако требование типа `Memo` ограничивает, как мы можем использовать этот компонент. На практике нам не *нужен* Memo. Наш `Validator` просто хочет `bool`. И действительно, мы можем просто принять bool:

```rust
#[component]
fn Validator(is_valid: bool) -> Element {
    rsx! {
        if !is_valid { "Invalid name or email" }
    }
}
```

К сожалению, примитивы Rust *не* являются реактивными типами. Когда вы читаете или пишете в примитив — или любой другой тип, который не реактивен — реактивные контексты не могут подписаться на их изменения. Только реактивные типы, такие как Signal, Memo, Resource и ReadSignal, участвуют в системе реактивности Dioxus.

Например, эффект, который логирует при каждом изменении состояния валидации, *не сработает* с простым булевым аргументом `is_valid`.

```rust
// ❌ is_valid не отслеживается, и наш эффект не будет работать правильно
#[component]
fn Validator(is_valid: bool) -> Element {
    use_effect(move || log!("validity change: {is_valid}"));
    rsx! {
        if !is_valid { "Invalid name or email" }
    }
}
```

Как следует определять пропсы вашего компонента, чтобы он принимал *любое* реактивное значение?

Чтобы решить это, Dioxus реализует `Into<ReadSignal>` для всех Readable реактивных типов. Если тип позволяет вам `.read()` его, он также автоматически преобразуется в read-only handle внутреннего значения.

Чтобы исправить наш компонент `Validator`, мы просто оборачиваем `is_valid` в `ReadSignal`:

```rust
// ✅ is_valid реактивен!
#[component]
fn Validator(is_valid: ReadSignal<bool>) -> Element {
    use_effect(move || log!("validity change: {is_valid}"));
    rsx! {
        if !is_valid { "Invalid name or email" }
    }
}
```

Теперь родительские компоненты, использующие этот дочерний компонент, могут использовать любой Readable реактивный примитив как значение, позволяя нашему исходному примеру работать правильно.

```rust
// ✅ is_valid может быть передан из мемо или сигнала
#[component]
fn EmailAndName() -> Element {
    let mut name = use_signal(|| "name".to_string());
    let mut email = use_signal(|| "email".to_string());
    let is_valid = use_memo(move || validate_name_and_email(name, email));

    rsx! {
        Validator { is_valid }
        div { class: if !is_valid() { "border-red" },
            input { oninput: move |e| name.set(e.value()) }
            input { oninput: move |e| email.set(e.value()) }
        }
    }
}
```

Мы называем этот процесс преобразования read-write типа в read-only тип "decaying" (распадом). Read-only handle, возможно, менее полезен, чем полный read-write handle, но обладает более широкой совместимостью и проще для понимания.

## Автоматическое Преобразование в ReadSignal

Для нашего компонента `Validator` выше мы показали, как любой Readable реактивный тип, такой как `Signal` и `Memo`, автоматически "распадается" в `ReadSignal`. Но что, если мы хотим передать простое булево значение?

```rust
#[component]
fn EmailAndName() -> Element {
    rsx! {
        Validator { is_valid: true }
    }
}
```

Опять же, `ReadSignal` выручает! При использовании компонентов любые неотслеживаемые значения, переданные как свойства, автоматически реализуют `Into<ReadSignal>`. Это чрезвычайно мощно. Мы можем обновлять простые примитивные значения в реактивные значения без шаблонного кода.

```rust
// ✅ этот компонент принимает мемо, сигналы и даже примитивные значения!
#[component]
fn Validator(is_valid: ReadSignal<bool>) -> Element {
    rsx! {
        if !is_valid { "Invalid name or email" }
    }
}
```

Эта суперсила наиболее полезна при выполнении вычислений в выражениях на месте вызова. Например, мы можем выбрать не мемоизировать логику валидатора, а вместо этого просто выполнить ее inline:

```rust
#[component]
fn EmailAndName() -> Element {
    let mut name = use_signal(|| "name".to_string());
    let mut email = use_signal(|| "email".to_string());

    rsx! {
        Validator { is_valid: validate_name_and_email(name, email) }
        input { oninput: move |e| name.set(e.value()) }
        input { oninput: move |e| email.set(e.value()) }
    }
}
```

Как правило, лучше оборачивать каждое readable свойство компонента в `ReadSignal`. Это гарантирует, что каждый проп автоматически реактивен и максимально совместим с остальной экосистемой Dioxus.

## Подъем Колбэков

В Dioxus объект `Signal` является и читателем, *и* писателем. Мы спроектировали сигналы так, чтобы они были эргономичными и концептуально простыми: чтобы прочитать значение, вы используете `.read()`, а чтобы записать значение, вы используете `.write()`. Это делает базовый тип `Signal` чрезвычайно мощным.

Если вы не будете осторожны с подъемом состояния, вы в конечном итоге можете попытаться построить компонент, который принимает изменяемый сигнал как аргумент:

```rust
// ❌ Изменяемые пропсы — это плохо!
#[component]
fn Incrementer(mut sig: Signal<i32>) -> Element {
    rsx! {
        button {
            onclick: move |_| sig += 1,
            "Increment"
        }
    }
}
```

Хотя это может скомпилироваться (с предупреждениями!), мы активно не рекомендуем использование изменяемых данных в пропсах компонентов, так как это нарушает фундамент однонаправленного потока данных.

Вместо этого Dioxus дает вам возможность использовать колбэки, позволяя *вызывающей* стороне обрабатывать обновления состояния, а не *вызываемой*. Вместо изменения счетчика в компоненте `Incrementer` вы должны expose колбэк `onclick` и позволить родительскому компоненту обрабатывать обновление состояния.

```rust
// ✅ Используйте колбэки вместо этого!
#[component]
fn Parent() -> Element {
    let mut count = use_signal(|| 0);
    rsx! {
        Incrementer {
            onclick: move |_| count += 1,
        }
    }
}

#[component]
fn Incrementer(onclick: EventHandler<MouseEvent>) -> Element {
    rsx! {
        button {
            onclick: move |e| onclick.call(e),
            "Increment!"
        }
    }
}
```

Чтобы сделать подъем колбэков еще более эргономичным, Dioxus позволяет использовать сокращенное объявление свойств для атрибутов элементов и слушателей событий:

```rust
#[component]
fn Incrementer(onclick: EventHandler<MouseEvent>) -> Element {
    rsx! {
        button { onclick, "Increment!" }
    }
}
```

В случае, когда ваш поднятый колбэк должен возвращать значение, вы можете напрямую использовать тип `Callback`, который принимает как аргументы, так и возвращаемое значение как дженерики:

```rust
#[component]
fn CallbackChild(onclick: Callback<MouseEvent, String>) -> Element {
    let mut current = use_signal(|| "".to_string());
    rsx! {
        // onclick.call() принимает MouseEvent и возвращает String
        button {
            onclick: move |e| current.set(onclick.call(e)),
            "Set Value"
        }
    }
}
```

Поднимая мутацию как колбэки, наши дочерние компоненты становятся естественно более модульными и простыми для понимания.
