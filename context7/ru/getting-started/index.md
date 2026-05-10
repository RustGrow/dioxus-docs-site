---
title: Начало работы
---

# Начало работы

## Выбор редактора

Мы рекомендуем использовать [VSCode](https://code.visualstudio.com), поскольку Dioxus поставляется со [своим расширением для VSCode](https://marketplace.visualstudio.com/items?itemName=DioxusLabs.dioxus). Наш инструмент сборки `dx` является автономным и предназначен для использования через терминал.

Большинство редакторов поддерживают плагин [Rust-Analyzer LSP](https://rust-analyzer.github.io), который обеспечивает соответствующую подсветку синтаксиса, навигацию по коду, свёртывание и многое другое. Вы можете следовать [инструкциям по установке](https://rust-analyzer.github.io/manual.html#installation) для вашего редактора: [VSCode](https://rust-analyzer.github.io/manual.html#vs-code), [Zed](https://rust-analyzer.github.io/manual.html#zed), [Emacs](https://rust-analyzer.github.io/manual.html#emacs), или [Vim](https://rust-analyzer.github.io/manual.html#vimneovim).

## Установка Rust

Перейдите на [https://rust-lang.org](http://rust-lang.org) и установите компилятор Rust (предпочтительно используя `rustup`). После установки убедитесь, что вы добавили тулчейн `stable` и любые соответствующие тулчейны (например, wasm32-unknown-unknown для веб-приложений):

```sh
rustup toolchain install stable
rustup target add wasm32-unknown-unknown
```

Мы настоятельно рекомендуем полностью пройти [официальную книгу по Rust](https://doc.rust-lang.org/book/ch01-00-getting-started.html). Однако мы надеемся, что приложение на Dioxus может послужить отличным первым проектом на Rust.

Мы приложили много усилий, чтобы сделать синтаксис Dioxus знакомым и легким для понимания, поэтому вам не понадобятся глубокие знания async, lifetimes или умных указателей, пока вы не начнёте строить сложные приложения на Dioxus.

## Установка Dioxus CLI

Dioxus поставляется со своим собственным инструментом сборки, который использует `cargo` для обеспечения интегрированной горячей перезагрузки, сборки и серверов разработки для веба и мобильных устройств. Вы можете скачать предварительно собранный бинарник с помощью следующей команды:

```sh
curl -sSL https://dioxus.dev/install.sh | bash
```

Вы также можете скачать с помощью `cargo-binstall`:

```sh
cargo binstall dioxus-cli --force
```

Если вы хотите собрать CLI из исходников, вы можете установить его с помощью следующей команды:

```sh
cargo install dioxus-cli
```

> 📣 Установка из исходников может занять до 10 минут и требует нескольких зависимостей. Мы *настоятельно* рекомендуем скачивать предварительно собранные бинарники.

Если при установке возникает ошибка OpenSSL, убедитесь, что установлены зависимости, перечисленные [здесь](https://docs.rs/openssl/latest/openssl/#automatic).

## Платформенно-специфичные зависимости

Большинство платформ не требуют дополнительных зависимостей, но если вы ориентируетесь на десктоп, вам может понадобиться установить дополнительные зависимости.

Вы можете использовать команду `dx doctor`, чтобы проверить, может ли `dx` правильно понять вашу установку. Эта команда помогает выявить отсутствующие тулчейны и инструменты, необходимые для кроссплатформенной разработки.

### macOS

Для macOS нет дополнительных зависимостей! Однако если вы хотите собирать iOS-приложения, прочитайте раздел [iOS](#ios) ниже.

### Windows

Windows-приложения зависят от WebView2 — библиотеки, которая должна быть установлена во всех современных дистрибутивах Windows.

Если у вас установлен Edge, Dioxus будет работать нормально. Если у вас *нет* WebView2, вы можете [установить его через Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/webview2/). Microsoft предоставляет 3 варианта:

1. Крошечный "вечнозелёный" _bootstrapper_, который загружает установщик с CDN Microsoft.
2. Крошечный _installer_, который загружает WebView2 с CDN Microsoft.
3. Статически слинкованная версия WebView2 в вашем финальном бинарнике для offline-пользователей.

Мы рекомендуем использовать Вариант 1.

### Linux

Linux-приложения WebView требуют WebkitGtk и xdotool. При распространении они должны быть частью дерева зависимостей в вашем `.rpm` или `.deb`.

Если у вас возникли проблемы, убедитесь, что у вас установлены все базовые компоненты.

Для Ubuntu убедитесь, что всё установлено:

```sh
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  lld
```

Для arch:
```sh
sudo pacman -Syu
sudo pacman -S --needed \
  webkit2gtk-4.1 \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  appmenu-gtk-module \
  libappindicator-gtk3 \
  librsvg \
  xdotool
```

Для всех остальных Linux-таргетов [проверьте документацию Tauri, которая охватывает те же зависимости](https://tauri.app/start/prerequisites/#linux).

Помимо документации Tauri, для Fedora:
```sh
sudo dnf install libxdo-devel
```

### WSL

Хотя это возможно, настройка разработки в WSL для Dioxus Desktop может быть сложной. Не всё было выяснено, и некоторые вещи могут не работать.

Вот шаги, которые мы использовали для запуска Dioxus через WSL:

1. Обновите ядро до последней версии и обновите WSL до версии 2.
2. Добавьте `export DISPLAY=:0` в `~/.zshrc`
3. Установите зависимости Linux для Tauri, найденные [здесь](https://beta.tauri.app/start/prerequisites/).
4. Для работы файловых диалогов вам нужно установить fallback, такой как `zenity`

При запуске Dioxus Desktop на WSL вы можете получить предупреждения от `libEGL`. В настоящее время нет способа их заглушить, но приложение должно по-прежнему рендериться.

### iOS

Сборка iOS-приложений требует устройства под управлением macOS с установленным XCode.

Скачайте и установите XCode из одного из следующих мест:
- [Mac App Store](https://apps.apple.com/gb/app/xcode/id497799835?mt=12)
- [Apple Developer website](https://developer.apple.com/xcode/resources/)

Вам нужно будет скачать iOS SDK и установить несколько симуляторов.

Для более подробной информации мы рекомендуем прочитать [специальное руководство по разработке под iOS](../guides/platforms/mobile.md).

### Android

Android-приложения требуют установки Android SDK и NDK. Это может быть существенный объём настройки, поэтому мы рекомендуем прочитать [специальное руководство по разработке под Android](../guides/platforms/mobile.md).
