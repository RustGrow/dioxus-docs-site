---
title: Настройка проекта
---

# Настройка проекта

В этой главе вы узнаете, как настроить CLI с помощью файла `Dioxus.toml`. Ниже приведён [пример](#пример-конфигурации) с комментариями, описывающими отдельные ключи. Вы можете скопировать его или просмотреть эту документацию для более полного понимания.

"🔒" обозначает обязательный элемент. Некоторые заголовки являются обязательными, но ни один из ключей внутри них не является обязательным. В таком случае вам нужно только включить заголовок, но не ключи. Это может выглядеть странно, но это нормально.

## Структура

Каждый заголовок имеет свою форму TOML прямо под ним.

### Application 🔒

```toml
[application]
```

Конфигурация на уровне приложения. Применяется и для веба, и для десктопа.

* **asset_dir** - Директория со статическими ресурсами. CLI автоматически скопирует эти ресурсы в **out_dir** после сборки/сервировки.
   ```toml
   asset_dir = "public"
   ```
* **sub_package** - Подпакет в workspace, который будет собираться по умолчанию.
   ```toml
   sub_package = "my-crate"
   ```

### Web.App 🔒

```toml
[web.app]
```

Веб-специфичная конфигурация.

* **title** - Заголовок веб-страницы.
   ```toml
   # Содержимое HTML-тега title
   title = "project_name"
   ```
* **base_path** - Базовый путь для сборки приложения при сервировке. Может быть полезен, когда приложение обслуживается в подкаталоге домена. Например, при сборке сайта для публикации на GitHub Pages.
   ```toml
   # Приложение будет обслуживаться по адресу domain.com/my_application/, поэтому нам нужно изменить base_path на путь, по которому будет обслуживаться приложение
   base_path = "my_application"
   ```

### Web.Watcher 🔒

```toml
[web.watcher]
```

Конфигурация сервера разработки.

* **reload_html** - Если значение `true`, CLI будет пересобирать файл index.html каждый раз при пересборке приложения
   ```toml
   reload_html = true
   ```

* **watch_path** - Файлы и директории для отслеживания изменений
   ```toml
   watch_path = ["src", "public"]
   ```

* **index_on_404** - Если включено, Dioxus будет отдавать корневую страницу, когда маршрут не найден.
   *Это необходимо при обслуживании приложения, использующего роутер*. Однако при обслуживании приложения с помощью чего-либо другого, кроме Dioxus (например, GitHub Pages), вам нужно будет проверить, как настроить это на той платформе. В GitHub Pages вы можете сделать копию `index.html` с именем `404.html` в той же директории.
   ```toml
   index_on_404 = true
   ```

### Web.Resource 🔒

```toml
[web.resource]
```

Конфигурация статических ресурсов.

* **style** - CSS-файлы для включения в приложение.
   ```toml
   style = [
      # Подключение из public_dir.
      "./assets/style.css",
      # Или ресурс из онлайн-CDN.
      "https://cdn.jsdelivr.net/npm/bootstrap/dist/css/bootstrap.css"
   ]
   ```

* **script** - JavaScript-файлы для включения в приложение.
    ```toml
    script = [
        # Подключение из asset_dir.
        "./public/index.js",
        # Или из онлайн-CDN.
        "https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.js"
    ]
   ```

### Web.Resource.Dev 🔒

```toml
[web.resource.dev]
```

Это то же самое, что и [`[web.resource]`](#webresource-), но работает только на серверах разработки. Например, если вы хотите включить файл на сервере `dx serve`, но не на сервере `dx serve --release`, поместите его сюда.

### Web.Proxy

```toml
[[web.proxy]]
```

Конфигурация прокси, которые требуются вашему приложению во время разработки. Прокси будут перенаправлять запросы на другой сервис.

* **backend** - URL сервера для проксирования. CLI будет перенаправлять любые запросы под относительным маршрутом backend на backend вместо возврата 404
   ```toml
   backend = "http://localhost:8000/api/"
   ```
   Это приведёт к тому, что любые запросы к серверу разработки с префиксом /api/ будут перенаправлены на backend-сервер по адресу http://localhost:8000. Путь и параметры запроса будут переданы как есть (перезапись пути в настоящее время не поддерживается).

### Web.https

```toml
[[web.https]]
```

Управляет конфигурацией HTTPS для CLI.

* **enabled** включает или отключает HTTPS в CLI
   ```toml
   enabled = true
   ```
* **mkcert** включает или отключает генерацию сертификатов с помощью CLI mkcert
   ```toml
   mkcert = true
   ```
* **key_path** задаёт путь к HTTPS-ключу
   ```toml
   key_path = "/path/to/key"
   ```
* **cert_path** задаёт путь к HTTPS-сертификату
   ```toml
   cert_path = "/path/to/cert"
   ```

### Web.pre_compress

Если эта настройка включена, CLI будет предварительно сжимать собранные ресурсы в режиме релиза с помощью brotli. Эта настройка включена по умолчанию.

```toml
[web]
pre_compress = true
```

### Web.wasm_opt

Управляет конфигурацией wasm-opt для CLI.

* **level** задаёт уровень оптимизации для wasm-opt в релизных сборках.
   - z: агрессивная оптимизация по размеру
   - s: оптимизация по размеру
   - 1: оптимизация по скорости
   - 2: более агрессивная оптимизация по скорости
   - 3: ещё более агрессивная оптимизация по скорости
   - 4: агрессивная оптимизация по скорости (по умолчанию)
   ```toml
   level = "z"
   ```
* **debug** сохраняет отладочные символы в WASM-файле даже в релизных сборках
   ```toml
   debug = true
   ```

### Bundle

```toml
[bundle]
```

Управляет процессом упаковки вашего приложения. Dioxus использует tauri-bundler под капотом. Этот раздел включает только подмножество доступных опций tauri-bundler. Больше опций можно найти в [документации](https://v1.tauri.app/v1/guides/building/#configuration-options) tauri-bundler.

* **identifier** - Уникальный идентификатор вашего приложения (например, `com.dioxuslabs`).
   ```toml
   identifier = "com.dioxuslabs"
   ```
* **publisher** - Имя сущности, публикующей приложение.
   ```toml
   publisher = "DioxusLabs"
   ```
* **icon** - Пути к файлам иконок для использования в пакете. Файлы иконок должны быть квадратными и иметь размер 16, 24, 32, 64 или 256 пикселей. PNG-иконки должны иметь глубину цвета 32 бита в формате RGBA. Если вы используете файл `.icns`, он должен соответствовать [этому](https://github.com/tauri-apps/tauri/blob/d8db5042a28635259f646c329c3ec5ccf23eac9e/tooling/cli/src/helpers/icns.json) формату. Иконки должны включать `.icns` для macOS, `.ico` для Windows и `.png` для Linux.
   ```toml
   icon = [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
   ]
   ```
* **resources** - Дополнительные файлы для включения в пакет. Каждый ресурс копируется из указанного пути и доступен из пакета по тому же пути. Любые [ресурсы](../../essentials/ui/assets.md) автоматически включаются в установщик.
   ```toml
   resources = ["path/to/resource"]
   ```
* **copyright** - Информация об авторских правах для приложения.
   ```toml
   copyright = "Copyright 2023 DioxusLabs"
   ```
* **category** - Категория приложения. Должна быть одной из `Business`, `DeveloperTool`, `Education`, `Entertainment`, `Finance`, `Game`, `ActionGame`, `AdventureGame`, `ArcadeGame`, `BoardGame`, `CardGame`, `CasinoGame`, `DiceGame`, `EducationalGame`, `FamilyGame`, `KidsGame`, `MusicGame`, `PuzzleGame`, `RacingGame`, `RolePlayingGame`, `SimulationGame`, `SportsGame`, `StrategyGame`, `TriviaGame`, `WordGame`, `GraphicsAndDesign`, `HealthcareAndFitness`, `Lifestyle`, `Medical`, `Music`, `News`, `Photography`, `Productivity`, `Reference`, `SocialNetworking`, `Sports`, `Travel`, `Utility`, `Video` или `Weather`
   ```toml
   category = "Utility"
   ```
* **short_description** - Краткое описание приложения.
   ```toml
   short_description = "A utility application built with Dioxus"
   ```
* **long_description** - Подробное описание приложения.
   ```toml
   long_description = "This application provides various utility functions..."
   ```
* **external_bin** - Пути к внешним бинарным файлам (sidecar) для включения в пакет. Эти пакеты могут быть доступны во время выполнения по имени бинарного файла (не абсолютному пути). **Целевой триплет будет автоматически добавлен к имени бинарного файла перед его включением в пакет.**
   ```toml
   external_bin = ["path/to/external_binary"] # В macOS бинарный файл по пути path/to/external_binary-aarch64-apple-darwin будет включён в пакет. Он может быть доступен во время выполнения по имени external_binary
   ```

### Bundle.macos

```toml
[bundle.macos]
```

Опции конфигурации для пакетов macOS.

* **frameworks** - Список фреймворков для включения в пакет.
   ```toml
   frameworks = ["CoreML"]
   ```
* **minimum_system_version** - Минимальная требуемая версия macOS. (по умолчанию: `10.13`)
   ```toml
   minimum_system_version = "10.13"
   ```
* **license** - Путь к файлу лицензии.
   ```toml
   license = "LICENSE.txt"
   ```
* **exception_domain** - Домен для обработки исключений. Домен должен быть в нижнем регистре без порта или протокола.
   ```toml
   exception_domain = "mysite.com"
   ```
* **signing_identity** - Идентификатор подписи macOS.
   ```toml
   signing_identity = "SIGNING IDENTITY KEYCHAIN ENTRY NAME"
   ```
* **provider_short_name** - Короткое имя провайдера для пакета.
   ```toml
   provider_short_name = "DioxusLabs"
   ```
* **entitlements** - Путь к файлу entitlements.
   ```toml
   entitlements = "entitlements.plist"
   ```
* **hardened_runtime** - Включать ли [hardened runtime](https://developer.apple.com/documentation/security/hardened-runtime) в пакете.
   ```toml
   hardened_runtime = true
   ```

### Bundle.windows

```toml
[bundle.windows]
```

Опции конфигурации для пакетов Windows.

* **digest_algorithm** - Задаёт алгоритм дайджеста файла, используемый для подписи.
   ```toml
   digest_algorithm = "sha-256"
   ```
* **certificate_thumbprint** - SHA1-хеш сертификата подписи.
   ```toml
   certificate_thumbprint = "A1B2C3D4E5F6..."
   ```
* **timestamp_url** - Задаёт сервер для временной метки подписи.
   ```toml
   timestamp_url = "http://timestamp.digicert.com"
   ```
* **tsp** - Использовать ли протокол временных меток.
   ```toml
   tsp = true
   ```
* **icon_path** - Путь к иконке для системного трея. (по умолчанию `./icons/icon.ico`)
   ```toml
   icon_path = "assets/icon.ico"
   ```
* **webview_install_mode** - Режим установки WebView2.
   EmbedBootstrapper: встраивать загрузчик WebView2 в установщик
   ```toml
   [webview_install_mode.EmbedBootstrapper]
   silent = true
   ```
   DownloadBootstrapper: загружать загрузчик WebView2 в установщик во время выполнения
   ```toml
   [webview_install_mode.DownloadBootstrapper]
   silent = true
   ```
   OfflineInstaller: встраивать установщик WebView2 в основной установщик
   ```toml
   [webview_install_mode.OfflineInstaller]
   silent = true
   ```
   FixedRuntime: использовать фиксированный путь к среде выполнения WebView2
   ```toml
   [webview_install_mode.FixedRuntime]
   path = "path/to/runtime"
   ```
   Skip: не устанавливать WebView2 как часть установщика. Это приведёт к сбою приложения, если WebView не был установлен заранее
   ```toml
   webview_install_mode = "Skip"
   ```

## Пример конфигурации

Это включает все поля, обязательные и необязательные.

```toml
[application]

# Имя приложения
name = "project_name"

# Путь вывода для `build` и `serve`
out_dir = "dist"

# Путь к статическим ресурсам
asset_dir = "public"

[web.app]

# Содержимое HTML-тега title
title = "project_name"

[web.watcher]

# При срабатывании watcher перегенерировать `index.html`
reload_html = true

# Какие файлы или директории будут отслеживаться
watch_path = ["src", "public"]

# Подключение стилей или скриптов
[web.resource]

# CSS-файл стилей
style = []

# Файл JavaScript-кода
script = []

[web.resource.dev]

# То же, что и [web.resource], но для серверов разработки

# CSS-файл стилей
style = []

# JavaScript-файлы
script = []

[[web.proxy]]
backend = "http://localhost:8000/api/"

[bundle]
identifier = "com.dioxuslabs"
publisher = "DioxusLabs"
icon = "assets/icon.png"
```
