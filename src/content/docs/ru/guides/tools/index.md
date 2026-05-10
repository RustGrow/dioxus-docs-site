---
title: Инструменты
---

# Инструменты

У Dioxus есть экосистема инструментов, которые помогают разрабатывать и развёртывать ваши приложения. Это руководство поможет вам настроить, сконфигурировать и использовать эти инструменты.

## Установка CLI

CLI объединяет множество различных инструментов для разработки на Dioxus. Dioxus предоставляет предварительно собранные бинарники для Windows, macOS и Linux, которые можно скачать с помощью [cargo-binstall](https://github.com/cargo-bins/cargo-binstall):

```bash
cargo binstall dioxus-cli
```

### Ручная установка

Если у вас не установлен cargo-binstall или у нас нет предварительно собранного бинарника для вашей платформы, вы можете установить CLI с помощью cargo install:

```bash
cargo install dioxus-cli
```

## Команды

Чтобы проверить вашу установку и получить обзор всех доступных команд, запустите:

```sh
dx --help
```

Вы должны увидеть что-то вроде этого:

```sh
Dioxus: build web, desktop, and mobile apps with a single codebase

Usage: dx [OPTIONS] <COMMAND>

Commands:
  new          Create a new Dioxus project
  serve        Build, watch, and serve the project
  bundle       Bundle the Dioxus app into a shippable object
  build        Build the Dioxus project and all of its assets
  run          Run the project without any hotreloading
  init         Init a new project for Dioxus in the current directory (by default). Will attempt to keep your project in a good state
  doctor       Diagnose installed tools and system configuration
  print        Print project information in a structured format, like cargo args, linker args, and other flags DX sets that might be useful in third-party tools
  translate    Translate a source file into Dioxus code
  fmt          Automatically format RSX
  check        Check the project for any issues
  config       Dioxus config file controls
  self-update  Update the Dioxus CLI to the latest version
  tools        Run a dioxus build tool. IE `build-assets`, `hotpatch`, etc
  components   Manage components from the `dioxus-component` registry
  help         Print this message or the help of the given subcommand(s)

Options:
      --verbose      Use verbose output [default: false]
      --trace        Use trace output [default: false]
      --json-output  Output logs in JSON format
  -h, --help         Print help
  -V, --version      Print version

Logging Options:
      --log-to-file <LOG_TO_FILE>  Write *all* logs to a file

Manifest Options:
      --locked   Assert that `Cargo.lock` will remain unchanged
      --offline  Run without accessing the network
      --frozen   Equivalent to specifying both --locked and --offline
```

## Содержание

Многие главы этого руководства охватывают различные команды CLI:
- [Создание проекта](./creating.md) предоставляет обзор команд `dx new` и `dx init` для создания скелета вашего проекта на Dioxus
- [Перевод HTML](./translate.md) предоставляет обзор команды `dx translate` для конвертации HTML в RSX.

Другие главы исследуют различные аспекты использования CLI и других инструментов:
- [Конфигурация проекта](./configure.md) рассказывает, как можно сконфигурировать ваш проект с помощью файла `Dioxus.toml`, который читает CLI

## Автодополнение оболочки

Начиная с Dioxus 0.7.6, CLI поддерживает генерацию автодополнений для bash, zsh, fish и PowerShell:

```sh
# Сгенерировать автодополнения для вашей оболочки
dx completions bash > /usr/share/bash-completion/completions/dx
```

Это включает tab-дополнение для всех подкоманд и флагов `dx` в терминале.
