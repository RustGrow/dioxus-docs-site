---
title: Эффекты и Мемо
---

# Эффекты и Мемо

Сигналы обеспечивают фундамент для изменяемого состояния в приложениях Dioxus. Вызовы `.read()` подписывают реактивные скоупы, а вызовы `.write()` ставят побочные эффекты в очередь.

Однако иногда мы хотим запускать *собственные* побочные эффекты при изменении значения Сигнала. В других случаях мы хотим изолировать реактивные скоупы так, чтобы изменения сигнала не автоматически не ставили компонент в очередь на повторный рендер. В этих случаях мы обращаемся к Мемо с помощью `use_memo` и Эффектам с помощью `use_effect`.

## Несколько Реактивных Скоупов

Чтобы понять Эффекты и Мемо, нам сначала нужно понять, что один Сигнал (или другое реактивное значение) может быть прочитан одновременно в нескольких реактивных скоупах. Например, сигнал может быть разделен между несколькими компонентами через пропсы. Каждый компонент, который вызывает `.read()` на значении сигнала, автоматически подписывается на любые изменения значения этого сигнала. Когда значение сигнала меняется, выполняется побочный эффект повторного рендера.

Эффекты и Мемо позволяют нам наблюдать за изменениями в реактивных значениях без повторного рендера компонентов. Мы можем изолировать меньшие единицы реактивности с помощью мемо, а затем ставить в очередь собственные побочные эффекты с помощью эффектов.

![Несколько Читателей](/assets/07/multiple-scopes.png)

Мемо реализуют трейт `Readable` (но не трейт Writable!) и, таким образом, реализуют те же эргономичные расширения, что и сигналы. И Мемо, и Эффекты являются `Copy` и имеют ту же семантику жизненного цикла и Drop, что и сигналы.

## Производное Состояние с Мемо

`use_memo` — это реактивный примитив, который позволяет вам выводить состояние из любого отслеживаемого значения. Он принимает замыкание, которое вычисляет новое состояние, и возвращает отслеживаемое значение, содержащее текущее состояние мемо. Когда зависимость мемо изменяется, мемо перезапускается, и вычисляется новое значение.

Значение, возвращенное из замыкания, вызовет обновление значения мемо — и, следовательно, любые побочные эффекты — только когда они не равны, что определяется через `PartialEq` между старым и новым значением.

```rust
fn Memo() -> Element {
    let mut count = use_signal(|| 0);

    // use_memo creates a tracked value that is derived from count
    // Since we read count inside the closure, it becomes a dependency of the memo
    // Whenever count changes, the memo will rerun
    let half_count = use_memo(move || count() / 2);

    use_effect(move || {
        // half_count is itself a tracked value
        // When we read half_count, it becomes a dependency of the effect
        // and the effect will rerun when half_count changes
        log!("{half_count}");
    });

    rsx! {
        button { onclick: move |_| count += 1, "Increment" }

        div { "Count is {count}" }
        div { "Half count is {half_count}" }
    }
}
```

Мемо могут быть полезны для выполнения дорогостоящих вычислений вне реактивного скоупа компонента, предотвращая повторные рендеры при изменении входных данных. В этом примере, выполняя вычисление *внутри* мемо, мы предотвращаем повторный рендер компонента при изменении `loading` или `loading_text`. Вместо этого компонент будет перерендериваться только при изменении вычисленного значения мемо.

```rust
let mut loading = use_signal(|| false);
let mut loading_text = use_signal(|| "loading".to_string());

let subheading = use_memo(move || {
    if loading() && loading_text() == "loading" {
        return "The state is loading";
    }

    "The state is not loading"
});

rsx! {
    h1 { "{subheading}" }
}
```

## Производные Элементы

Хук `use_memo` особенно мощен. Помимо примитивных значений, он может даже мемоизировать объекты `Element`! Мы можем разбить большие компоненты на серию меньших мемо для повышения производительности.

На практике вам не часто понадобится мемоизация Element, но она может быть полезна. Чаще всего мы можем преобразовать результат дорогостоящего вычисления прямо в Element, не нуждаясь в хранении промежуточного значения:

```rust
let mut loading_text = use_signal(|| "loading".to_string());

let loading_ui = use_memo(move || {
    let num_chars = loading_text.read().chars().count();
    rsx! { "there are {num_chars} characters!" }
});

rsx! {
    h1 { "Demo" }
    {loading_ui}
}
```

Внимательные читатели заметят, что мемоизированный UI и компоненты — это по сути одно и то же понятие: компоненты — это просто функции от мемоизированного состояния, которые возвращают Element.

## Цепочки Мемо и PartialEq

Замыкание, которое вы передаете в мемо, будет вызвано всякий раз, когда состояние, прочитанное внутри мемо, записывается — даже если значение фактически не изменилось — но полученное мемо не перезапустит другие части вашего приложения, если вывод не изменится (`PartialEq` вернет false).

Давайте рассмотрим примеры, чтобы понять, как это работает:

```rust no_run
let mut count = use_signal(|| 1);
// double_count перезапустится, когда состояние, прочитанное внутри мемо, изменится (count)
let double_count = use_memo(move || count() * 2);

// мемо ведут себя очень похоже на сигнал только для чтения. Вы можете читать их, отображать и передавать как любой другой сигнал
println!("{}", double_count); // Печатает "2"

// Но вы не можете писать в них напрямую
// Вместо этого, всякий раз, когда вы записываете значение, которое читает мемо, мемо перезапустится
count += 1;

println!("{}", double_count); // Печатает "4"

// Создадим еще одно мемо, которое читает значение double_count
let double_count_plus_one = use_memo(move || double_count() + 1);

println!("{}", double_count_plus_one); // Печатает "5"

// Теперь, если мы запишем в count, мемо double_count перезапустится
// Если вывод double_count изменится, то это вызовет перезапуск double_count_plus_one
count += 1;

println!("{}", double_count); // Печатает "6"
println!("{}", double_count_plus_one); // Печатает "7"

// Однако, если значение double_count не изменится после записи, то это не вызовет перезапуск double_count_plus_one
// Поскольку мы записываем то же значение, удвоенное значение все еще 6, и мы не перезапускаем double_count_plus_one
*count.write() = 3;

println!("{}", double_count); // Печатает "6"
println!("{}", double_count_plus_one); // Печатает "7"
```

## Мемо и Асинхронный Код

Поскольку мемо проверяют заимствования во время выполнения, вам нужно быть осторожным при чтении мемо внутри асинхронного кода. Если вы удерживаете чтение мемо через точку await, это чтение может оставаться открытым, когда мемо перезапустится, что вызовет панику:

```rust no_run
async fn double_me_async(value: &u32) -> u32 {
    sleep(100).await;
    *value * 2
}
let mut signal = use_signal(|| 0);
let halved = use_memo(move || signal() / 2);

let doubled = use_resource(move || async move {
    // Не удерживайте чтения через точки await
    let halved = halved.read();
    // Пока future ожидает завершения асинхронной работы, чтение будет открыто
    double_me_async(&halved).await
});

rsx!{
    "{doubled:?}"
    button {
        onclick: move |_| {
            // Когда вы записываете в signal, это вызовет перезапуск memo,
            // что может вызвать панику, потому что вы удерживаете чтение memo через точку await
            signal += 1;
        },
        "Увеличить"
    }
};
```

Вместо удержания чтения через точку await, вы можете клонировать необходимые значения из мемо:

```rust no_run
async fn double_me_async(value: u32) -> u32 {
    sleep(100).await;
    value * 2
}
let mut signal = use_signal(|| 0);
let halved = use_memo(move || signal() / 2);

let doubled = use_resource(move || async move {
    // Вызов мемо клонирует внутреннее значение
    let halved = halved();
    double_me_async(halved).await
});

rsx!{
    "{doubled:?}"
    button {
        onclick: move |_| {
            signal += 1;
        },
        "Увеличить"
    }
};
```

## Запуск Побочных Эффектов

По умолчанию, всякий раз, когда отслеживаемое значение изменяется, любые реактивные скоупы, наблюдающие значение с помощью `.read()`, запускают побочные эффекты. Классический пример — компонент: когда значение сигнала меняется, компонент ставит в очередь побочный эффект, который перерендеривает компонент.

![Рендеры компонентов — это эффекты](/assets/07/component-effect.png)

Мы можем присоединять собственные побочные эффекты к Сигналам и Мемо с помощью хука `use_effect`. Он создает замыкание, которое запускается всякий раз, когда отслеживаемое значение, прочитанное внутри замыкания, изменяется.

Любое значение, которое вы читаете внутри замыкания, станет зависимостью эффекта. Если значение изменится, эффект перезапустится.

```rust
fn Effect() -> Element {
    // use_signal creates a tracked value called count
    let mut count = use_signal(|| 0);

    use_effect(move || {
        // When we read count, it becomes a dependency of the effect
        let current_count = count();
        // Whenever count changes, the effect will rerun
        log!("{current_count}");
    });

    rsx! {
        button { onclick: move |_| count += 1, "Increment" }

        div { "Count is {count}" }
    }
}
```

## Эффекты с Нереактивными Зависимостями

Чтобы добавить нереактивные зависимости к эффекту, вы можете использовать хук `use_reactive`. Сигналы автоматически добавляются как зависимости, поэтому вам не нужно вызывать этот метод для них.

```rust
#[component]
fn Comp(count: u32) -> Element {
    // Поскольку эффект подписывается на `count`, добавляя его как зависимость, эффект будет перезапускаться каждый раз, когда `count` меняется.
    use_effect(use_reactive((&count,), |(count,)| println!("Effect ran with count: {count}") ));

    todo!()
}
```

## Модификация Смонтированных Узлов

Один из самых распространенных случаев использования эффектов — модификация или чтение чего-либо из отрендеренного DOM. Dioxus предоставляет доступ к DOM через событие `onmounted`.

Вы можете комбинировать `use_effect` с `onmounted`, чтобы запустить эффект с доступом к DOM-элементу после завершения всего рендеринга:

```rust
fn MyComponent() -> Element {
    let mut current_text = use_signal(String::new);
    let mut mounted_text_div: Signal<Option<MountedEvent>> = use_signal(|| None);
    let mut rendered_size = use_signal(String::new);

    use_effect(move || {
        // Если у нас смонтирован текстовый div, мы можем прочитать ширину div
        if let Some(div) = mounted_text_div() {
            // Мы читаем текущий текст здесь внутри эффекта вместо spawn, чтобы эффект подписался на сигнал
            let text = current_text();
            spawn(async move {
                let bounding_box = div.get_client_rect().await;
                rendered_size.set(format!("{text} is {bounding_box:?}"));
            });
        }
    });

    rsx! {
        input {
            // Когда вы вводите текст в поле ввода, эффект перезапустится, потому что он подписан на сигнал current_text
            oninput: move |evt| current_text.set(evt.value()),
            placeholder: "Enter text here",
            value: "{current_text}"
        }
        // Когда текст меняется, он изменит размер этого div
        div {
            onmounted: move |element| {
                mounted_text_div.set(Some(element.clone()));
            },
            "{current_text}"
        }

        "{rendered_size}"
    }
}
```

## Предпочитайте Действия Побочным Эффектам

Вы можете задаться вопросом: "зачем мне вообще запускать побочные эффекты?" И, действительно, они не должны быть часто используемым инструментом. Побочные эффекты могут быть трудны для понимания и часто используются не по назначению, когда следовало бы предпочесть действие (action).

Классический пример побочного эффекта — синхронизация состояния UI с каким-то внешним состоянием. Например, у нас может быть компонент `Title {}`, который устанавливает заголовок окна всякий раз, когда заголовок меняется:

```rust
fn Title() -> Element {
    let mut text = use_signal(|| "".to_string());

    // attach an effect to modify the document title whenever title changes
    use_effect(move || {
        window().unwrap().document().unwrap().set_title(&text());
    });

    rsx! {
        input {
            oninput: move |e| text.set(e.value()),
            placeholder: "Set the document title"
        }
    }
}
```

Это валидный случай использования побочных эффектов. Dioxus гарантирует, что побочные эффекты будут выполнены *после* того, как UI будет отрисован на экране. Если бы мы вместо этого устанавливали заголовок документа из обработчика oninput, другое изменение состояния на том же шаге могло бы вызвать размонтирование компонента `Title {}`. В этом случае заголовок документа был бы установлен, даже если компонент `Title {}` больше не присутствует.

Однако некоторые действия *не должны* быть эффектами. Эффекты широко перегружены в React и являются источником многих проблем с состоянием. Если вы можете с уверенностью сказать, что компонент `Title {}` не будет размонтирован, то лучше устанавливать заголовок документа прямо в обработчике:

```rust
fn Title() -> Element {
    rsx! {
        input {
            oninput: move |e| {
                window().document().set_title(e.value())
            },
            placeholder: "Set the document title"
        }
    }
}
```

## Отказ от Подписок

В некоторых ситуациях вам может понадобиться прочитать реактивное значение, не подписываясь на него. Вы можете использовать метод `peek`, чтобы получить ссылку на внутреннее значение, не регистрируя значение как зависимость текущего реактивного контекста:

```rust
fn Peek() -> Element {
    let mut count = use_signal(|| 0);

    // The toggle signal is a tracked value
    let mut toggle = use_signal(|| false);

    use_effect(move || {
        // When we read count, it becomes a dependency of the effect
        let current_count = count();
        log!("current_count is {current_count}");

        if current_count % 4 == 0 {
            We peek at the value of toggle instead of reading it,
            // so it does not become a dependency
            let current_toggle = *toggle.peek();
            // We didn't subscribe to toggle, so this will not cause
            // the effect to rerun forever
            toggle.set(!current_toggle);
            log!("flipped toggle to {toggle}");
        }
    });

    rsx! {
        button { onclick: move |_| count += 1, "Change Signal" }

        div { "Count is {count}" }
        div { "Toggle is {toggle}" }
    }
}
```

## Работа с Неотслеживаемым Состоянием

Большая часть состояния в вашем приложении будет отслеживаемой. Все встроенные хуки возвращают отслеживаемые значения, и мы рекомендуем пользовательским хукам делать то же самое. Однако бывают случаи, когда нужно работать с неотслеживаемым состоянием. Например, вы можете получить неотслеживаемое значение в пропсах. Когда вы читаете неотслеживаемое значение внутри реактивного контекста, оно не будет подписываться на него:

```rust
fn Component() -> Element {
    let mut count = use_signal(|| 0);

    rsx! {
        button { onclick: move |_| count += 1, "Change Signal" }

        Count { count: count() }
    }
}

// The count reruns the component when it changes, but it is not a tracked value
#[component]
fn Count(count: i32) -> Element {
    // When you read count inside the memo, it does not subscribe to the count signal
    // because the value is not reactive
    let double_count = use_memo(move || count * 2);

    rsx! {
        div { "Double count: {double_count}" }
    }
}
```

Вы можете начать отслеживать raw-состояние с помощью хука `use_reactive`. Этот хук принимает кортеж зависимостей и возвращает реактивное замыкание. Когда замыкание вызывается в реактивном контексте, оно будет отслеживать зависимости и перезапускать замыкание при их изменении.

```rust
#[component]
fn Count(count: i32) -> Element {
    // You can manually track a non-reactive value with the use_reactive hook
    let double_count = use_memo(
        // Use reactive takes a tuple of dependencies and returns a reactive closure
        use_reactive!(|(count,)| count * 2),
    );

    rsx! {
        div { "Double count: {double_count}" }
    }
}
```

## Делая Пропсы Реактивными

Чтобы не терять реактивность с пропсами, мы рекомендуем оборачивать любые пропсы, которые вы хотите отслеживать, в `ReadSignal`. Dioxus автоматически преобразует `T` в `ReadSignal<T>` при передаче пропсов компоненту. Это гарантирует, что ваши пропсы отслеживаются и перезапускают любое производное состояние в компоненте:

```rust
// You can track props by wrapping the type in a ReadOnlySignal
// Dioxus will automatically convert T into ReadOnlySignal<T> when you pass
// props to the component
#[component]
fn Count(count: ReadOnlySignal<i32>) -> Element {
    // Then when you read count inside the memo, it subscribes to the count signal
    let double_count = use_memo(move || count() * 2);

    rsx! {
        div { "Double count: {double_count}" }
    }
}
```

## Жизненный Цикл Мемо

Мемо реализованы с помощью [generational-box](https://crates.io/crates/generational-box), что делает все значения Copy, даже если внутреннее значение не реализует Copy.

Это невероятно удобно для разработки UI, но имеет свои компромиссы. Время жизни мемо привязано к времени жизни компонента, в котором он был создан. Если вы удалите компонент, создавший мемо, мемо тоже будет удалён. Вы можете столкнуться с этим, если попытаетесь передать мемо из дочернего компонента в родительский и удалить дочерний компонент. Чтобы избежать этого, вы можете создать мемо выше в дереве компонентов или использовать глобальные мемо.

**Не передавайте мемо вверх по дереву компонентов**. Это вызовет проблемы:

```rust
fn MyComponent() -> Element {
    let child_signal = use_signal(|| None);

    rsx! {
        IncrementButton {
            child_signal
        }
    }
}

#[component]
fn IncrementButton(mut child_signal: Signal<Option<Memo<i32>>>) -> Element {
    let signal_owned_by_child = use_signal(|| 0);
    let memo_owned_by_child = use_memo(move || signal_owned_by_child() * 2);
    // Не делайте так: это может вызвать проблемы, если дочерний компонент будет удалён
    child_signal.set(Some(memo_owned_by_child));

    todo!()
}
```

## Связанные примеры

- [Use Effect](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_effect.rs) — Побочные эффекты с `use_effect`
- [Use Memo](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_memo.rs) — Мемоизированные вычисления
- [Memo Chain](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/memo_chain.rs) — Связанные вычисляемые значения
- [Signals](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/signals.rs) — Базовые паттерны сигналов с эффектами и мемоизацией
