---
title: Ресурсы (Assets)
---

# Ресурсы (Assets)

Ресурсы (assets) — это файлы, которые включаются в конечную сборку приложения. Это могут быть изображения, шрифты, таблицы стилей или любые другие файлы, не являющиеся исходными. Dioxus обеспечивает первоклассную поддержку ресурсов и предоставляет простой способ включить их в ваше приложение, а также автоматически оптимизировать для production.

Ресурсы в Dioxus также совместимы с библиотеками! Если вы создаёте библиотеку, вы можете включать ресурсы в неё, и они будут автоматически включены в конечную сборку любого приложения, использующего вашу библиотеку.

## Включение изображений

Чтобы включить изображение в ваше приложение, просто оберните путь к ресурсу в макрос `asset!`:

```rust
use dioxus::prelude::*;

fn App() -> Element {
    // You can link to assets that are relative to the package root or even link to an asset from a url
    // These assets will automatically be picked up by the dioxus cli, optimized, and bundled with your final applications
    let ferrous = asset!("/assets/static/ferrous_wave.png");

    rsx! {
        img { src: "{ferrous}" }
    }
}
```

Макрос ресурса принимает путь к ресурсу относительно корня вашего приложения. Путь *не* является абсолютным для вашей машины, что позволяет использовать одни и те же пути к ресурсам на разных машинах.

```rust
// ❌ не работает!
let ferrous = asset!("/Users/dioxus/Downloads/image.png");
```

Макрос ресурса является `const`, то есть мы можем использовать его inline или как static/const элемент:

```rust
// как static элемент
static FERROUS: Asset = asset!("/assets/static/ferrous_wave.png");

// или inline
rsx! {
    img { src: asset!("/assets/static/ferrous_wave.png") }
}
```

## Настройка опций обработки изображений

Можно также оптимизировать, изменять размер и предзагружать изображения с помощью макроса `asset!`. Выбор оптимизированного типа файла (например, Avif) и разумной настройки качества может значительно уменьшить размер изображений, что помогает вашему приложению загружаться быстрее. Например, можно использовать следующий код для включения оптимизированного изображения в приложение:

```rust
pub const ENUM_ROUTER_IMG: Asset = asset!(
    "/assets/static/enum_router.png",
    // You can pass a second argument to the asset macro to set up options for the asset
    ImageAssetOptions::new()
        // You can set the image size in pixels at compile time to send the smallest possible image to the client
        .with_size(ImageSize::Manual {
            width: 52,
            height: 52
        })
        // You can also convert the image to a web friendly format at compile time. This can make your images significantly smaller
        .with_format(ImageFormat::Avif)
);

fn EnumRouter() -> Element {
    rsx! {
        img { src: "{ENUM_ROUTER_IMG}" }
    }
}
```

## Включение таблиц стилей

Можно включать таблицы стилей в приложение с помощью макроса `asset!`. Таблицы стилей будут автоматически минифицированы при сборке, чтобы ускорить время загрузки. Например, можно использовать следующий код для включения таблицы стилей:

```rust
// You can also bundle stylesheets with your application
// Any files that end with .css will be minified and bundled with your application even if you don't explicitly include them in your <head>
const _: Asset = asset!("/assets/tailwind.css");
```

> В [руководстве по tailwind](../../guides/utilities/tailwind.md) есть больше информации о том, как использовать tailwind с dioxus.

## Поддержка SCSS

SCSS также поддерживается через макрос `asset!`. Включайте его так же, как обычный CSS-файл.

Больше о ресурсах и всех доступных опциях для их оптимизации можно прочитать в [документации manganis](https://docs.rs/manganis/latest/manganis).

## Включение произвольных файлов

В dioxus desktop может потребоваться включить файл с данными для приложения. Если вы не задаёте никаких опций для вашего ресурса и расширение файла не распознано, ресурс будет скопирован без изменений. Например, можно использовать следующий код для включения бинарного файла:

```rust
// You can also collect arbitrary files. Relative paths are resolved relative to the package root
const PATH_TO_BUNDLED_CARGO_TOML: Asset = asset!("/Cargo.toml");
```

Эти файлы будут автоматически включены в конечную сборку приложения, и вы можете использовать их в приложении как любой другой файл.

## Хеши ресурсов

Макрос ресурса автоматически прикрепляет хеш к имени ресурса после его сборки. Это делает собранные ресурсы вашего приложения уникальными во времени, позволяя бесконечно кешировать ресурс на вашем веб-сервере или на [CDN](https://en.wikipedia.org/wiki/Content_delivery_network).

```rust
// выводит "/assets/ferrous_wave-dxhx13xj2j.png"
println!("{}", asset!("/assets/static/ferrous_wave.png"))
```

Хеши ресурсов — чрезвычайно мощная функция системы ресурсов. Хеши интегрируются с CDN и могут значительно ускорить производительность загрузки вашего приложения и сэкономить деньги на инфраструктурных расходах.

Однако иногда может потребоваться отключить их. Мы можем настроить опции обработки ресурсов с помощью билдера `AssetOptions`:

```rust
let ferrous = asset!("/assets/static/ferrous_wave.png", AssetOptions::builder().with_hash_suffix(false));
```

## Связывание ресурсов на основе линкера

В отличие от макроса Rust `include_bytes!`, макрос `asset!` *не* копирует содержимое ресурса в конечный бинарник приложения. Вместо этого он добавляет путь ресурса и опции в метаданные конечного бинарника. Когда вы запускаете `dx serve` или `dx build`, мы автоматически читаем эти метаданные и обрабатываем ресурс.

![Asset Bundling](/assets/07/asset-pipeline-full.png)

Метаданные для каждого ресурса автоматически встраиваются в конечный исполняемый файл путём сериализации его пути и свойств с помощью крейта [const-serialize](https://crates.io/crates/const-serialize). Когда DX собирает исполняемый файл, он затем ищет в выходном бинарнике метаданные ресурсов. После завершения сборки DX вычисляет хеши ресурсов и записывает их обратно в бинарник.

```rust
#[link_section = "dx-assets"]
static SERIALIZED_ASSET_OPTIONS: &[u8] = r#"{"path": "/assets/main.css","minify":"true","hash":"dxh0000"}"#;
```

Это означает, что ресурсы не запечены навсегда в конечный исполняемый файл. Конечный исполняемый файл меньше, загружается быстрее, а загрузка ресурсов гораздо более гибкая. Это важно на платформах вроде браузера, где ресурсы загружаются параллельно по сети.

Чтобы динамически загружать содержимое ресурса, можно использовать крейт [dioxus-asset-resolver](https://crates.io/crates/dioxus-asset-resolver), который правильно понимает формат сборки приложения и загружает ресурс по его реализации `Display`.

```rust
let contents = dioxus_asset_resolver::serve_asset(&asset!("/assets/main.css").to_string());
```

## Ресурсы должны использоваться, ресурсы в библиотеках

Поскольку Dioxus использует линкер программы для сохранения метаданных ресурсов, результирующий ресурс должен где-то использоваться в вашем приложении. Если вы забудете использовать возвращённый Asset, компилятор Rust вправе оптимизировать вызов, и метаданные ресурса не попадут в конечный вывод:

```rust
let ferrous = asset!("/assets/static/ferrous_wave.png");
rsx! {
    // наш ferrous png не будет включён, так как мы забыли его использовать!
    img { src: "..." }
}
```

Это ожидаемое поведение. Мы спроектировали систему ресурсов так, чтобы автоматически удалять неиспользуемые ресурсы, что позволяет сторонним библиотекам экспортировать свои собственные ресурсы как часть своего публичного API. Например, мы можем написать библиотеку, включающую несколько таблиц стилей:

```rust
crate: cool_dioxus_library
pub static GREEN_STYLES: Asset = asset!("/assets/red.css");
pub static RED_STYLES: Asset = asset!("/assets/green.css");
```

Когда пользователь собирает приложение, использующее нашу библиотеку, ему нужно только импортировать таблицу стилей, которую он хочет использовать:

```rust
fn main() {
    dioxus::launch(|| rsx!{
        link { href: cool_dioxus_library::GREEN_STYLES, rel: "stylesheet" }
    })
}
```

Поскольку ресурс `RED_STYLES` никогда не упоминается в приложении пользователя, он не будет включён в конечный вывод.

Однако иногда может потребоваться включить ресурс, даже если вы никогда не ссылаетесь на него напрямую. Атрибут Rust [`#[used]`](https://doc.rust-lang.org/reference/abi.html#the-used-attribute) полезен здесь, указывая компилятору, что ресурс *используется*, даже если мы не можем доказать это на этапе компиляции.

```rust
#[used]
static CERTS: Asset = asset!("/assets/keys.cert");
```

## Включение папок

Макрос ресурса также поддерживает импорт целых папок с содержимым! Сама папка не будет скопирована в конечную сборку. Вместо этого вы присоединяете имя файлов в папке к пути папки. Например, может потребоваться включить папку стороннего JavaScript в приложение и не хочется использовать вызов `asset!` для каждого файла в папке.

```rust
let logging_js_path = format!("{}/logging.js", asset!("/assets/posthog-js"));
```

Обратите внимание, что здесь нам нужно форматировать `Asset`, возвращённый макросом `asset!()`, потому что фактическое имя папки получит хеш ресурса.

## Чтение ресурсов

Когда вы используете ресурс в элементе, например, в теге `img`, браузер автоматически загружает ресурс. Однако иногда может потребоваться прочитать содержимое ресурса непосредственно в коде приложения. Например, может потребоваться прочитать JSON-файл и распарсить его в структуру данных.

Для чтения ресурсов во время выполнения можно использовать [`read_asset_bytes`](https://docs.rs/dioxus-asset-resolver/latest/dioxus_asset_resolver/fn.read_asset_bytes.html) из модуля [`asset_resolver`](https://docs.rs/dioxus-asset-resolver/latest/dioxus_asset_resolver/). Это либо загрузит ресурс из сети (для веб-таргета), либо прочитает его из сборки (для нативных таргетов):

```rust
use dioxus::prelude::*;

// Bundle the static JSON asset into the application
    static JSON_ASSET: Asset = asset!("assets/data.json");

// Read the bytes of the JSON asset
    let bytes = dioxus::asset_resolver::read_asset_bytes(&JSON_ASSET)
        .await
        .unwrap();

// Deserialize the JSON data
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json["key"].as_str(), Some("value"));
```

Если вы таргетируете платформу вроде Windows или macOS, где ресурсы собраны рядом с исполняемым файлом в файловой системе, можно также получить путь к ресурсу с помощью функции `asset_path`. Имейте в виду, что это не будет работать в браузере или в Android-сборках, поскольку ресурсы не хранятся в файловой системе:

```rust
use dioxus::prelude::*;

// Bundle the static JSON asset into the application
    static JSON_ASSET: Asset = asset!("assets/data.json");

// Resolve the path of the asset. This will not work in web or Android bundles
    let path = dioxus::asset_resolver::asset_path(&JSON_ASSET).unwrap();

    println!("Asset path: {:?}", path);

// Read the bytes of the JSON asset
    let bytes = std::fs::read(path).unwrap();

// Deserialize the JSON data
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json["key"].as_str(), Some("value"));
```

## Публичная папка

Если вы разворачиваете приложение в вебе, то DX автоматически копирует любые файлы из папки `/public` вашего приложения в выходную папку `/public`.

Это может быть полезно для копирования файлов вроде `robots.txt` в выходную директорию, поскольку они не упоминаются нигде в коде приложения.

```
├── assets
├── src
└── public
    └── robots.txt
```

Обратите внимание, что эта папка `/public` *объединяется* с выходом, позволяя вам вручную вставлять файлы в выходную директорию `/public/assets`.

## Связанные примеры

- [Custom Assets](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/custom_assets.rs) — Загрузка изображений и файлов из файловой системы
- [Dynamic Assets](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/dynamic_assets.rs) — Переключение ресурсов во время выполнения
- [Fonts](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/fonts.rs) — Загрузка пользовательских шрифтов
- [Stylesheet](https://github.com/DioxusLabs/dioxus/tree/main/examples/03-assets-styling/stylesheet.rs) — Загрузка CSS-файлов
