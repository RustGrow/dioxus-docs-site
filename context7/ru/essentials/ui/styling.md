---
title: Стилизация
---

# Стилизация приложения

Dioxus использует стандартный HTML и CSS для стилизации, что упрощает использование существующих CSS-фреймворков, библиотек и знаний. Эта глава охватывает различные подходы к стилизации ваших Dioxus-приложений — от inline-стилей до CSS-фреймворков вроде TailwindCSS.

## Dioxus использует CSS для стилизации

В отличие от многих других UI-фреймворков, которые вводят собственные системы стилизации, Dioxus принимает нативный подход веба: **HTML и CSS**. Это означает, что вы можете использовать все CSS-знания, инструменты и фреймворки, которые уже знаете и любите.

CSS — безусловно самая популярная система стилизации и чрезвычайно способная. Например, вот скриншот [ebou](https://github.com/terhechte/Ebou) — очень красивого клиента Mastodon, построенного с Dioxus.

![Ebou](/assets/06_docs/ebou-following.png)

Все официальные рендереры Dioxus используют CSS, но другие рендереры вроде [Freya](http://freyaui.dev) могут использовать свою собственную систему стилей. Dioxus автоматически преобразует ваш CSS в соответствующие нативные свойства виджетов, где применимо, хотя в некоторых случаях может потребоваться написать платформо-специфичный код для достижения идеального нативного вида.

## Inline CSS

Самый простой способ добавить стили к элементам — через inline CSS с помощью [HTML-атрибута `style`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/style). Просто напишите ваши CSS-стили в inline-строке:

```rust
use dioxus::prelude::*;

fn App() -> Element {
    rsx! {
        div {
            style: "background-color: blue; color: white; padding: 20px; border-radius: 8px;",
            "This is a styled div!"
        }
    }
}
```

Для лучшей эргономики Dioxus также позволяет устанавливать отдельные CSS-свойства напрямую как атрибуты. Имена CSS-свойств указываются в варианте snake_case:

```rust
fn App() -> Element {
    rsx! {
        div {
            background_color: "blue",
            color: "white",
            padding: "20px",
            border_radius: "8px",
            "This is a styled div!"
        }
    }
}
```

Поскольку CSS-свойства являются атрибутами, можно делать их динамическими, используя Rust-выражения:

```rust
fn App() -> Element {
    let mut is_dark = use_signal(|| false);

    rsx! {
        div {
            background_color: if is_dark() { "black" } else { "white" },
            color: if is_dark() { "white" } else { "black" },
            padding: "20px",
            onclick: move |_| is_dark.toggle(),
            "Click to toggle theme"
        }
    }
}
```

## Таблицы стилей

Для более крупных приложений лучше организовывать стили в отдельных CSS-файлах. Dioxus обеспечивает отличную поддержку CSS-таблиц стилей через макрос `asset!()`.

### Включение CSS-файлов

Создайте CSS-файл в директории `assets` и включите его с помощью макроса `asset!()`. Dioxus предоставляет два "документных" элемента — `document::Link` и `document::Stylesheet`:

```rust
use dioxus::prelude::*;

// Определение CSS-ресурса
static MAIN_CSS: Asset = asset!("/assets/main.css");

fn App() -> Element {
    rsx! {
        // Включение таблицы стилей в head документа
        document::Stylesheet { href: MAIN_CSS }

        div {
            class: "my-component",
            "Hello, styled world!"
        }
    }
}
```

Обратите внимание, что обычный элемент `<link>` тоже работает, хотя он не будет помечен как предзагружаемый при использовании с серверным рендерингом:
```rust
rsx! {
    link { href: asset!("/assets/main.css") }
}
```

Ваш файл `assets/main.css` может выглядеть так:

```css
.my-component {
    background-color: #f0f9ff;
    border: 2px solid #0ea5e9;
    border-radius: 8px;
    padding: 16px;
    font-family: system-ui, sans-serif;
}

.my-component:hover {
    background-color: #e0f2fe;
    transform: translateY(-2px);
    transition: all 0.2s ease;
}
```

### CSS-селекторы

Чтобы использовать объявления стилей из нашей таблицы стилей, можно использовать [селекторы классов](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) и [селекторы ID](https://developer.mozilla.org/en-US/docs/Web/CSS/ID_selectors):

```css
.my-component {
    background-color: #f0f9ff;
}
#root-component {
    font-weight: 500;
}
```

```rust
rsx! {
    div {
        id: "root-component",
        class: "my-component"
    }
}
```

CSS предоставляет несколько селекторов, которые можно использовать в ваших таблицах стилей:

- [**Селекторы элементов**](https://developer.mozilla.org/en-US/docs/Web/CSS/Type_selectors) (`div`, `p`, `h1`): Нацеливаются на HTML-элементы по имени тега
- [**Селекторы классов**](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) (`.my-class`): Нацеливаются на элементы с определённым атрибутом class
- [**Селекторы ID**](https://developer.mozilla.org/en-US/docs/Web/CSS/ID_selectors) (`#my-id`): Нацеливаются на один элемент с определённым атрибутом ID
- [**Селекторы атрибутов**](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) (`[type="text"]`): Нацеливаются на элементы на основе их атрибутов
- [**Селекторы потомков**](https://developer.mozilla.org/en-US/docs/Web/CSS/Descendant_combinator) (`div p`): Нацеливаются на элементы, являющиеся потомками другого элемента
- [**Селекторы дочерних элементов**](https://developer.mozilla.org/en-US/docs/Web/CSS/Child_combinator) (`div > p`): Нацеливаются на прямых потомков элемента
- [**Смежные селекторы соседей**](https://developer.mozilla.org/en-US/docs/Web/CSS/Next-sibling_combinator) (`h1 + p`): Нацеливаются на элементы, непосредственно следующие за другим
- [**Общие селекторы соседей**](https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator) (`h1 ~ p`): Нацеливаются на элементы, являющиеся соседями другого
- [**Псевдоклассовые селекторы**](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) (`:hover`, `:focus`, `:nth-child()`): Нацеливаются на элементы в определённых состояниях
- [**Псевдоэлементные селекторы**](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements) (`::before`, `::after`): Нацеливаются на виртуальные элементы или части элементов
- [**Универсальный селектор**](https://developer.mozilla.org/en-US/docs/Web/CSS/Universal_selectors) (`*`): Нацеливаются на все элементы
- [**Группировка селекторов**](https://developer.mozilla.org/en-US/docs/Web/CSS/Selector_list) (`h1, h2, h3`): Применяют стили к нескольким селекторам сразу

### Условные стили с классами

[HTML-атрибут `class`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/class) поддерживает условную стилизацию и может быть определён несколько раз на одном элементе:

```rust
fn App() -> Element {
    let mut is_active = use_signal(|| false);
    let mut is_large = use_signal(|| false);

    rsx! {
        button {
            class: "btn",
            class: if is_active() { "btn-active" },
            class: if is_large() { "btn-large" },
            onclick: move |_| is_active.toggle(),
            "Toggle me!"
        }
    }
}
```

В HTML атрибут `class` задаёт список CSS-классов, которые имеет конкретный элемент. Соответствующая CSS-таблица стилей может включать несколько классов, которые используют ваши элементы:

```css
/* Базовый класс `btn`, который использует кнопка */
.btn {
    background-color: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* Класс "active", добавляемый, когда `is_active()` истинно */
.btn-active {
    background-color: #3b82f6;
    color: white;
    border-color: #2563eb;
}

/* Класс "large", добавляемый, когда `is_large()` истинно */
.btn-large {
    padding: 12px 24px;
    font-size: 16px;
}
```

### CSS custom properties для темизации

Можно использовать CSS custom properties (переменные) для согласованной темизации. Это обычно предпочтительнее использования Rust-переменных, так как динамическое форматирование строк может быть менее эффективным и сложнее для оптимизации.

```css
:root {
    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
    --color-text: #1f2937;
    --color-background: #ffffff;
    --border-radius: 6px;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
}

.button {
    background: var(--color-primary);
    color: var(--color-background);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
    border: none;
    cursor: pointer;
}

.button:hover {
    background: var(--color-primary-hover);
}
```

## SCSS

Dioxus поддерживает SCSS (Sass) файлы из коробки. Просто используйте макрос `asset!()` с файлами `.scss`:

```rust
static STYLES: Asset = asset!("/assets/styles.scss");
```

Ваш файл `assets/styles.scss` может использовать все возможности SCSS:

```css
$primary-color: #3b82f6;
$secondary-color: #64748b;
$border-radius: 8px;

.card {
    background: white;
    border-radius: $border-radius;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header {
        background: $primary-color;
        color: white;
        padding: 16px;
        border-radius: $border-radius $border-radius 0 0;
    }

    .content {
        padding: 16px;
        color: $secondary-color;
    }
}
```

## Tailwind

[Tailwind CSS](https://tailwindcss.com/) — популярный utility-first CSS-фреймворк, который отлично работает с Dioxus. Он позволяет стилизовать элементы, используя предопределённые utility-классы. Этот самый документационный сайт использует Tailwind! Мы можем просто использовать tailwind-классы в Dioxus:

```rust
rsx! {
    div { class: "flex flex-col items-center p-7 rounded-2xl",
        img { class: "size-48 shadow-xl rounded-md", src: "/img/cover.png" }
        div { class: "flex",
            span { "Class Warfare" }
            span { "The Anti-Patterns" }
            span { class: "flex",
                span { "No. 4" }
                span { "·" }
                span { "2025" }
            }
        }
    }
}
```

Начиная с Dioxus 0.7, DX автоматически загружает и запускает наблюдатель TailwindCSS за вас. Всякий раз, когда вы собираете проект с DX, CLI Tailwind собирает ваши классы и генерирует выходной файл в `assets/tailwind.css`.

<video src="/assets/07/tailwind-inline.mp4" controls></video>

DX автоматически обнаруживает, использует ли ваш проект TailwindCSS, если находит файл с именем "tailwind.css" в корне проекта. В этом файле вы объявляете базовый импорт Tailwind и дополнительную строку, чтобы наблюдатель искал Rust-файлы:

```css
@import "tailwindcss";
@source "./src/**/*.{rs,html,css}";
```

Обратите внимание, что нам нужно добавить сгенерированную таблицу стилей в наше приложение:

```rust
fn app() -> Element {
    rsx! {
        document::Stylesheet { href: asset!("/assets/tailwind.css") }
    }
}
```

Tailwind предоставляет много [переменных темы для настройки](https://tailwindcss.com/docs/theme), что можно сделать, обновив файл `tailwind.css`. Например, можно настроить шрифт документа или определить пользовательскую цветовую палитру.

```css
@theme {
    --color-dxblue: #00A8D6;
    --color-ghmetal: #24292f;
    --color-ghdarkmetal: #161b22;
    --color-ideblack: #0e1116;
    --font-sans: "Inter var", sans-serif;
}
```

Tailwind работает с поддержкой множественных атрибутов class в Dioxus:

```rust
fn Card() -> Element {
    let mut is_hovered = use_signal(|| false);

    rsx! {
        div {
            class: "bg-white rounded-lg shadow-md p-6 m-4",
            class: if is_hovered() { "shadow-xl transform -translate-y-1" },
            class: "transition-all duration-200",

            onmouseenter: move |_| is_hovered.set(true),
            onmouseleave: move |_| is_hovered.set(false),

            h2 {
                class: "text-xl font-bold text-gray-800 mb-2",
                "Card Title"
            }
            p {
                class: "text-gray-600",
                "This is a beautiful card component styled with Tailwind CSS."
            }
        }
    }
}
```

### Интеграция с VSCode

Для лучшего опыта разработки с Tailwind установите расширение Tailwind CSS IntelliSense и добавьте это в настройки VSCode:

```json
{
    "tailwindCSS.experimental.classRegex": ["class: \"(.*)\""],
    "tailwindCSS.includeLanguages": {
        "rust": "html"
    }
}
```

## Размещение элементов

Если вы знакомы с HTML и CSS, то, скорее всего, уже знаете, как располагать HTML-элементы для создания желаемого интерфейса. Однако если HTML и CSS для вас новы, стоит понять множество способов размещения элементов на странице. CSS поддерживает несколько систем раскладки одновременно:

- **Normal Flow**: Раскладка по умолчанию, где элементы стопятся вертикально (блочные элементы) или текут горизонтально (строчные элементы)
- **Flexbox**: Одномерная система раскладки для размещения элементов в строках или столбцах с гибким размером и выравниванием
- **CSS Grid**: Двумерная система раскладки для создания сложных сеточных макетов с строками и столбцами
- **Float**: Устаревший метод раскладки, который перемещает элементы влево или вправо, позволяя тексту обтекать их
- **Positioning**: Позволяет точно контролировать размещение элемента с помощью `static`, `relative`, `absolute`, `fixed` или `sticky`
- **Table Layout**: Отображает элементы как ячейки, строки и столбцы таблицы (можно использовать с нетабличными элементами через `display: table`)
- **Multi-column**: Разбивает контент на несколько колонок, подобно газетным макетам

Обычно вы будете использовать либо Flexbox, либо CSS Grid.

### Flexbox Layout

Flexbox невероятно удобен для создания адаптивных пользовательских интерфейсов. При изменении размера области просмотра документа элементы автоматически подстраивают свой размер и размещение под свои flex-ограничения. [Руководство CSS-Tricks](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) предоставляет очень полезный туториал по всем flex-ограничениям, которые можно использовать.

![Flexbox Guide](/assets/07/flexbox-diagram.webp)

### CSS Grid

CSS Grid — ещё одна мощная система раскладки. Можно использовать CSS-таблицы стилей для объявления именованных областей документа, разделяя их по фиксированным или гибким линиям сетки. Существует несколько онлайн-инструментов, предоставляющих [графический интерфейс](https://grid.layoutit.com) для построения сеточных макетов.

### Fixed Position Layout

![CSS Grid Guide](/assets/07/css-grid.svg)

Иногда вам потребуется обратиться к [раскладкам с фиксированным позиционированием](https://developer.mozilla.org/en-US/docs/Web/CSS/position). Они, как правило, менее гибкие, чем CSS Grid и Flexbox, но позволяют реализовать функции вроде липких заголовков и динамически позиционированного контента.

## Иконки и SVG

Dioxus поддерживает несколько подходов для включения иконок и SVG-графики в ваши приложения.

### Inline SVG

Можно включать SVG прямо в ваш RSX:

```rust
fn IconButton() -> Element {
    rsx! {
        button {
            class: "flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded",

            // Inline SVG icon
            svg {
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "currentColor",
                path {
                    d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                }
            }

            "Star"
        }
    }
}
```

### SVG-ресурсы

Для более крупных или переиспользуемых SVG-файлов можно хранить их в отдельном файле и импортировать с помощью макроса `asset!()`.

```rust
fn Icon() -> Element {
    rsx! {
        img {
            src: asset!("/assets/logo.svg"),
            alt: "Logo",
            class: "h-8 w-8"
        }
    }
}
```

### Библиотеки иконок

Можно также использовать Rust-крейты, предоставляющие коллекции иконок. Существует несколько библиотек:

- [Dioxus Free Icons](https://crates.io/crates/dioxus-free-icons) — Библиотека FreeIcons для Dioxus
- [Dioxus Material Icons](https://crates.io/crates/dioxus-material-icons) — Библиотека Google Material Icons для Dioxus
- [Dioxus Hero Icons](https://crates.io/crates/dioxus-heroicons) — Библиотека HeroIcons для Dioxus

```rust
use dioxus_free_icons::{Icon, icons::fa_solid_icons};

fn App() -> Element {
    rsx! {
        Icon {
            width: 30,
            height: 30,
            fill: "blue",
            icon: fa_solid_icons::FaHeart
        }
    }
}
```

### Использование `dangerous_inner_html`

Если вы хотите включить иконки из их сырого HTML-представления, можно использовать `dangerous_inner_html`, который устанавливает контент из Rust-строки:

```rust
rsx! {
    svg { dangerous_inner_html: r#"<path d="M256 352 128 160h256z" />"# }
}
```

## CSS Modules и Scoped CSS

Dioxus поддерживает **CSS Modules** и **Scoped CSS** из коробки, позволяя писать стили с ограниченной областью видимости компонента, не беспокоясь о глобальных коллизиях имён классов.

### CSS Modules

CSS Modules — это CSS-файлы, где все имена классов по умолчанию локально ограничены. Чтобы использовать CSS Modules, назовите файл с расширением `.module.css` и импортируйте его с помощью макроса `asset!()`:

```css
/* assets/styles.module.css */
.container {
    padding: 20px;
    background-color: #f0f9ff;
}

.title {
    font-size: 24px;
    color: #0ea5e9;
}
```

```rust
static STYLES: Asset = asset!("/assets/styles.module.css");

fn App() -> Element {
    rsx! {
        document::Stylesheet { href: STYLES }

        div {
            class: "container",
            h1 { class: "title", "Привет из CSS Modules!" }
        }
    }
}
```

Под капотом Dioxus преобразует имена классов в уникальные идентификаторы, предотвращая коллизии между разными компонентами.

### Scoped CSS

Для быстрых стилей с ограниченной областью видимости компонента можно использовать элемент `style` с атрибутом `scoped` (или использовать встроенные блоки стилей). Scoped CSS гарантирует, что стили применяются только к компоненту, где они определены:

```rust
fn MyComponent() -> Element {
    rsx! {
        style { r#"
            .container {
                padding: 16px;
                border: 1px solid #e5e7eb;
            }
            .title {
                font-weight: bold;
            }
        "# }

        div {
            class: "container",
            h1 { class: "title", "Scoped Styles" }
        }
    }
}
```

> **Примечание:** Поддержка Scoped CSS может варьироваться в зависимости от рендерера. CSS Modules — рекомендуемый подход для production-приложений.

## Связанные примеры

- [Dynamic Classes](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/dynamic_classes.rs) — Изменение CSS-классов во время выполнения
- [Inline Styles](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/inline_styles.rs) — Style-атрибуты в RSX
- [Dynamic Styles](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/dynamic_styles.rs) — Динамическое обновление CSS
- [CSS Modules](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/css_modules.rs) — CSS с ограниченной областью видимости
- [Stylesheet](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/stylesheet.rs) — Загрузка CSS-файлов
- [Tailwind Integration](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind) — Полная настройка TailwindCSS
