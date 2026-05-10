---
title: Пользовательский Ввод
---

# Обработка Пользовательского Ввода

Пришло время сделать наше приложение интерактивным! В Dioxus пользовательский ввод обрабатывается путем прикрепления слушателей событий к элементам. Когда слушатель события срабатывает, Dioxus выполняет предоставленное замыкание. В замыкании вы можете записывать в сигналы, логировать сообщения, делать сетевые запросы или выполнять любое действие, которое делает UI *живым*.

```rust
fn app() -> Element {
    let mut count = use_signal(|| 0);

    rsx! {
        h1 { "Счетчик дай-пять: {count}" }
        button { onclick: move |_| count += 1, "Вверх!" }
        button { onclick: move |_| count -= 1, "Вниз!" }
    }
}
```

## Обработчики Событий

Обработчики событий — это колбэки, используемые для реагирования на действия пользователя. Обработчики событий могут захватывать десятки различных взаимодействий: клики по кнопкам, прокрутку страницы, движение мыши, текстовый ввод и многое другое.

Добавление обработчика события к элементу похоже на добавление атрибута с синтаксисом `key: value`. Имя обработчика обычно начинается с `on` — и принимает замыкание как значение. Например, чтобы обрабатывать клики по кнопке, мы можем добавить обработчик `onclick`:

```rust
rsx! {
        button { width: "100%", height: "100%",
// This event handler will be called when the button is clicked
            onclick: move |event| log!("Clicked! Event: {event:#?}"),
            "click me!"
        }
    }
```

Доступно множество различных обработчиков событий:

- **События Мыши**: `onclick`, `onauxclick`, `onmouseover`, `onmousedown`, `onmousemove` и т.д.
- **События Клавиатуры**: `onkeydown`, `onkeyup`, `onkeypress`
- **События Форм**: `onsubmit`, `oninput`, `onchange` и т.д.
- **События Фокуса**: `onfocus`, `onblur`
- **События Drag-and-Drop**: `ondrag`, `ondrop`, `ondragover` и т.д.
- **UI События**: `onscroll`, `onscrollend`, `onload`, `onresize`

Полный список слушателей событий доступен в [документации MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events).


## Объект События

Обработчики событий получают объект [`Event`](https://docs.rs/dioxus-core/latest/dioxus_core/struct.Event.html), содержащий информацию о событии. Разные типы событий содержат разные типы данных. Например, события, связанные с мышью, содержат [`MouseData`](https://docs.rs/dioxus/latest/dioxus/events/struct.MouseData.html), который предоставляет детали, такие как позиция мыши и какие кнопки мыши были нажаты.

Объект события — это первый аргумент в колбэке обработчика события:

```rust
rsx! {
    button {
        onclick: move |event| {   // <-- наш объект `Event`
            //
        }
    }
}
```

В примере выше данные события были залогированы в терминал:

```
Clicked! Event: UiEvent { bubble_state: Cell { value: true }, data: MouseData { coordinates: Coordinates { screen: (242.0, 256.0), client: (26.0, 17.0), element: (16.0, 7.0), page: (26.0, 17.0) }, modifiers: (empty), held_buttons: EnumSet(), trigger_button: Some(Primary) } }
Clicked! Event: UiEvent { bubble_state: Cell { value: true }, data: MouseData { coordinates: Coordinates { screen: (242.0, 256.0), client: (26.0, 17.0), element: (16.0, 7.0), page: (26.0, 17.0) }, modifiers: (empty), held_buttons: EnumSet(), trigger_button: Some(Primary) } }
```

> Чтобы узнать, какие типы событий предоставляются для HTML, прочитайте [документацию модуля events](https://docs.rs/dioxus-html/latest/dioxus_html/events/index.html).

## Время Жизни Событий

Обработчики событий принимают замыкание с временем жизни `'static`. Это означает, что замыкание может получить доступ только к данным, которые либо существуют на протяжении всей жизни приложения, либо к данным, которые вы перемещаете в замыкание.

Состояние в Dioxus реализует `Copy`, что делает его очень легким для перемещения в `'static` замыкания, такие как обработчики событий:

```rust
let mut count = use_signal(|| 0);

rsx! {
    button {
        // Поскольку мы добавили ключевое слово `move`, замыкание переместит сигнал `count` внутрь себя
        onclick: move |_| {
            count.set(count() + 1);
        },
        "Нажми меня"
    }
};
```

Если вам нужно получить доступ к данным, которые не реализуют `Copy`, вам может понадобиться клонировать данные перед перемещением их в замыкание:

```rust
// String не реализует `Copy`
let string = "hello world".to_string();

rsx! {
    button {
        // Строка имеет только одного владельца. Мы могли бы переместить её в это замыкание,
        // но поскольку мы хотим использовать строку в других замыканиях позже, мы клонируем её
        onclick: {
            // Клонируем строку в новом блоке
            let string = string.clone();
            // Затем перемещаем клонированную строку в замыкание
            move |_| println!("{}", string)
        },
        "Напечатать hello world"
    }
    button {
        // Мы не используем строку после этого замыкания, поэтому можем просто переместить её в замыкание
        onclick: move |_| println!("{}", string),
        "Напечатать hello world ещё раз"
    }
};
```

## Обработка Распространенных Событий

Самое распространенное действие, которое вы будете выполнять в обработчике события, — это изменение состояния приложения. Это может включать обновление фильтра, переключение переключателя или представление обратной связи на текстовый ввод.

Для компонентов вроде переключателей мы можем использовать булев сигнал и чекбокс:

```rust
let mut upload_enabled = use_signal(|| true);
rsx! {
    input {
        type: "checkbox",

        // устанавливаем сигнал upload_enabled
        oninput: move |evt| upload_enabled.set(evt.checked()),
    }
}
```

Для компонентов вроде фильтров мы можем использовать HTML-элемент `select`:

```rust
let mut option = use_signal(|| None);
rsx! {
    select {
        // устанавливаем сигнал в значение `select`
        oninput: move |evt| option.set(Some(evt.value())),

        option { label: "Sedan", value: "sedan" }
        option { label: "Suv", value: "suv" }
        option { label: "Truck", value: "truck" }
    }
}
```

Для текста мы можем использовать элемент `input`:

```rust
let mut first_name = use_signal(|| "".to_string());
rsx! {
    input {
        type: "text",
        placeholder: "First Name…",

        // Обновляем сигнал first_name при текстовом вводе
        oninput: move |e| first_name.set(e.value()),
    }
}
```

Для форм мы можем использовать HashMap для хранения пар ключ-значение:

```rust
let mut values = use_signal(HashMap::new);

rsx! {
    form {
        onsubmit: move |evt| {
            // Предотвращаем стандартную навигацию при отправке формы
            evt.prevent_default();
            values.set(evt.values());
        },

        label { for: "username", "Username" }
        input { type: "text", name: "username" }
    }
}
```

Dioxus мостит границу между Rust и JavaScript, добавляя эргономичные методы доступа на объект `Event` для облегчения чтения значений из DOM. К ним относятся:

- Метод `.value()` для событий ввода, чтобы прочитать содержимое ввода
- Метод `.values()` для событий форм, чтобы прочитать все значения формы
- Метод `.checked()` для событий чекбокса, чтобы прочитать состояние `.checked`
- Событие `.files()` для чтения любых загруженных файлов
- Событие `.key()` для преобразования событий keydown в перечисление Rust `Key`
- и многие другие методы!

> Мы предоставляем большое количество примеров в [репозитории Dioxus на GitHub](https://github.com/DioxusLabs/dioxus/tree/main/examples). Обязательно также прочитайте документацию по [обработке событий в HTML](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events).



## Управляемые vs Неуправляемые Вводы

Dioxus предоставляет два способа обработки состояния элементов ввода:

- **Неуправляемый режим**: режим по умолчанию, где элемент ввода управляет своим собственным состоянием
- **Управляемый режим**: альтернативный режим, где вы управляете состоянием элемента ввода вручную

Управляемый режим полезен, если вы планируете преобразовывать или программно изменять ввод пользователя.

### Неуправляемые Вводы

*Неуправляемый режим* — это режим по умолчанию для элементов ввода. В этом режиме элемент ввода сам управляет своим состоянием, таким как значение ввода, позиция курсора и фокус. Мы просто прикрепляем слушатель события к вводу и реагируем на изменения значения:

```rust
pub fn App() -> Element {
    rsx! {
        form { onsubmit: move |event| { tracing::info!("Submitted! {event:?}") },
            input { name: "name" }
            input { name: "age" }
            input { name: "date" }
            input { r#type: "submit" }
        }
    }
}
```
```
Submitted! UiEvent { data: FormData { value: "", values: {"age": "very old", "date": "1966", "name": "Fred"} } }
```

В этом режиме мы не контролируем фактическое значение ввода. Пользователь может ввести любое значение, и наш код обновляет состояние в ответ.

### Управляемые Вводы

*Управляемый режим* — это альтернативный режим для элементов ввода, где вы напрямую контролируете состояние ввода. Если пользователь вводит некорректный текст в поле ввода, вы можете отклонить его или перезаписать.

Чтобы перевести элемент ввода в управляемый режим, мы напрямую управляем его атрибутом `value`:

```rust
pub fn App() -> Element {
    let mut name = use_signal(|| "bob".to_string());

    rsx! {
        input {
// we tell the component what to render
            value: "{name().to_ascii_uppercase()}",
// and what to do when the value changes
            oninput: move |event| name.set(event.value())
        }
    }
}
```


Управляемые вводы обеспечивают больший контроль над поведением элемента ввода. Вы можете:

- Преобразовывать ввод по мере его изменения (например, чтобы убедиться, что он в верхнем регистре)
- Валидировать ввод, отклоняя невалидные вводы
- Программно изменять значение (например, кнопка "randomize", которая заполняет ввод случайными данными)

## Распространение Событий

Когда пользователь взаимодействует с нашим приложением, его взаимодействия могут вызвать несколько слушателей событий одновременно. В простейшем случае `div` может содержать `button` — оба со своими слушателями `onclick`:

![Несколько Слушателей](/assets/07/multiple-listeners.png)

В каком порядке сработают слушатели? Обработка событий происходит в две фазы:

- **Захват События**: Слушатели срабатывают, когда событие "спускается" к цели.
- **Всплытие События**: Слушатели срабатывают, когда событие "всплывает" к корню.

По умолчанию Dioxus захватывает только фазу "всплытия" события, поэтому внутренняя кнопка получит событие `onclick` раньше, чем `div`.

![Диаграмма Всплытия](/assets/07/event-capturing.png)

По мере того как событие всплывает к корневому элементу (в данном случае к корню документа), у вас есть возможность предотвратить срабатывание любых дальнейших слушателей. Чтобы остановить распространение события вверх, вы можете вызвать метод `stop_propagation()` на событии:

```rust
rsx! {
        div { onclick: move |_event| {},
            "outer"
            button {
                onclick: move |event| {
                    event.stop_propagation();
                },
                "inner"
            }
        }
    }
```

Это гарантирует, что *только* внутренняя кнопка выполнит свой обработчик `onclick` — обработчик `div` не будет вызван. Это поведение может быть полезно при создании продвинутого UI, такого как взаимодействия drag-and-drop и пользовательские меню.

> Для получения дополнительной информации о распространении событий см. [документацию MDN по всплытию событий](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling)

## Prevent Default

Некоторые события имеют поведение по умолчанию. Для событий клавиатуры это может быть ввод набранного символа. Для событий мыши — выделение текста. Для форм — отправка формы и навигация по странице.

Вы можете вызвать метод `prevent_default()` на событии, чтобы остановить это поведение по умолчанию.

```rust
rsx! {
        a {
            href: "https://example.com",
            onclick: |evt| {
                evt.prevent_default();
                log!("link clicked")
            },
            "example.com"
        }
    }
```


Обработчики событий все равно будут вызваны, но "по умолчанию" поведение взаимодействия будет отменено. Метод `prevent_default()` часто используется во взаимодействиях, таких как:

- Захват сброса файлов
- Предотвращение навигаций форм
- Переопределение поведения элемента `a` ссылки
- Запрет определенного текстового ввода
- Включение поведения drag-and-drop для произвольных элементов

> Для получения дополнительной информации о поведениях по умолчанию см. [документацию MDN по preventDefault()](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)

## Приведение к Нативным Событиям

В некоторых случаях тип Dioxus `Event` не пробрасывает достаточно данных события. В этих случаях мы можем напрямую получить доступ к платформенно-специфичному типу события. Dioxus не делает этого автоматически, так как не все платформы имеют согласованный интерфейс событий: некоторые платформы предоставляют более богатые детали, чем другие.

Чтобы привести событие, мы можем использовать `event.downcast::<T>()` где `T` — это тип, к которому мы пытаемся привести. Вы в основном будете использовать это расширение при создании веб-приложений для приведения к базовому событию `web_sys`:

```rust
rsx! {
    button {
        onclick: move |evt| {
            let web_evt = evt.downcast::<web_sys::Event>().unwrap();
            let target = web_evt.target().unwrap();
            log!("target: {:?}", target);
        },
        "Click me!"
    }
}
```

## Асинхронные Обработчики

Обработчики Событий могут быть как синхронными, так и асинхронными. Dioxus автоматически вызывает `spawn()` для Futures, произведенных асинхронными обработчиками событий:

```rust
rsx! {
    button {
        onclick: move |evt| async move {
            let res = reqwest::get("https://dog.ceo/api/breeds/image/random/")
                .await
                .unwrap()
                .json::<DogApi>()
                .await;
            log!("res: {:?}", res);
        },
        "Fetch a dog!"
    }
}
```

Dioxus не отменяет предыдущие Tasks, запущенные обработчиком onclick, поэтому несколько быстрых кликов по кнопке запустят несколько конкурентных запросов. Будьте осторожны, чтобы не мутировать состояние в асинхронных обработчиках без предварительной синхронизации.


## Обработка файлов
Вы можете вставить выбор файлов, используя элемент ввода типа `file`. Этот элемент поддерживает атрибут `multiple`, позволяя выбрать несколько файлов одновременно. Вы можете выбрать папку, добавив атрибут `directory`: Dioxus отобразит этот атрибут на специфичные для браузера атрибуты, так как нет стандартизированного способа разрешить выбор директории.

Извлечение выбранных файлов немного отличается от того, к чему вы, возможно, привыкли в Javascript.

Событие `FormData` содержит поле `files` с данными о загруженных файлах. Это поле содержит структуру `FileEngine`, которая позволяет получить имена файлов, выбранных пользователем. Этот пример сохраняет имена файлов выбранных файлов в `Vec`:

```rust
pub fn App() -> Element {
ANCHOR: rsx
    let mut filenames: Signal<Vec<String>> = use_signal(Vec::new);
    rsx! {
        input {
// tell the input to pick a file
            type: "file",
// list the accepted extensions
            accept: ".txt,.rs",
// pick multiple files
            multiple: true,
            onchange: move |evt| {
                for file in evt.files() {
                    filenames.write().push(file.name());
                }
            }
        }
    }
ANCHOR_END: rsx
}
```

Если вы планируете читать содержимое файла, вам нужно делать это асинхронно, чтобы остальная часть UI оставалась интерактивной. Этот пример обработчика события загружает содержимое выбранных файлов в асинхронном замыкании:

```rust
onchange: move |evt| {
                async move {
                    for file in evt.files() {
                        if let Ok(file) = file.read_string().await {
                            files_uploaded.write().push(file);
                        }
                    }
                }
            }
```

Наконец, этот пример показывает, как выбрать папку, установив атрибут `directory` в `true`.

```rust
input {
            type: "file",
// Select a folder by setting the directory attribute
            directory: true,
            onchange: move |evt| {
                for file in evt.files() {
                    println!("{}", file.name());
                }
            }
        }
```

## Пропсы-Обработчики

Иногда вы можете захотеть создать компонент, который принимает обработчик события. Простой пример — компонент `FancyButton`, который принимает обработчик `onclick` с типом `EventHandler`:

```rust
#[derive(PartialEq, Clone, Props)]
pub struct FancyButtonProps {
    onclick: EventHandler<MouseEvent>,
}

pub fn FancyButton(props: FancyButtonProps) -> Element {
    rsx! {
        button {
            class: "fancy-button",
ANCHOR: call
            onclick: move |evt| props.onclick.call(evt),
ANCHOR_END: call
            "Click me!"
        }
    }
}
```

Чтобы фактически вызвать обработчик события, вы вызываете его с помощью метода `.call()`:

```rust
onclick: move |evt| props.onclick.call(evt),
```

> Примечание: как и любой другой атрибут, вы можете называть обработчики как угодно! Любое замыкание, которое вы передаете, будет автоматически преобразовано в `EventHandler`.

## Пользовательские Данные

Обработчики Событий являются обобщенными по первому аргументу замыкания, поэтому вы можете передавать любые данные, например:

```rust
struct ComplexData(i32);

#[derive(PartialEq, Clone, Props)]
pub struct CustomFancyButtonProps {
    onclick: EventHandler<ComplexData>,
}

pub fn CustomFancyButton(props: CustomFancyButtonProps) -> Element {
    rsx! {
        button {
            class: "fancy-button",
            onclick: move |_| props.onclick.call(ComplexData(0)),
            "click me pls."
        }
    }
}
```

Тип `EventHandler<T>` является подмножеством базового типа `Callback<Args, Ret>`, который позволяет вам возвращать значение из замыкания.

## Возврат Значения из Обработчика События

Если вы хотите принять замыкание, возвращающее значение, вы можете использовать тип `Callback`. Тип callback принимает два дженерик-аргумента, `I` — тип входных данных, и `O` — тип выходных данных. Как и `EventHandler`, `Callback` автоматически преобразуется в пропсах и может быть легко скопирован в любом месте вашего компонента:

```rust
#[derive(PartialEq, Clone, Props)]
pub struct CounterProps {
    modify: Callback<u32, u32>,
}

pub fn Counter(props: CounterProps) -> Element {
    let mut count = use_signal(|| 1);

    rsx! {
        button {
            onclick: move |_| count.set(props.modify.call(count())),
            "double"
        }
        div { "count: {count}" }
    }
}
```

## Колбэки Несут Рантайм

Многие функции рантайма Dioxus являются "свободными функциями" — вы можете свободно вызывать их без необходимости иметь явный handle к рантайму Dioxus. Это работает путем неявной установки thread-local, называемого "current runtime", примерно эквивалентно этому псевдокоду:

```rust
thread_local! {
    static CURRENT_RUNTIME: Cell<Option<Runtime>> = Cell::new(None);
}

fn render_users_component(app: &Application) {
    CURRENT_RUNTIME.set(app.runtime());
    app.run_component();
    CURRENT_RUNTIME.set(None);
}
```

Всякий раз, когда *ваш* код выполняется изнутри Dioxus, рантайм всегда будет установлен. Однако простые замыкания не устанавливают текущий рантайм автоматически. Попытка вызвать замыкания вне приложения, которые ссылаются на состояние изнутри приложения, может вызвать панику.

К счастью, типы `EventHandler` и `Callback` несут handle к рантайму Dioxus, гарантируя успех методов рантайма. Когда колбэк вызывается, замыкание устанавливает переменную `CURRENT_RUNTIME`. Это означает, что вы можете передавать типы `EventHandler` и `Callback` в API, такие как наблюдатели файловой системы и системный IO, где рантайм Dioxus обычно не активен.

## Распространенные Ошибки Обработчиков Событий

### `function requires argument type to outlive 'static`

Обработчики событий в Dioxus должны иметь доступ только к данным, которые могут существовать на протяжении всей жизни приложения. Обычно это означает данные, которые перемещены в замыкание. **Если вы получаете эту ошибку, возможно, вы забыли добавить `move` в ваше замыкание.**

Сломанный компонент:

```rust compile_fail
fn App() -> Element {
    // Сигналы реализуют `Copy`, что делает их очень легкими для перемещения в `'static` замыкания
    let state = use_signal(|| "hello world".to_string());

    rsx! {
        button {
            // ❌ Без `move` Rust попытается заимствовать сигнал `state`, что приведет к ошибке,
            // потому что сигнал удаляется в конце функции
            onclick: |_| {
                println!("Вы нажали кнопку! Состояние: {state}");
            },
            "Нажми меня"
        }
    }
    // Сигнал удаляется здесь, но обработчик события всё ещё должен иметь к нему доступ
}
```

Исправленный компонент:

```rust
fn App() -> Element {
    let state = use_signal(|| "hello world".to_string());

    rsx! {
        button {
            // ✅ Ключевое слово `move` говорит Rust переместить сигнал `state` в замыкание.
            // Поскольку замыкание владеет состоянием сигнала, оно может читать его даже после возврата функции
            onclick: move |_| {
                println!("Вы нажали кнопку! Состояние: {state}");
            },
            "Нажми меня"
        }
    }
}
```

### `use of moved value: your_value`

Данные в Rust имеют одного владельца. Если вы столкнулись с этой ошибкой, вы, вероятно, попытались переместить данные, не реализующие `Copy`, в два разных замыкания. **Вы можете исправить эту проблему, сделав данные `Copy` или вызвав `clone` перед перемещением в замыкание.**

Сломанный компонент:

```rust compile_fail
#[component]
fn MyComponent(string: String) -> Element {
    rsx! {
        button {
            // ❌ Мы перемещаем строку в обработчик onclick, поэтому не можем получить к ней доступ в другом месте
            onclick: move |_| {
                println!("{string}");
            },
            "Напечатать hello world"
        }
        button {
            // ❌ Поскольку мы уже переместили строку, мы не можем переместить её во второй обработчик. Это вызовет ошибку компиляции
            onclick: move |_| {
                println!("{string}");
            },
            "Напечатать hello world ещё раз"
        }
    }
}
```

Вы можете исправить эту проблему одним из следующих способов:

- Сделав данные `Copy` с помощью `ReadSignal`:

```rust
#[component]
fn MyComponent(string: ReadSignal<String>) -> Element {
    rsx! {
        button {
            // ✅ Поскольку сигнал `string` реализует `Copy`, мы можем копировать его в замыкание,
            // при этом сохраняя доступ к нему в другом месте
            onclick: move |_| println!("{}", string),
            "Напечатать hello world"
        }
        button {
            // ✅ Поскольку `string` реализует `Copy`, мы можем переместить его во второй обработчик
            onclick: move |_| println!("{}", string),
            "Напечатать hello world ещё раз"
        }
    }
}
```

- Вызвав `clone` для данных перед перемещением в замыкание:

```rust
#[component]
fn MyComponent(string: String) -> Element {
    rsx! {
        button {
            // ✅ У строки только один владелец. Мы могли бы переместить её в это замыкание,
            // но поскольку мы хотим использовать строку в других замыканиях позже, мы клонируем её
            onclick: {
                // Клонируем строку в новом блоке
                let string = string.clone();
                // Затем перемещаем клонированную строку в замыкание
                move |_| println!("{}", string)
            },
            "Напечатать hello world"
        }
        button {
            // ✅ Мы не используем строку после этого замыкания, поэтому можем просто переместить её в замыкание
            onclick: move |_| println!("{}", string),
            "Напечатать hello world ещё раз"
        }
    }
}
```

## Связанные примеры

- [Forms](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/forms.rs) — Обработка и валидация форм
- [Inputs](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/inputs.rs) — Текстовые поля и контролируемые компоненты
- [Checkbox & Radio](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/checkbox_radio.rs) — Элементы форм с состоянием
- [Nested Listeners](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/nested_listeners.rs) — Всплытие событий и вложенные обработчики
- [Event Handler Prop](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/event_handler_prop.rs) — Передача колбэков как пропсов
