---
title: Структура проекта
---

# Структура проекта

В организации Dioxus много пакетов. Этот документ поможет вам понять назначение каждого пакета и то, как они связаны друг с другом:

![Граф зависимостей Dioxus](/assets/static/workspace-graph.png)

## Точки входа

- [dioxus](https://github.com/DioxusLabs/dioxus/tree/main/packages/dioxus): основной крейт для приложений Dioxus. Крейт dioxus имеет различные фичи (feature flags), чтобы включить конкретный [рендерер](#рендереры) с помощью API запуска (launch) и открыть различные возможности, такие как роутер и [fullstack](#fullstack). [CLI](https://github.com/DioxusLabs/dioxus/tree/main/packages/cli) использует включённую фичу рендерера, чтобы определить, для какой цели Rust компилировать.

## Рендереры

Рендереры — это точка входа для приложений Dioxus. Они отвечают за рендеринг приложения, опрос асинхронных задач и обработку событий. Каждый рендерер зависит от `dioxus-core` для основного виртуального DOM и реализует трейт истории из `dioxus-history` и трейт конвертации событий из `dioxus-html`. В основном репозитории Dioxus четыре рендерера:

- [web](https://github.com/DioxusLabs/dioxus/tree/main/packages/web): рендерит приложения Dioxus в браузере, компилируясь в WASM и манипулируя DOM. Веб-рендерер имеет фичу гидратации (hydration), чтобы перехватить рендеринг с сервера, если включён [fullstack](#fullstack).
- [desktop](https://github.com/DioxusLabs/dioxus/tree/main/packages/desktop): рендерер, работающий на десктопных и мобильных платформах. Код приложения Dioxus компилируется нативно, а UI рендерится с помощью системного вебвью (webview).
- [mobile](https://github.com/DioxusLabs/dioxus/tree/main/packages/mobile): рендерер, запускающий приложения Dioxus нативно, но рендерящий их с помощью системного вебвью. В настоящее время это тонкая обёртка поверх десктопного рендерера, так как оба используют вебвью.
- [native](https://github.com/DioxusLabs/dioxus/tree/main/packages/native): (экспериментальный) рендерер, работающий на десктопных и мобильных платформах. Приложение Dioxus компилируется нативно, а UI рендерится с помощью кастомного WGPU HTML/CSS рендерера ([blitz](https://github.com/DioxusLabs/blitz)).
- [liveview](https://github.com/DioxusLabs/dioxus/tree/main/packages/liveview): рендерер, работающий на сервере и рендерящий через websocket-прокси в браузере. Рендерер liveview в настоящее время поддерживается, но его разработка имеет более низкий приоритет по сравнению с fullstack, и в будущем он может быть удалён.

> [TUI](https://github.com/DioxusLabs/blitz/tree/legacy/packages/dioxus-tui) рендерер был объявлен устаревшим, но может быть возвращён в будущем, когда Blitz станет более стабильным.

## Нативный рендеринг

В дополнение к перечисленным выше рендерерам, у Dioxus также есть экспериментальный нативный рендерер под названием Blitz, который использует WebGPU для рендеринга HTML+CSS для приложений dioxus:

- [taffy](https://github.com/DioxusLabs/taffy): автономный движок CSS-раскладки, на котором работает Blitz (также используется в Zed и Bevy UI).
- [blitz](https://github.com/DioxusLabs/blitz): экспериментальный кастомный WGPU-based HTML/CSS рендерер, являющийся основой Dioxus Native.
- [native-dom](https://github.com/DioxusLabs/dioxus/tree/main/packages/native-dom): ядро интеграции `blitz` с `dioxus-core`. Полезен для встраивания Dioxus Native в другое приложение (например, игру на Bevy), которое уже имеет собственную обработку окон и ввода.

## Fullstack

Fullstack может быть наложен поверх любого рендерера, чтобы добавить поддержку серверных функций и серверного рендеринга (SSR).

- [ssr](https://github.com/DioxusLabs/dioxus/tree/main/packages/ssr): dioxus-ssr отвечает за рендеринг виртуального DOM dioxus в строку для тестирования или на сервере. SSR используется в fullstack-рендерере для серверного рендеринга и статической генерации.
- [isrg](https://github.com/DioxusLabs/dioxus/tree/main/packages/isrg): dioxus-isrg отвечает за инкрементальную статическую генерацию сайтов для fullstack-приложений dioxus. Он помогает fullstack кэшировать серверно-отрендеренные маршруты в памяти и в файловой системе.
- [fullstack](https://github.com/DioxusLabs/dioxus/tree/main/packages/fullstack): пакет dioxus-fullstack отвечает за интеграцию между сервером [axum](https://github.com/tokio-rs/axum) и рендерером dioxus. Если фронтенд-рендерер нацелен на веб, fullstack-рендерер подготовит HTML со встроенными данными, чтобы клиент мог перехватить рендеринг после начальной загрузки (гидратация).
- [server-macro](https://github.com/DioxusLabs/dioxus/tree/main/packages/server-macro): крейт server-macro определяет макрос `server`, используемый для определения серверных функций в приложениях Dioxus. Он интегрируется с [server_fn](https://crates.io/crates/server_fn) для автоматической регистрации серверных функций на сервере и их вызова на клиенте.

## Основные утилиты

Основные утилиты содержат реализацию виртуального DOM и другие макросы, используемые во всех рендерах dioxus. Ядро dioxus не предполагает, что оно работает в веб-контексте, поэтому эти утилиты могут использоваться сторонними рендерерами, такими как [Freya](https://github.com/marc2332/freya).

- [core](https://github.com/DioxusLabs/dioxus/tree/main/packages/core): основная реализация виртуального DOM, которую использует каждое приложение Dioxus. Главная точка входа для core — `VirtualDom`. Методы диффинга виртуального DOM принимают кроссплатформенный трейт `WriteMutations`, который вызывается всякий раз, когда рендереру нужно изменить то, что отображается. Виртуальный DOM также имеет методы для запуска фьючерсов и вставки событий. Подробнее об архитектуре core можно прочитать [в этом блогпосте](https://dioxuslabs.com/blog/templates-diffing/).
- [core-types](https://github.com/DioxusLabs/dioxus/tree/main/packages/core-types): крейт с основными типами, содержащий некоторые базовые функции, используемые как в dioxus core, так и в движке горячей перезагрузки.
- [core-macro](https://github.com/DioxusLabs/dioxus/tree/main/packages/core-macro): крейт core-macro реализует макросы `derive(Props)` и `#[component]` для сборки компонентов. Он также реэкспортирует макрос rsx.
- [rsx](https://github.com/DioxusLabs/dioxus/tree/main/packages/rsx): реализует парсинг и развёртывание для макроса RSX. Парсер также используется для горячей перезагрузки и автоформатирования в CLI.

## Веб-утилиты

Каждый first-party рендерер dioxus нацелен на HTML и CSS. За исключением blitz, все рендереры работают в браузерном контексте. У Dioxus есть несколько утилит в workspace с общими трейтами и JavaScript-привязками для взаимодействия с браузером:

- [interpreter](https://github.com/DioxusLabs/dioxus/tree/main/packages/interpreter): интерпретатор реализует трейт `WriteMutations` из dioxus core для изменения DOM с помощью диффов, которые генерирует виртуальный DOM. Интерпретатор используется десктопным, веб- и liveview рендерерами. Он использует комбинацию [`wasm-bindgen`](https://rustwasm.github.io/wasm-bindgen) и [`sledgehammer-bindgen`](https://github.com/ealmloff/sledgehammer_bindgen) для взаимодействия с браузером.
- [html](https://github.com/DioxusLabs/dioxus/tree/main/packages/html): определяет HTML-специфичные элементы, события и атрибуты. Элементы и атрибуты используются в макросе rsx и движке горячей перезагрузки для сопоставления Rust-идентификаторов с HTML-именами. События, определённые в крейте html, — это трейты, определённые для каждой платформы.
- [html-internal-macro](https://github.com/DioxusLabs/dioxus/tree/main/packages/html-internal-macro): крейт html-internal-macro используется крейтом html для определения HTML-элементов и атрибутов.
- [lazy-js-bundle](https://github.com/DioxusLabs/dioxus/tree/main/packages/lazy-js-bundle): библиотека для сборки TypeScript-файлов во время сборки с помощью bun только если содержимое изменилось. Компиляция TypeScript только при изменении файлов и коммит сборочного вывода позволяет нам не требовать установки ts-компилятора при добавлении dioxus как библиотеки.
- [history](https://github.com/DioxusLabs/dioxus/tree/main/packages/history): крейт dioxus-history определяет трейт истории, который должен предоставить каждый рендерер для использования с роутером. Для веб-рендереров он должен вызывать JavaScript History API. Нативные рендереры поддерживают собственный стек истории в памяти.
- [document](https://github.com/DioxusLabs/dioxus/tree/main/packages/document): крейт dioxus-document определяет трейт документа, который должен предоставить каждый рендерер для использования с `eval` и компонентами `document::*`. `eval` запускает JavaScript-код из Rust, а компоненты `document::*` создают HTML-элементы в head.

## Управление состоянием

- [generational-box](https://github.com/DioxusLabs/dioxus/tree/main/packages/generational-box): Generational Box — это основа всего управления состоянием `Copy` в Dioxus. Он выделяет арену динамически borrow-checked значений, используемых во всей экосистеме dioxus. Тип `GenerationalBox` лежит в основе `Signal`, `Memo` и `Resource` в dioxus signals. Он также используется в `dioxus-core`, чтобы сделать типы `Closure` и `EventHandler` `Copy`.
- [signals](https://github.com/DioxusLabs/dioxus/tree/main/packages/signals): сигналы — это основной пользовательский крейт управления состоянием для Dioxus. Сигналы отслеживают, когда они читаются и записываются, и автоматически перезапускают любые `ReactiveContext`, которые зависят от сигнала.
- [hooks](https://github.com/DioxusLabs/dioxus/tree/main/packages/hooks): хуки — это набор общих хуков для приложений Dioxus. Большинство хуков — это тонкая обёртка над новыми методами в крейте `signals`, создающая объект только одинжды при создании компонента.

## Логирование

- [logger](https://github.com/DioxusLabs/dioxus/tree/main/packages/logger): крейт logger предоставляет простой интерфейс логирования для приложений Dioxus, работающий как на нативных, так и на wasm-таргетах. Он автоматически вызывается в функции launch, если включена фича логирования.

## Роутинг

- [router](https://github.com/DioxusLabs/dioxus/tree/main/packages/router): крейт router отвечает за маршрутизацию в приложениях Dioxus. Он использует провайдер истории, который предоставляет рендерер, для получения и изменения URL. Логика парсинга маршрутов выводится макросом `derive(Routable)`, определённым в крейте dioxus-router-macro.
- [router-macro](https://github.com/DioxusLabs/dioxus/tree/main/packages/router-macro): крейт router-macro определяет макрос `derive(Routable)`, используемый для создания перечисления маршрутов из URL и его отображения как URL.

## Ассеты

- [manganis](https://github.com/DioxusLabs/dioxus/tree/main/packages/manganis/manganis): Manganis — это система ассетов dioxus. Она использует макрос для внедрения ассетов из Rust-кода в линкер. Каждый ассет получает уникальный хеш для сброса кэша. CLI извлекает ассет из линкера и бандлит его в финальное приложение.
- [manganis-macro](https://github.com/DioxusLabs/dioxus/tree/main/packages/manganis/manganis-macro): Manganis-macro определяет макрос `asset!()`, используемый для включения ассетов в приложения Dioxus.
- [manganis-core](https://github.com/DioxusLabs/dioxus/tree/main/packages/manganis/manganis-core): Manganis-core содержит билдеры для всех опций, передаваемых в макрос `asset!()`, и секции линкера, которые используют макрос ассета и CLI для бандлинга ассетов.
- [const-serialize](https://github.com/DioxusLabs/dioxus/tree/main/packages/const-serialize): Const Serialize определяет трейт для сериализации Rust-типов в кроссплатформенный формат во время компиляции. Используется для сериализации опций ассетов во время компиляции в manganis.
- [const-serialize-macro](https://github.com/DioxusLabs/dioxus/tree/main/packages/const-serialize-macro): Const Serialize Macro определяет derive-макрос для типов, которые могут быть сериализованы во время компиляции с помощью крейта `const-serialize`.
- [cli-opt](https://github.com/DioxusLabs/dioxus/tree/main/packages/cli-opt): cli-opt оптимизирует ассеты, которые производит manganis.

## Форматирование

- [autofmt](https://github.com/DioxusLabs/dioxus/tree/main/packages/autofmt): крейт autofmt находит и форматирует все макросы rsx в Rust-проекте. Он использует крейт `dioxus-rsx` для парсинга rsx.

## Линтинг

- [check](https://github.com/DioxusLabs/dioxus/tree/main/packages/check): крейт dioxus-check анализирует код dioxus для проверки распространённых ошибок, таких как вызов хуков в условиях или циклах.

## Трансляция

- [rsx-rosetta](https://github.com/DioxusLabs/dioxus/tree/main/packages/rsx-rosetta): крейт rsx-rosetta переводит HTML в RSX. Он использует определения элементов из `dioxus-html` для перевода HTML-элементов и атрибутов в их Rust-имена, и крейт `rsx` для генерации макроса rsx.

## Горячая перезагрузка

- [rsx-hotreload](https://github.com/DioxusLabs/dioxus/tree/main/packages/rsx-hotreload): крейт rsx-hotreload обрабатывает диффинг макросов rsx между сборками и создание шаблонов горячей перезагрузки для CLI.
- [devtools](https://github.com/DioxusLabs/dioxus/tree/main/packages/devtools): крейт devtools содержит фронтенд для горячей перезагрузки, с которым должен интегрироваться каждый рендерер. Он получает сообщения горячей перезагрузки через websocket-соединение с CLI.
- [devtools-types](https://github.com/DioxusLabs/dioxus/tree/main/packages/devtools-types): крейт devtools-types содержит типы, используемые для коммуникации между фронтендом devtools и бэкендом в CLI.

## CLI

- [cli](https://github.com/DioxusLabs/dioxus/tree/main/packages/cli): крейт cli содержит CLI Dioxus. Он интегрирует check, autofmt, cli-opt и rsx-hotreload для сборки и запуска приложений Dioxus.
- [cli-config](https://github.com/DioxusLabs/dioxus/tree/main/packages/cli-config): крейт cli-config содержит общие типы, предоставляемые во время выполнения из CLI крейтам, с которыми собран CLI. Он используется `dioxus-desktop` для установки заголовка из файла `Dioxus.toml` и `dioxus-fullstack` для установки порта, с которого CLI проксирует сервер.
- [dx-wire-format](https://github.com/DioxusLabs/dioxus/tree/main/packages/dx-wire-format): крейт dx-wire-format содержит нестабильные типы, которые CLI выдаёт в JSON-режиме. Используется dioxus playground.

## Расширение

- [extension](https://github.com/DioxusLabs/dioxus/tree/main/packages/extension): папка extension содержит исходный код VSCode-расширения dioxus. Оно использует многие из тех же крейтов, что и CLI, но упаковано в WASM+JS бандл для VSCode.

## Тестирование

- [playwright-tests](https://github.com/DioxusLabs/dioxus/tree/main/packages/playwright-tests): папка playwright-tests содержит end-to-end тесты для dioxus-web, dioxus-liveview и fullstack. Эти крейты не публикуются на crates.io.
