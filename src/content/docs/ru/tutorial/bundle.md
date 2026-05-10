---
title: Сборка
---

# Сборка

Поздравляем! Вы создали свое первое полностью функциональное приложение Dioxus, полностью загруженное маршрутизацией, асинхронной загрузкой данных, серверными функциями и базой данных! Это невероятно для всего нескольких минут работы.

Давайте соберем ваше приложение для нескольких платформ, а затем подготовим его к развертыванию.

## Тестирование на iOS

Для тестирования iOS ваша среда разработки должна быть настроена для сборки iOS-приложений. Это включает несколько шагов:

- Убедитесь, что вы разрабатываете на устройстве под управлением macOS
- Установите XCode
- [Скачайте недавний iOS SDK и пакет Emulator](https://developer.apple.com/ios/)
- Установите iOS Rust toolchains (`aarch64-apple-ios aarch64-apple-ios-sim`)

Это многоэтапный процесс и требует создания Apple Developer аккаунта. Вам не нужно платить никаких сборов, пока вы не захотите подписать свое приложение. Подпись приложения требуется для развертывания в Apple App Store и тестирования на вашем iOS-устройстве.

Просто запустите `dx serve --ios`, и ваше приложение должно загрузиться в iOS Simulator.

<video src="/assets/06_docs/dog-app-ios.mp4" controls></video>

Фантастика — наше приложение работает бесшовно без изменений.

## Тестирование на Android

Настройка среды для Android-разработки занимает время, поэтому обязательно прочитайте [руководство по мобильным инструментам](../guides/platforms/mobile.md).

- Установите Android NDK и SDK
- Установите JAVA_HOME, ANDROID_HOME, NDK_HOME и исправьте проблемы PATH для использования инструмента `emulator`
- Установите и настройте Android-эмулятор
- Установите Android rustup targets (`aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`)

Правильная установка Android может быть несколько сложной, поэтому попробуйте включить "verbose" режим на dx для отладки любых проблем.

Если все пойдет хорошо, мы можем просто запустить serve, и наше приложение должно появиться в нашем Android-симуляторе.

```
dx serve --android
```

<video src="/assets/06_docs/android-dogapp.mp4" controls></video>

## Тестирование на десктопе

HotDog также работает на macOS, Windows и Linux! Мы можем использовать `dx serve --desktop` для запуска нашего приложения как десктоп-приложения.

![HotDogDesktop](/assets/06_docs/hotdog-desktop.png)

## Бандлинг для веба

Когда мы закончим вносить изменения в наше серверное и клиентское приложения, мы можем собирать бандлы, готовые к распространению.

Мы будем следовать тому же паттерну, что и `dx serve`, но с `dx bundle`. Для начала давайте соберем веб-версию нашего приложения.

```sh
dx bundle --web
```

Мы должны получить серию INFO-трассировок от CLI во время сборки, а затем, наконец, путь к папке `public`, которую он генерирует. Давайте перейдём в её публичный каталог, а затем проверим родительский каталог (cd ..) (папку "web").

```sh
❯ tree -L 3 --gitignore
.
├── public
│   ├── assets
│   │   ├── favicon.ico
│   │   ├── header.svg
│   │   ├── main-14aa55e73f669f3e.css
│   │   ├── main.css
│   │   └── screenshot.png
│   ├── index.html
│   └── wasm
│       ├── hot_dog.js
│       ├── hot_dog.js.br
│       ├── hot_dog_bg.wasm
│       ├── hot_dog_bg.wasm.br
│       └── snippets
└── server
```

`dx` собрал папку `public`, содержащую наши ассеты, index.html и различные JavaScript-сниппеты. Рядом с папкой public находится бинарник `server`. Когда мы разворачиваем наши веб-ассеты, нам также нужно развернуть сервер, поскольку он предоставляет наши серверные функции.

Мы можем вручную запустить сервер, просто выполнив его. Если вы используете стандартную настройку `dioxus::launch`, то сервер будет читать переменные окружения `IP` и `PORT` для обслуживания.

> 📣 Если вы собираетесь обслуживать из контейнера (например, Docker), то вам нужно переопределить адрес по умолчанию `127.0.0.1` на `IP=0.0.0.0`, чтобы слушать внешние подключения.

![Обслуживание сервера](/assets/06_docs/serving_server.png)

## Бандлинг для десктопа и мобильных устройств

Чтобы собрать десктопные и мобильные приложения для развертывания, мы снова будем использовать `dx bundle`. На сегодняшний день `dx bundle` собирает десктопные приложения только для нативной платформы и архитектуры. К сожалению, вы не можете собрать macOS-приложения из Windows, Linux-приложения из Mac и т.д. Мы рекомендуем использовать матрицу непрерывной интеграции (например, [Github Actions](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow)) для выполнения "кросс-сборки" вашего приложения в нескольких разных контейнерах.

При сборке устанавливаемых приложений есть множество форматов дистрибуции на выбор. Мы можем указать эти форматы с помощью флага `--package-types` в `dx bundle`. Dioxus поддерживает широкое количество типов пакетов:

- macOS: `.app`, `.dmg`
- Linux: `.appimage`, `.rpm`, `.deb`
- Windows: `.msi`, `.exe`
- iOS: `.app`
- Android: `.apk`

Вы можете указать типы пакетов следующим образом:

```sh
dx bundle --desktop \
    --package-types "macos" \
    --package-types "dmg"
```

Обратите внимание, что не все типы пакетов совместимы с каждой платформой — например, только `.exe` может быть собран при указании `--desktop`.

Мы должны увидеть вывод в нашем терминале:

```sh
18.252s  INFO Bundled app successfully!
18.252s  INFO App produced 2 outputs:
18.252s  INFO app - [./target/dx/hot_dog/bundle/macos/bundle/macos/HotDog.app]
18.252s  INFO dmg - [./target/dx/hot_dog/bundle/macos/bundle/dmg/HotDog_0.1.0_aarch64.dmg]
```

Как правило, вы можете распространять десктопные приложения, не нуждаясь в app store. Однако некоторые платформы, такие как macOS, могут потребовать от вас подписать и нотаризовать ваше приложение, чтобы оно считалось "безопасным" для открытия вашими пользователями.

При распространении мобильных приложений вы *обязаны* подписывать и нотаризовать свои приложения. В настоящее время Dioxus не предоставляет встроенных утилит для этого, поэтому вам нужно будет разобраться с подписью, изучив стороннюю документацию.

Tauri предоставляет документацию по процессу подписи:
- [macOS](https://tauri.app/distribute/sign/macos/)
- [iOS](https://tauri.app/distribute/sign/iOS/)
- [Android](https://tauri.app/distribute/sign/android/)
- [Windows](https://tauri.app/distribute/sign/Windows/)
- [Linux](https://tauri.app/distribute/sign/Linux/)

## Настройка вашего бандла

Перед тем как выпустить ваше приложение, вы можете захотеть настроить внешний вид иконки приложения, какие entitlements оно имеет, и другие детали. Наш инструмент `dx bundle` может помочь вам настроить ваши бандлы различными способами.

Чтобы настроить наш бандл, мы будем использовать `Dioxus.toml` и модифицировать секцию bundle.

```toml
[application]
name = "docsite"

[bundle]
identifier = "com.dioxuslabs"
publisher = "DioxusLabs"
icon = ["assets/icon.png"]
```

Полный список опций см. на [странице справки по секции `bundle`](../guides/deploy/config.md).

## Автоматизация dx bundle с JSON-режимом

Также добавлено в Dioxus 0.6 — JSON-режим вывода для `dx`. Это позволяет парсить вывод CLI с помощью инструментов, таких как [jq](https://jqlang.github.io/jq/), которые поддерживают stdin/stdout для JSON-парсинга.

Этот режим не особенно дружелюбен к человеку, но содержит больше информации, чем стандартный trace-вывод.

```sh
{"timestamp":"   9.927s","level":"INFO","message":"Bundled app successfully!","target":"dx::cli::bundle"}
{"timestamp":"   9.927s","level":"INFO","message":"App produced 2 outputs:","target":"dx::cli::bundle"}
{"timestamp":"   9.927s","level":"DEBUG","message":"Bundling produced bundles: [\n    Bundle {\n        package_type: MacOsBundle,\n        bundle_paths: [\n            \"/Users/jonkelley/Development/Tinkering/06-demos/hot_dog/target/dx/hot_dog/bundle/macos/bundle/macos/HotDog.app",\n        ],\n    },\n    Bundle {\n        package_type: Dmg,\n        bundle_paths: [\n            \"/Users/jonkelley/Development/Tinkering/06-demos/hot_dog/target/dx/hot_dog/bundle/macos/bundle/dmg/HotDog_0.1.0_aarch64.dmg",\n        ],\n    },\n]","target":"dx::cli::bundle"}
{"timestamp":"   9.927s","level":"INFO","message":"app - [/Users/jonkelley/Development/Tinkering/06-demos/hot_dog/target/dx/hot_dog/bundle/macos/bundle/macos/HotDog.app]","target":"dx::cli::bundle"}
{"timestamp":"   9.927s","level":"INFO","message":"dmg - [/Users/jonkelley/Development/Tinkering/06-demos/hot_dog/target/dx/hot_dog/bundle/macos/bundle/dmg/HotDog_0.1.0_aarch64.dmg]","target":"dx::cli::bundle"}
{"timestamp":"   9.927s","level":"DEBUG","json":"{\"BundleOutput\":{\"bundles\":[\"/Users/jonkelley/Development/Tinkering/06-demos/hot_dog/target/dx/hot_dog/bundle/macos/bundle/macos/HotDog.app\",\"/Users/jonkelley/Development/Tinkering/06-demos/hot_dog/target/dx/hot_dog/bundle/macos/bundle/dmg/HotDog_0.1.0_aarch64.dmg\"]}}","target":"dx"}
```

JSON-режим работает со всеми командами `dx`. Однако он наиболее полезен с `dx build` и `dx bundle`. CLI всегда гарантирует, что последняя испущенная строка — это результат команды. Чтобы собрать список бандлов из команды `dx bundle`, мы можем использовать `tail -1` и простой jq.

```sh
dx bundle --desktop \
    --json-output \
    --verbose \
    | tail -1 \
    | jq -r '.json | fromjson | .BundleOutput.bundles []'
```

Это возвращает список бандлов:
```
./target/dx/hot_dog/bundle/macos/bundle/macos/HotDog.app
./target/dx/hot_dog/bundle/macos/bundle/dmg/HotDog_0.1.0_aarch64.dmg
```
