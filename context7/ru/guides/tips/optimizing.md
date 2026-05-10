---
title: Оптимизация
---

# Оптимизация

*Примечание: Это написано в первую очередь для веба, но основные оптимизации будут работать и на других платформах.*

Вы, возможно, заметили, что бинарники Dioxus довольно большие.
WASM-бинарник [TodoMVC-приложения](https://github.com/tigerros/dioxus-todo-app) весит 2,36 МБ!
Не волнуйтесь; мы можем сократить его до гораздо более управляемых 234 КБ.
Это, очевидно, будет ещё меньше со временем.
С помощью nightly-фич можно даже уменьшить размер бинарника hello world до менее 100 КБ!

Мы также обсудим способы оптимизации вашего приложения для повышения скорости.

Однако некоторые оптимизации будут жертвовать скоростью ради уменьшения размера бинарника или наоборот.
Это вам нужно решить самостоятельно. Выполняет ли ваше приложение ресурсоёмкие задачи, такие как графическая обработка или множество манипуляций с DOM?
Тогда вы можете выбрать повышение скорости. В большинстве случаев, однако, уменьшение размера бинарника — лучший выбор, особенно потому, что WASM-бинарники Dioxus довольно велики.

Для тестирования размеров бинарников мы будем использовать [этот](https://github.com/tigerros/dioxus-todo-app) репозиторий в качестве примера приложения.
Пакет `no-optimizations` послужит базой, который весит 2,36 МБ на данный момент.

Дополнительные ресурсы:
- [WASM book — Shrinking `.wasm` code size](https://rustwasm.github.io/docs/book/reference/code-size.html)
- [min-sized-rust](https://github.com/johnthagen/min-sized-rust)

## Сборка в режиме release

Это лучший способ оптимизации. На самом деле, цифра 2,36 МБ в начале руководства — это с режимом release.
В режиме debug это на самом деле целых 32 МБ! Это также увеличивает скорость вашего приложения.

Мы можем использовать флаг `--release` для создания оптимизированной сборки нашего приложения, которая будет и быстрее, и меньше:

`dx build --release`

## UPX

Если вы не ориентируетесь на веб, вы можете использовать CLI-инструмент [UPX](https://github.com/upx/upx) для сжатия ваших исполняемых файлов.

Установка:

- Скачайте [релиз](https://github.com/upx/upx/releases) и распакуйте директорию в подходящее место.
- Добавьте исполняемый файл из директории в переменную path.

Вы можете запустить `upx --help`, чтобы получить опции CLI, но вы также должны просмотреть `upx-doc.html` для более подробной информации.
Он включён в распакованную директорию.

Пример команды может быть: `upx --best -o target/release/compressed.exe target/release/your-executable.exe`.

## Конфигурация сборки

*Примечание: Настройки, определённые в `.cargo/config.toml`, переопределят настройки в `Cargo.toml`.*

Помимо флага `--release`, это самый простой способ оптимизации ваших проектов, а также самый эффективный,
по крайней мере, с точки зрения уменьшения размера бинарника.

### Стабильная конфигурация

Эта конфигурация на 100% стабильна и уменьшает размер бинарника с 2,36 МБ до 310 КБ.
Добавьте это в ваш `.cargo/config.toml`:

```toml
[profile.release]
opt-level = "z"
debug = false
lto = true
codegen-units = 1
panic = "abort"
incremental = false
```

Ссылки на документацию каждого значения:
- [`opt-level`](https://doc.rust-lang.org/rustc/codegen-options/index.html#opt-level)
- [`debug`](https://doc.rust-lang.org/rustc/codegen-options/index.html#debuginfo)
- [`lto`](https://doc.rust-lang.org/rustc/codegen-options/index.html#lto)
- [`codegen-units`](https://doc.rust-lang.org/rustc/codegen-options/index.html#codegen-units)
- [`panic`](https://doc.rust-lang.org/rustc/codegen-options/index.html#panic)
- [`strip`](https://doc.rust-lang.org/rustc/codegen-options/index.html#strip)
- [`incremental`](https://doc.rust-lang.org/rustc/codegen-options/index.html#incremental)

### Нестабильная конфигурация

Эта конфигурация содержит некоторые нестабильные фичи, но она должна работать нормально.
Она уменьшает размер бинарника с 310 КБ до 234 КБ.
Добавьте это в ваш `.cargo/config.toml`:

```toml
[unstable]
build-std = ["std", "panic_abort", "core", "alloc"]
build-std-features = ["panic_immediate_abort"]

[build]
rustflags = [
    "-Clto",
    "-Zvirtual-function-elimination",
    "-Zlocation-detail=none"
]

# То же, что и в разделе Стабильная конфигурация
[profile.release]
opt-level = "z"
debug = false
lto = true
codegen-units = 1
panic = "abort"
strip = true
incremental = false
```

*Примечание: Пропущенный пробел в каждом флаге (например, `-C<нет пробела здесь>lto`) является намеренным. Это не опечатка.*

Значения в `[profile.release]` задокументированы в разделе [Стабильная конфигурация](#стабильная-конфигурация). Ссылки на документацию каждого значения:
- [`[build.rustflags]`](https://doc.rust-lang.org/cargo/reference/config.html#buildrustflags)
- [`-C lto`](https://doc.rust-lang.org/rustc/codegen-options/index.html#lto)
- [`-Z virtual-function-elimination`](https://doc.rust-lang.org/stable/unstable-book/compiler-flags/virtual-function-elimination.html)
- [`-Z location-detail`](https://doc.rust-lang.org/stable/unstable-book/compiler-flags/location-detail.html)

## wasm-opt

*Примечание: В будущем `wasm-opt` будет поддерживаться нативно через [Dioxus CLI](https://crates.io/crates/dioxus-cli).*

`wasm-opt` — это инструмент из библиотеки [binaryen](https://github.com/WebAssembly/binaryen), который оптимизирует ваши WASM-файлы.
Для его использования установите [релиз binaryen](https://github.com/WebAssembly/binaryen/releases) и выполните эту команду из директории пакета:

```
wasm-opt dist/assets/dioxus/APP_NAME_bg.wasm -o dist/assets/dioxus/APP_NAME_bg.wasm -Oz
```

Флаг `-Oz` указывает, что `wasm-opt` должен оптимизировать по размеру. Для скорости используйте `-O4`.

## Улучшение кода Dioxus

Давайте поговорим о том, как вы можете улучшить свой код Dioxus, чтобы он был более производительным.

Важно минимизировать количество динамических частей в вашем `rsx`, таких как условный рендеринг.
Когда Dioxus рендерит ваш компонент, он пропускает части, которые такие же, как при последнем рендере.
Это означает, что если вы сведёте динамический рендеринг к минимуму, ваше приложение ускорится, и довольно сильно, если это не просто hello world.

Также посмотрите раздел [Антипаттерны](antipatterns.md), чтобы узнать о паттернах, которых следует избегать.
Очевидно, не все они связаны только с производительностью, но некоторые — да.

## Оптимизация размера ресурсов

Ресурсы могут составлять значительную часть размера вашего приложения. Dioxus включает альфа-поддержку первичных ресурсов. Любые ресурсы, которые вы включаете с помощью макроса `asset!`, будут оптимизированы для production в релизных сборках.
