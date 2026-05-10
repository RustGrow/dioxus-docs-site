---
title: Веб
---

# Веб

Для запуска в вебе ваше приложение должно быть скомпилировано в WebAssembly и зависеть от крейтов `dioxus` и `dioxus-web`.

Сборка Dioxus для веба будет примерно эквивалентна по размеру сборке React (70 КБ против 65 КБ), но загружаться будет значительно быстрее, потому что [WebAssembly может компилироваться по мере загрузки](https://hacks.mozilla.org/2018/01/making-webassembly-even-faster-firefoxs-new-streaming-and-tiering-compiler/).

Примеры:

- [TodoMVC](https://github.com/DioxusLabs/dioxus/blob/main/examples/todomvc.rs)
- [Tailwind App](https://github.com/DioxusLabs/dioxus/tree/main/examples/tailwind)

[![Пример TodoMVC](https://github.com/DioxusLabs/example-projects/raw/master/todomvc/example.png)](https://github.com/DioxusLabs/dioxus/blob/main/examples/todomvc.rs)

> Примечание: Из-за ограничений Wasm [не каждый крейт будет работать](https://rustwasm.github.io/docs/book/reference/which-crates-work-with-wasm.html) с вашими веб-приложениями, поэтому вам нужно убедиться, что ваши крейты работают без нативных системных вызовов (таймеры, IO и т.д.).

## Поддержка

Веб — это лучше всего поддерживаемая целевая платформа для Dioxus.

- Поскольку ваше приложение будет скомпилировано в WASM, у вас есть доступ к браузерным API через [wasm-bindgen](https://rustwasm.github.io/docs/wasm-bindgen/introduction.html).
- Dioxus предоставляет гидратацию для возобновления приложений, отрендеренных на сервере. См. справочник по [fullstack](../../essentials/fullstack/index.md) для получения дополнительной информации.

## Запуск JavaScript

Dioxus предоставляет функцию `document::eval` для выполнения JavaScript-кода в вашем приложении. Подробнее см. в [руководстве по интеропу с JavaScript](../../guides/utilities/eval.md).

Если вы ориентируетесь на веб, но не планируете ориентироваться на какой-либо другой рендерер Dioxus, вы также можете использовать сгенерированные обёртки в крейтах [web-sys](https://wasm-bindgen.github.io/wasm-bindgen/web-sys/index.html) и [gloo](https://gloo-rs.web.app/).

## Настройка шаблона index

Dioxus поддерживает предоставление пользовательских шаблонов index.html. Файл index.html должен включать `div` с id `main` для использования. Горячая перезагрузка всё ещё поддерживается. Пример предоставлен в [PWA-Example](https://github.com/DioxusLabs/dioxus/blob/main/examples/10-integrations/pwa/index.html).
