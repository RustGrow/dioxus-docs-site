---
title: Асинхронность и Futures
---

# Асинхронность и Futures

Не все действия завершаются мгновенно. Некоторые, например сетевой запрос, требуют ожидания системного ввода/вывода (IO). Пока мы ждем ответа от сети, мы хотим показывать статус обновления, добавить индикатор загрузки, а главное — избежать блокировки UI-потока. Код, который блокирует UI-поток, будет препятствовать дальнейшему вводу пользователя, делая интерфейс дерганным и неинтуитивным.

Rust предоставляет встроенный способ обработки асинхронной работы с помощью системы async/await. Dioxus обеспечивает первоклассную интеграцию с системой async/await Rust.

## Future: базовый примитив асинхронности в Rust

Трейт `Future` — это ядро асинхронного Rust. Future представляет значение, которое еще может быть не готово. В других языках это иногда называется *Promise* или *Task*. Подробнее о Futures можно прочитать в [книге по Rust](https://doc.rust-lang.org/book/ch17-00-async-await.html).

Мы не будем здесь рассматривать все детали futures, но есть несколько важных моментов, которые нужно знать перед их использованием в Dioxus:

- **Futures ленивые (lazy)**: Они ничего не делают, пока вы не вызовете `await` или не запустите их с помощью `spawn`.
- **Futures конкурентны, но не всегда параллельны**: В Dioxus все futures выполняются в главном потоке.
- **Futures приостанавливаются в точках await**: Не следует удерживать блокировки (locks) через эти точки await.
- **Futures могут быть отменены до завершения**: Ваши futures должны быть "безопасными к отмене" (cancel safe).

Futures должны уметь обрабатывать остановку в любой момент без паники и без приведения приложения в неконсистентное состояние. Они также должны избегать выполнения блокирующих операций, которые захватывают главный поток.

Жизненный цикл future следует последовательной структуре:

- Колбэк вызывает `async fn` или асинхронное замыкание
- Асинхронная функция возвращает Future
- Вызов `dioxus::spawn()` отправляет future в рантайм Dioxus, возвращая `Task`
- Future опрашивается (poll) в фоновом режиме, пока не вернет значение `Ready`
- Если Future отменяется, Rust вызывает ее реализацию `Drop`

![Диаграмма Future](/assets/07/future-diagram.png)

## Ленивые futures

В отличие от Promises в JavaScript, futures в Rust *ленивые*. Это означает, что они не начинают выполняться, пока вы не вызовете `.await` или не запустите их в фоне с помощью `spawn`.

Этот Future никогда не выведет "Ran", потому что он никогда не ожидается:

```rust
let future = async {
    println!("Ran");
};
```

Чтобы запустить этот Future, вы можете либо ожидать его в другом Future, либо запустить его:

```rust
let future = async {
    println!("Ran");
};
let other_future = async {
    future.await;
    println!("Ran Other");
};
spawn(other_future);
```

Вы можете остановить опрос Future в любое время или настроить, как опрашивается Future, используя крейт [futures](https://crates.io/crates/futures).

## Запуск Futures с помощью `spawn`

Функция Dioxus [`spawn`](https://docs.rs/dioxus/0.7/dioxus/prelude/fn.spawn.html) начинает выполнение Future в фоновом режиме и возвращает `Task`, который можно использовать для управления Future. Это основа всех остальных асинхронных хуков в Dioxus. С помощью spawn можно выполнять разовые задачи в обработчиках событий, хуках или других Futures:

```rust
let mut response = use_signal(|| "Click to start a request".to_string());

rsx! {
    button {
        onclick: move |_| {
            response.set("...".into());
            // Spawn will start a task running in the background
            spawn(async move {
                let resp = reqwest::Client::new()
                    .get("https://dioxuslabs.com")
                    .send()
                    .await;

                if resp.is_ok() {
                    response.set("dioxuslabs.com responded!".into());
                } else  {
                    response.set("failed to fetch response!".into());
                }
            });
        },
        "{response}"
    }
}
```

Поскольку запуск в обработчиках событий очень распространен, Dioxus предоставляет более краткий синтаксис. Если вы возвращаете Future из обработчика события, Dioxus автоматически вызовет для него `spawn`:

```rust
let mut response = use_signal(|| "Click to start a request".to_string());

rsx! {
    button {
        // Async closures passed to event handlers are automatically spawned
        onclick: move |_| async move {
            response.set("...".into());
            let resp = reqwest::Client::new()
                .get("https://dioxuslabs.com")
                .send()
                .await;

            if resp.is_ok() {
                response.set("dioxuslabs.com responded!".into());
            } else  {
                response.set("failed to fetch response!".into());
            }
        },
        "{response}"
    }
}
```

## Запуск Futures с помощью `use_action`

Часто вам нужно запустить действие в ответ на ввод пользователя и сохранить результат. При быстром вводе пользователя вам также потребуется отменять предыдущие действия, чтобы предотвратить состояния гонки (race conditions). Dioxus предоставляет встроенный хук, упрощающий этот паттерн, — функцию `use_action`.

Хук `use_action` объединяет сигналы и задачи в единый интерфейс. Просто вызовите `use_action` с колбэком, который возвращает `Result<T>`:

```rust
// Whenever this action is called, it will re-run the future and return the result.
let mut breed = use_action(move |breed| async move {
    #[derive(Deserialize, Serialize, Debug, PartialEq)]
    struct DogApi {
        message: String,
    }

    reqwest::get(format!("https://dog.ceo/api/breed/{breed}/images/random"))
        .await
        .unwrap()
        .json::<DogApi>()
        .await
});
```

Вы можете вызвать действие с помощью `.call()`:

```rust
rsx! {
    button {
        onclick: move |_| {
            breed.call(cur_breed.clone());
        },
        "{cur_breed}"
    }
}
```

А затем, в другом месте компонента, вы можете прочитать результат с помощью `.value()`:

```rust
match breed.value() {
    Some(Ok(res)) => rsx! {
        img { src: "{res.read().message}" }
    },
    Some(Err(_e)) => rsx! {
        div { "Failed to fetch a dog, please try again." }
    },
    None => rsx! {
        div { "Click the button to fetch a dog!" }
    },
}
```

Если действие находится в процессе выполнения, вызов `.call()` отменит текущий `Task` действия, заменив его новой задачей.

## Автоматическая отмена

Future, переданный в `spawn`, будет автоматически отменен при размонтировании компонента. Если вам нужно, чтобы Future выполнялся до завершения, вы можете использовать [`spawn_forever`](https://docs.rs/dioxus/0.7/dioxus/prelude/fn.spawn_forever.html):

```rust
// Spawn will start a task running in the background which will not be
// cancelled when the component is unmounted
dioxus::dioxus_core::spawn_forever(async move {
    let resp = reqwest::Client::new()
        .get("https://dioxuslabs.com")
        .send()
        .await;

    if resp.is_ok() {
        response.set("dioxuslabs.com responded!".into());
    } else  {
        response.set("failed to fetch response!".into());
    }
});
```

## Ручная отмена

Если вы хотите отменить future вручную, вы можете вызвать метод `cancel` на `Task`, возвращенном `spawn` или `spawn_forever`. Это остановит выполнение future и удалит его.

```rust
let mut response = use_signal(|| "Click to start a request".to_string());
let mut task = use_signal(|| None);

rsx! {
    button {
        onclick: move |_| {
            response.set("...".into());
            // Spawn will start a task running in the background
            let new_task = spawn(async move {
                let resp = reqwest::Client::new()
                    .get("https://httpbin.org/delay/1")
                    .send()
                    .await;

                if resp.is_ok() {
                    response.set("httpbin.org responded!".into());
                } else  {
                    response.set("failed to fetch response!".into());
                }
            });
            task.set(Some(new_task));
        },
        "{response}"
    }
    button {
        onclick: move |_| {
            // If the task is running, cancel it
            if let Some(t) = task.take() {
                t.cancel();
                response.set("Request cancelled".into());
            } else {
                response.set("No request to cancel".into());
            }
        },
        "Cancel Request"
    }
}
```

## Безопасность отмены (Cancel Safety)

Асинхронные задачи могут быть отменены в любой момент. Futures, запущенные в Dioxus, могут быть отменены:
1. Когда компонент, в котором они были запущены, размонтируется.
2. Когда задача отменяется вручную с помощью метода `cancel` на `Task`, возвращенном `spawn` или `spawn_forever`.
3. Когда ресурс перезапускается

Это означает, что ваши futures должны быть безопасными к отмене. Cancel-safe future — это такой future, который можно остановить в любой точке await без возникновения проблем. Например, если вы используете глобальное состояние, вам нужно убедиться, что состояние восстановлено при удалении future:

```rust
static RESOURCES_RUNNING: GlobalSignal<HashSet<String>> = Signal::global(|| HashSet::new());
let mut breed = use_signal(|| "hound".to_string());
let dogs = use_resource(move || async move {
    // Modify some global state
    RESOURCES_RUNNING.write().insert(breed());

    // Wait for a future to finish. The resource may cancel
    // without warning if breed is changed while the future is running. If
    // it does, then the breed pushed to RESOURCES_RUNNING will never be popped
    let response = reqwest::Client::new()
        .get(format!("https://dog.ceo/api/breed/{breed}/images"))
        .send()
        .await?
        .json::<BreedResponse>()
        .await;

    // Restore some global state
    RESOURCES_RUNNING.write().remove(&breed());

    response
});
```

Вы можете смягчить проблемы с отменой, очищая ресурсы вручную. Например, убедившись, что глобальное состояние восстановлено при удалении future:

```rust
static RESOURCES_RUNNING: GlobalSignal<HashSet<String>> = Signal::global(|| HashSet::new());
let mut breed = use_signal(|| "hound".to_string());
let dogs = use_resource(move || async move {
    // Modify some global state
    RESOURCES_RUNNING.write().insert(breed());

    // Automatically restore the global state when the future is dropped, even if
    // isn't finished
    struct DropGuard(String);
    impl Drop for DropGuard {
        fn drop(&mut self) {
            RESOURCES_RUNNING.write().remove(&self.0);
        }
    }
    let _guard = DropGuard(breed());

    // Wait for a future to finish. The resource may cancel
    // without warning if breed is changed while the future is running. If
    // it does, then it will be dropped and the breed will be popped
    reqwest::Client::new()
        .get(format!("https://dog.ceo/api/breed/{breed}/images"))
        .send()
        .await?
        .json::<BreedResponse>()
        .await
});
```

Асинхронные методы часто упоминают в документации, являются ли они безопасными к отмене. Как правило, большинство futures, с которыми вы столкнетесь при создании приложений на Dioxus, *являются* безопасными к отмене.

## Конкурентность vs Параллелизм

Конкурентность и параллелизм часто путают, но разница имеет важные последствия для написания приложений. Несколько конкурентных задач могут выполняться одновременно, но они не обязательно выполняются в одно и то же время. В Rust futures являются конкурентными. Они могут уступать управление другим задачам в точках await, позволяя другим задачам выполняться, пока они ждут готовности значения.

![конкурентность](/assets/07/async_concurrent.png)

В противоположность этому, несколько параллельных задач могут выполняться одновременно на разных потоках. В Rust параллельные задачи можно запускать с помощью модуля `std::thread` или библиотек вроде `rayon`.

![параллелизм](/assets/07/async_parallel.png)

В Rust существует несколько различных асинхронных рантаймов, таких как `tokio` или `wasm-bindgen-futures`. Dioxus предоставляет свой собственный асинхронный рантайм, построенный поверх платформенно-специфичного рантайма для каждого рендерера. На десктопе и мобильных устройствах мы используем Tokio для продвижения futures.

Рантайм Dioxus является однопоточным, что означает, что futures могут использовать `!Send` типы, но им нужно быть осторожными, чтобы никогда не блокировать поток.

```rust
spawn(async {
    // This will block the main thread and make the UI unresponsive.
    // Do not do this!
    solve_for_the_answer_to_life_and_everything();
    println!("Ran");
});
```

Если у вас есть ресурсоемкая задача, которую нужно выполнить, вы должны запустить её в отдельном потоке с помощью [`std::thread::spawn`](https://doc.rust-lang.org/std/thread/fn.spawn.html) на десктопе/мобильных устройствах или использовать [web worker](https://docs.rs/gloo-worker/latest/gloo_worker/) в вебе. Это позволит главному потоку продолжать работу и поддерживать UI отзывчивым.

```rust
std::thread::spawn(|| {
    // This will run on a separate thread and not block the main thread.
    solve_for_the_answer_to_life_and_everything();
    println!("Ran");
});
```

## Работа с блокировками

Futures приостанавливают выполнение в точках `.await`, позволяя другим задачам выполняться, пока future не будет готова продолжить. Вы никогда не должны удерживать `read`/`write` блокировки через точки `.await`, потому что другая асинхронная задача может попытаться использовать значение, пока future приостановлена и блокировка все еще открыта. Вместо этого нужно убедиться, что блокировки удерживаются только на протяжении критической секции и освобождаются до await.

![блокировки async](/assets/07/async_lock_await.png)

## Долгоживущие Futures

В некоторых приложениях вы можете захотеть включить долгоживущие задачи, которые существуют на протяжении всего времени жизни приложения. Это может быть фоновый движок синхронизации или поток, слушающий какой-то системный IO. Для таких случаев мы предоставляем функцию `spawn_forever`. Она работает точно так же, как `spawn`, но вместо запуска future под *текущим* компонентом, future привязывается к *корневому* компоненту. Поскольку корневой компонент никогда не размонтируется, задача продолжается до закрытия приложения.

```rust
use_hook(|| spawn_forever(async move {
    println!("Starting a background task!");
}));
```

У этой функции есть свои недостатки и она предназначена для продвинутых случаев использования. Если в этом future используются ресурсы, такие как Signal, они также должны быть валидны на протяжении всего времени жизни приложения. Использование Signals после того, как они были удалены, приведет к панике и краху вашего приложения!
