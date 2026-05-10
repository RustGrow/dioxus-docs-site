---
title: "Миграция: Хуки"
---

# Хуки

Dioxus теперь использует сигналы (signals) как основу для управления состоянием. Сигналы — это более умная и гибкая версия хука `use_ref`. Сигналы теперь лежат в основе многих хуков в dioxus, чтобы обеспечить более консистентный и гибкий API.

### Хуки состояния

Хуки состояния теперь основаны на сигналах. `use_state`, `use_ref` и `use_shared_state` были заменены хуком `use_signal`. Хук `use_signal` — это более гибкая и мощная версия хука `use_ref` с более умными скоупами, которые подписываются на сигнал только если он прочитан внутри скоупа. Подробнее о хуке `use_signal` читайте в руководстве по [миграции состояния](to-05-state.md).

### Асинхронные хуки

Хук `use_future` был заменён хуком `use_resource`. `use_resource` автоматически подписывается на любые сигналы, которые прочитаны внутри замыкания, вместо использования кортежа зависимостей.

Dioxus 0.4:

```rust
fn MyComponent(cx: Scope) -> Element {
	let state = use_state(cx, || 0);
	let my_resource = use_future(cx, (**state,), |(state,)| async move {
		// запускаем запрос, зависящий от состояния
		println!("{state}");
	});
	render! {
  "{state}"
	}
}
```

Dioxus 0.5:

```rust
fn MyComponent() -> Element {
    let state = use_signal(|| 0);
// No need to manually set the dependencies, the use_resource hook will automatically detect signal dependencies
    let my_resource = use_resource(move || async move {
// start a request that depends on the state
// Because we read from the state signal, this future will be re-run whenever the state changes
        println!("{state}");
    });
    rsx! {"{state}"}
}
```

### Зависимости

Некоторые хуки, включая `use_effect` и `use_resource`, теперь принимают единственное замыкание с автоматическими подписками вместо кортежа зависимостей. Подробнее о хуке `use_resource` читайте в руководстве по [миграции хуков](to-05-hooks.md).

Dioxus 0.4:

```rust
fn HasDependencies(cx: Scope) -> Element {
	let state = use_state(cx, || 0);
	let my_resource = use_resource(cx, (**state,), |(state,)| async move {
		println!("{state}");
	});
	let state_plus_one = use_memo(cx, (**state,), |(state,)| {
		state() + 1
	});
	render! {
  "{state_plus_one}"
	}
}
```

Dioxus 0.5:

```rust
fn HasDependencies() -> Element {
    let state = use_signal(|| 0);
// No need to manually set the dependencies, the use_resource hook will automatically detect signal dependencies
    let my_resource = use_resource(move || async move {
// Because we read from the state signal, this future will be re-run whenever the state changes
        println!("{state}");
    });
    let state_plus_one = use_memo(move || {
// Because we read from the state signal, this future will be re-run whenever the state changes
        state() + 1
    });
    rsx! {"{state_plus_one}"}
}
```
