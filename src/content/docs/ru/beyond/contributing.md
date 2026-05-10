---
title: Участие в проекте
---

# Участие в проекте

Разработка ведётся в [репозитории Dioxus на GitHub](https://github.com/DioxusLabs/dioxus). Если вы нашли баг или у вас есть идея для фичи, пожалуйста, создайте issue (но сначала проверьте, не сделал ли это кто-то [уже](https://github.com/DioxusLabs/dioxus/issues)).

[GitHub Discussions](https://github.com/DioxusLabs/dioxus/discussions) можно использовать для обращения за помощью или обсуждения фич. Вы также можете присоединиться к [нашему каналу Discord](https://discord.gg/XgGxMSkvUM), где происходят некоторые обсуждения разработки.

## Улучшение документации

Если вы хотите улучшить документацию, PR приветствуются! Rust-документация ([исходники](https://github.com/DioxusLabs/dioxus/tree/main/packages)) и это руководство ([исходники](https://github.com/DioxusLabs/docsite/tree/main/docs-src/0.7)) находятся в соответствующих репозиториях GitHub.

## Работа над экосистемой

Часть того, что делает React великим — это богатая экосистема. Мы хотим того же для Dioxus! Так что если у вас есть идея библиотеки, которую вы хотели бы написать, и многие бы от неё выиграли, это будет только приветствоваться. Вы можете просмотреть [npm.js](https://www.npmjs.com/search?q=keywords:react-component) для вдохновения. Когда закончите, добавьте свою библиотеку в список [awesome dioxus](https://github.com/DioxusLabs/awesome-dioxus) или поделитесь ею в канале `#I-made-a-thing` на [Discord](https://discord.gg/XgGxMSkvUM).

## Баги и фичи

Если вы исправили [открытый issue](https://github.com/DioxusLabs/dioxus/issues), не стесняйтесь отправлять PR! Рекомендуется [связаться](https://discord.gg/XgGxMSkvUM) с командой заранее, чтобы убедиться, что все на одной волне, и вы не делаете бесполезную работу!

Все pull request (включая те, что сделаны членами команды) должны быть одобрены как минимум одним другим членом команды.
Более крупные и нюансированные решения по дизайну, архитектуре, критическим изменениям, компромиссам и т.д. принимаются командой по консенсусу.

## Прежде чем внести вклад

Вы можете удивиться, что при создании вашего первого PR многие проверки не проходят.
Поэтому рекомендуется сначала запустить эти команды перед внесением вклада, чтобы сэкономить время, так как
GitHub CI выполняет всё это гораздо медленнее, чем ваш компьютер.

- Форматирование кода с помощью [rustfmt](https://github.com/rust-lang/rustfmt):

```sh
cargo fmt -- packages/**/**.rs
```

- Возможно, вам потребуется установить некоторые пакеты в Linux (Ubuntu/deb) перед тем, как следующие команды завершатся успешно (также в корне репозитория есть Nix flake):

```sh
sudo apt install libgdk3.0-cil libatk1.0-dev libcairo2-dev libpango1.0-dev libgdk-pixbuf2.0-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev libwebkit2gtk-4.1-dev
```

- Проверка всего кода с помощью [cargo check](https://doc.rust-lang.org/cargo/commands/cargo-check.html):

```sh
cargo check --workspace --examples --tests
```

- Проверьте, не генерирует ли [Clippy](https://doc.rust-lang.org/clippy/) предупреждения. Пожалуйста, исправьте их!

```sh
cargo clippy --workspace --examples --tests -- -D warnings
```

- Тестирование всего кода с помощью [cargo-test](https://doc.rust-lang.org/cargo/commands/cargo-test.html):

```sh
cargo test --all --tests
```

- Тестирование с помощью Playwright. Это тестирует UI прямо в браузере. Вот все шаги, включая установку:
  **Дисклеймер: это может необъяснимо упасть на вашей машине, и это может быть не ваша вина.** Всё равно сделайте PR!

```sh
cd packages/playwright-tests
npm ci
npm install -D @playwright/test
npx playwright test
```

## Как тестировать dioxus с локальным крейтом
Если вы разрабатываете фичу, вам следует протестировать её в локальном окружении перед созданием PR. Этот процесс гарантирует, что вы осведомлены о функциональности вашего кода до ревью коллегами.

- Форкните следующий репозиторий на GitHub (DioxusLabs/dioxus):

`https://github.com/DioxusLabs/dioxus`

- Создайте новый или используйте существующий Rust-крейт (пропустите этот шаг, если будете использовать существующий):
Здесь мы будем тестировать фичи форкнутого проекта

```sh
cargo new --bin demo
```

- Добавьте зависимость dioxus в ваш Rust-крейт (новый/существующий) в Cargo.toml:

```toml
dioxus = { path = "<путь к форкнутому проекту dioxus>/dioxus/packages/dioxus", features = ["web", "router"] }
```

В приведённом выше примере используется dioxus-web с dioxus-router. Чтобы узнать о зависимостях для других рендереров, перейдите [сюда](../getting-started/index.md).

- Запустите и протестируйте вашу фичу

```sh
dx serve
```

Если это ваш первый опыт с dioxus, пожалуйста, прочитайте [туториал](../tutorial/index.md), чтобы познакомиться с dioxus.
