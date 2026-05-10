---
title: Примеры
description: Коллекция примеров приложений и фрагментов кода, демонстрирующих паттерны Dioxus.
---

# Примеры

Репозиторий Dioxus включает разнообразные примеры — от простых UI-паттернов до полноценных приложений. Каждый пример создан для демонстрации конкретных концепций и может служить отправной точкой для ваших собственных проектов.

Исходный код всех примеров находится в директории [`dioxus-examples`](https://github.com/DioxusLabs/dioxus/tree/main/examples) репозитория Dioxus.

## Демо-приложения

Полноценные приложения, демонстрирующие паттерны реального мира.

| Пример | Описание | Связанные темы |
|---------|-------------|----------------|
| [Калькулятор](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/calculator.rs) | Калькулятор в стиле iOS с сигналами и замыканиями | [Сигналы](../essentials/basics/signals.md), [Обработчики событий](../essentials/basics/event-handlers.md) |
| [Калькулятор (Mutable)](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/calculator_mutable.rs) | Калькулятор с использованием единой структуры для состояния | [Управление состоянием](../essentials/basics/hooks.md), [Коллекции](../essentials/basics/collections.md) |
| [Счетчики](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/counters.rs) | Несколько независимых счетчиков | [Сигналы](../essentials/basics/signals.md), [Компоненты](../essentials/ui/components.md) |
| [CRM](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/crm.rs) | UI для управления отношениями с клиентами | [Формы](../essentials/ui/elements.md), [Списки](../essentials/ui/iteration.md) |
| [Dog App](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/dog_app.rs) | Загружает породы собак и изображения из API | [Загрузка данных](../essentials/basics/resources.md), [Асинхронность](../essentials/basics/async.md) |
| [Генератор изображений](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/image_generator_openai.rs) | Интеграция с генерацией изображений OpenAI | [Серверные функции](../essentials/fullstack/server-functions.md), [Асинхронность](../essentials/basics/async.md) |
| [Repo Readme](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/repo_readme.rs) | Просмотрщик README GitHub | [Загрузка данных](../essentials/basics/resources.md) |
| [TodoMVC](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/todomvc.rs) | Классическая реализация TodoMVC | [Управление состоянием](../essentials/basics/hooks.md), [Коллекции](../essentials/basics/collections.md) |
| [TodoMVC Store](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/todomvc_store.rs) | TodoMVC с паттерном глобального хранилища | [Глобальный контекст](../essentials/basics/context.md), [Хранилища](../essentials/basics/collections.md) |
| [Погодное приложение](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/weather_app.rs) | Просмотр прогноза погоды | [Загрузка данных](../essentials/basics/resources.md), [Эффекты](../essentials/basics/effects.md) |
| [WebSocket-чат](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/websocket_chat.rs) | Чат в реальном времени с WebSockets | [WebSockets](../essentials/fullstack/websockets.md), [Потоки](../essentials/fullstack/streams.md) |

## Создание UI

Паттерны для построения пользовательских интерфейсов с RSX.

| Пример | Описание | Связанные темы |
|---------|-------------|----------------|
| [Checkbox & Radio](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/checkbox_radio.rs) | Элементы форм с состоянием | [Обработчики событий](../essentials/basics/event-handlers.md), [Формы](../essentials/ui/elements.md) |
| [Children](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/children.rs) | Передача дочерних элементов в компоненты | [Компоненты](../essentials/ui/components.md) |
| [Компоненты](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/components.rs) | Определение и использование компонентов с пропсами | [Компоненты](../essentials/ui/components.md), [Пропсы](../essentials/ui/components.md) |
| [Условный рендеринг](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/conditional_rendering.rs) | if/else и match в RSX | [Условный рендеринг](../essentials/ui/conditional.md) |
| [Счетчик](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/counter.rs) | Простой счетчик с сигналами | [Сигналы](../essentials/basics/signals.md) |
| [Disabled](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/disabled.rs) | Условное отключение элементов | [Атрибуты](../essentials/ui/attributes.md) |
| [Динамические классы](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/dynamic_classes.rs) | Изменение CSS-классов во время выполнения | [Стилизация](../essentials/ui/styling.md), [Атрибуты](../essentials/ui/attributes.md) |
| [Event Handler Prop](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/event_handler_prop.rs) | Передача колбэков как пропсов | [Обработчики событий](../essentials/basics/event-handlers.md), [Компоненты](../essentials/ui/components.md) |
| [Формы](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/forms.rs) | Обработка и валидация форм | [Обработчики событий](../essentials/basics/event-handlers.md), [Элементы](../essentials/ui/elements.md) |
| [Inputs](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/inputs.rs) | Текстовые поля и контролируемые компоненты | [Обработчики событий](../essentials/basics/event-handlers.md) |
| [Списки](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/lists.rs) | Рендеринг списков с ключами | [Списки](../essentials/ui/iteration.md) |
| [Вложенные обработчики](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/nested_listeners.rs) | Всплытие событий и вложенные обработчики | [Обработчики событий](../essentials/basics/event-handlers.md) |
| [SVG](https://github.com/DioxusLabs/dioxus/tree/main/examples/02-building-ui/svg.rs) | Встроенный рендеринг SVG | [Элементы](../essentials/ui/elements.md) |

## Ресурсы и стилизация

Работа с CSS, изображениями, шрифтами и другими ресурсами.

| Пример | Описание | Связанные темы |
|---------|-------------|----------------|
| [CSS Modules](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/css_modules.rs) | CSS с ограниченной областью видимости | [Стилизация](../essentials/ui/styling.md) |
| [Пользовательские ресурсы](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/custom_assets.rs) | Загрузка изображений и файлов | [Ресурсы](../essentials/ui/assets.md) |
| [Заголовок документа](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/document_title.rs) | Динамическое изменение заголовка страницы | [Head](../essentials/ui/head.md) |
| [Динамические ресурсы](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/dynamic_assets.rs) | Переключение ресурсов во время выполнения | [Ресурсы](../essentials/ui/assets.md) |
| [Динамические стили](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/dynamic_styles.rs) | Обновление CSS динамически | [Стилизация](../essentials/ui/styling.md) |
| [Favicon](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/favicon.rs) | Установка favicon страницы | [Head](../essentials/ui/head.md) |
| [Шрифты](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/fonts.rs) | Загрузка пользовательских шрифтов | [Ресурсы](../essentials/ui/assets.md), [Стилизация](../essentials/ui/styling.md) |
| [Встроенные стили](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/inline_styles.rs) | Style-атрибуты в RSX | [Стилизация](../essentials/ui/styling.md) |
| [Meta](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/meta.rs) | Meta-теги для SEO | [Head](../essentials/ui/head.md) |
| [Script](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/script.rs) | Подключение внешних скриптов | [Head](../essentials/ui/head.md), [Интероп с JavaScript](../guides/utilities/eval.md) |
| [Stylesheet](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/stylesheet.rs) | Загрузка CSS-файлов | [Стилизация](../essentials/ui/styling.md), [Ресурсы](../essentials/ui/assets.md) |

## Управление состоянием

Паттерны управления состоянием с сигналами, хуками и контекстом.

| Пример | Описание | Связанные темы |
|---------|-------------|----------------|
| [Context API](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/context_api.rs) | Распределение состояния через контекст | [Контекст](../essentials/basics/context.md) |
| [Пользовательский хук](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/custom_hook.rs) | Создание переиспользуемых хуков | [Пользовательские хуки](../essentials/advanced/custom-hooks.md) |
| [Обработка ошибок](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/error_handling.rs) | Обработка ошибок в компонентах | [Обработка ошибок](../essentials/basics/error-handling.md) |
| [Глобальное состояние](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/global.rs) | Глобальное состояние с сигналами | [Глобальный контекст](../essentials/basics/context.md) |
| [Подъем состояния](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/lifting_state.rs) | Перенос состояния вверх по дереву | [Подъем состояния](../essentials/basics/hoisting.md) |
| [Memo Chain](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/memo_chain.rs) | Связанные вычисляемые значения | [Эффекты и мемоизация](../essentials/basics/effects.md) |
| [Read Signal](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/read_signal.rs) | Сигналы только для чтения | [Сигналы](../essentials/basics/signals.md) |
| [Reducer](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/reducer.rs) | Паттерн reducer в стиле Redux | [Управление состоянием](../essentials/basics/hooks.md) |
| [Сигналы](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/signals.rs) | Базовые паттерны сигналов | [Сигналы](../essentials/basics/signals.md), [Эффекты](../essentials/basics/effects.md) |
| [Struct Signal](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/struct_signal.rs) | Сигналы в структурах | [Сигналы](../essentials/basics/signals.md) |
| [Use Effect](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_effect.rs) | Побочные эффекты с use_effect | [Эффекты и мемоизация](../essentials/basics/effects.md) |
| [Use Memo](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_memo.rs) | Мемоизированные вычисления | [Эффекты и мемоизация](../essentials/basics/effects.md) |
| [Vec Signal](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/vec_signal.rs) | Сигналы с коллекциями | [Коллекции](../essentials/basics/collections.md) |

## Маршрутизация

Конфигурация роутера и паттерны навигации.

| Пример | Описание | Связанные темы |
|---------|-------------|----------------|
| [Flat Router](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/flat_router.rs) | Простая плоская структура маршрутов | [Определение маршрутов](../essentials/router/routes.md) |
| [Hash Fragment](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/hash_fragment_state.rs) | Состояние на основе хэша URL | [Навигация](../essentials/router/navigation.md) |
| [Link](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/link.rs) | Навигация с компонентом Link | [Навигация](../essentials/router/navigation.md) |
| [Query Segment](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/query_segment_search.rs) | Параметры запроса в маршрутах | [Определение маршрутов](../essentials/router/routes.md) |
| [Router](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router.rs) | Продвинутый роутер с макетами | [Макеты](../essentials/router/layouts.md), [Вложенные маршруты](../essentials/router/nested.md) |
| [Router Resource](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router_resource.rs) | Загрузка данных с маршрутизацией | [Загрузка данных](../essentials/basics/resources.md), [Навигация](../essentials/router/navigation.md) |
| [Restore Scroll](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router_restore_scroll.rs) | Восстановление позиции прокрутки | [Навигация](../essentials/router/navigation.md) |
| [Simple Router](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/simple_router.rs) | Базовая настройка роутинга | [Введение](../essentials/router/introduction.md) |

## Интеграции

Интеграции со сторонними библиотеками и продвинутые настройки.

| Пример | Описание | Связанные темы |
|---------|-------------|----------------|
| [Native Headless](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/native-headless) | Headless нативный рендеринг | [Пользовательский рендерер](../guides/utilities/custom-renderer.md) |
| [PWA](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/pwa) | Настройка Progressive Web App | [Развертывание](../guides/deploy/index.md), [Веб](../guides/platforms/web.md) |
| [Tailwind](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/tailwind) | Интеграция с TailwindCSS | [Tailwind](../guides/utilities/tailwind.md) |
| [WGPU Texture](https://github.com/DioxusLabs/dioxus/tree/main/examples/10-integrations/wgpu-texture) | Кастомный рендеринг с WGPU | [Пользовательский рендерер](../guides/utilities/custom-renderer.md), [Десктоп](../guides/platforms/desktop.md) |

## Запуск примеров

Для локального запуска примера склонируйте репозиторий Dioxus и используйте `dx serve`:

```sh
git clone https://github.com/DioxusLabs/dioxus
cd dioxus/examples/01-app-demos
dx serve --example calculator
```

Или запустите напрямую через Cargo:

```sh
cargo run --example calculator
```
