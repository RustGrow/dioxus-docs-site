---
title: Tailwind
---

# Tailwind

Вы можете стилизовать ваше приложение Dioxus с помощью любого CSS-фреймворка на ваш выбор или просто писать ванильный CSS.

Один популярный вариант стилизации вашего приложения Dioxus — [Tailwind](https://tailwindcss.com/). Tailwind позволяет стилизовать ваши элементы с помощью CSS-утилитарных классов. Это руководство покажет вам, как настроить Tailwind CSS с вашим приложением Dioxus.

## Настройка

1. Установите Dioxus CLI:

```bash
cargo install dioxus-cli
```

2. Установите NPM: [https://docs.npmjs.com/downloading-and-installing-node-js-and-npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
3. Установите Tailwind CSS CLI: [https://tailwindcss.com/docs/installation/tailwind-cli](https://tailwindcss.com/docs/installation/tailwind-cli)

4. Создайте файл `input.css` в корне вашего проекта со следующим содержимым:

```css
@import "tailwindcss";
@source "./src/**/*.{rs,html,css}";
```

5. Создайте ссылку на файл `tailwind.css` с помощью manganis где-нибудь в вашем Rust-коде:

```rust
use dioxus::prelude::*;

#[component]
fn app() -> Element {
    rsx! {
        // The Stylesheet component inserts a style link into the head of the document
        document::Stylesheet {
            // Urls are relative to your Cargo.toml file
            href: asset!("/assets/tailwind.css")
        }
    }
}
```

### Бонусные шаги

1. Установите расширение Tailwind CSS для VSCode
2. Перейдите в настройки расширения и найдите секцию экспериментальной поддержки регулярных выражений. Отредактируйте файл setting.json, чтобы он выглядел так:

```json
"tailwindCSS.experimental.classRegex": ["class: \"(.*)\""],
"tailwindCSS.includeLanguages": {
    "rust": "html"
},
```

## Разработка

- Запустите следующую команду в корне проекта, чтобы запустить компилятор Tailwind CSS:

```bash
npx @tailwindcss/cli -i ./input.css -o ./assets/tailwind.css --watch
```

### Веб

- Запустите следующую команду в корне проекта, чтобы запустить dev-сервер Dioxus:

```bash
dx serve
```

- Откройте браузер по адресу [http://localhost:8080](http://localhost:8080).

### Десктоп

- Запустите десктопное приложение Dioxus:

```bash
dx serve --desktop
```

## Связанные примеры

- [Tailwind Integration](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind) — Полная настройка TailwindCSS
