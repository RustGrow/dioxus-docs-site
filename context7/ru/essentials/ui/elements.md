---
title: Элементы и текст
---

# Элементы и текст

Пользовательские интерфейсы собираются путем комбинирования текста и UI-элементов вместе в полезное и визуально привлекательное дерево. Пример текста и элементов с RSX может выглядеть так:

```rust
let author = "Dioxus Labs";
    let content = "Build cool things ✌️";

    rsx! {
        h1 { "Welcome to Dioxus!" }
        h3 { "Brought to you by {author}" }
        p { class: "main-content", {content} }
    }
```

## Текстовые узлы

Любой контент, окруженный кавычками, рендерится как текстовый узел в RSX:

```rust
rsx! { "Hello world" }
```

Текстовые узлы в Dioxus автоматически реализуют те же правила, что и макрос Rust [`format!`](https://doc.rust-lang.org/std/macro.format.html), включая [Display](https://doc.rust-lang.org/std/fmt/trait.Display.html) и [Debug](https://doc.rust-lang.org/std/fmt/trait.Debug.html) печать.

```rust
let world = "earth";
    rsx! { "Hello {world}!" }
```

В отличие от макроса format Rust, `rsx!` позволяет нам встраивать целые Rust-выражения, что может быть очень удобно при работе с сложными объектами или вызовом функций inline.

```rust
let user = use_signal(|| User {
        name: "Dioxus".to_string(),
    });
    rsx! { "Hello {user.read().name}" }
```

## Элементы

Самый базовый строительный блок HTML — это элемент. В RSX элемент объявляется с именем и затем фигурными скобками. Одним из самых распространенных элементов является элемент `input`. Элемент input создает интерактивное поле ввода:

```rust
rsx! {
        input {}
    }
```

## Плейсхолдеры

Элементы input могут иметь плейсхолдеры для отображения подсказки, когда поле пусто:

```rust
rsx! {
        input { placeholder: "type something cool!" }
    }
```

## Встроенные элементы

Dioxus поддерживает все стандартные HTML-элементы. Вы можете использовать любой HTML-тег внутри макроса `rsx!`:

```rust
rsx! {
    div {
        h1 { "Заголовок" }
        p { "Параграф текста" }
        img { src: "image.png" }
        a { href: "https://dioxuslabs.com", "Ссылка" }
    }
}
```

## Пользовательские Элементы и Пространства Имен

Макрос `rsx!` в Dioxus может принимать любое пространство имен, корректное на этапе компиляции. Крейт `dioxus-html` предоставляет пространства имен HTML (и SVG), которые импортируются в прелюдию Dioxus. Однако эта абстракция позволяет добавлять любое пространство имен элементов, при условии, что оно находится в области видимости при вызове `rsx!`.

Элементы для Dioxus должны реализовывать трейт `DioxusElement`, чтобы использоваться в макросе `rsx!`:

```rust ignore
struct div;
impl DioxusElement for div {
    const TAG_NAME: &'static str = "div";
    const NAME_SPACE: Option<&'static str> = None;
}
```

Все элементы должны быть определены как zero-sized struct (unit struct). Эти структуры не имеют накладных расходов и просто предоставляют Rust трюки на уровне типов для шаблонов, корректных на этапе компиляции. Атрибуты затем реализуются как константы на этих unit-структурах.

### Расширение Пространства Имен HTML

При каждом вызове макроса `rsx!` он полагается на модуль `dioxus_elements`, находящийся в области видимости. Когда вы включаете функцию `html` в Dioxus, этот модуль импортируется в прелюдию. Однако вы можете расширить его своими собственными элементами, создав свой собственный модуль `dioxus_elements` и реэкспортируя пространство имен HTML:

```rust ignore
mod dioxus_elements {
    use dioxus::prelude::dioxus_elements::*;
    struct my_element;
    impl DioxusElement for my_element {
        const TAG_NAME: &'static str = "my-element";
        const NAME_SPACE: Option<&'static str> = None;
    }
}
```

Это пока не очень изученная часть Dioxus. Однако система пространств имен делает возможным подсветку синтаксиса, документацию, "go to definition" и корректность на этапе компиляции, поэтому стоит иметь эту абстракцию.
