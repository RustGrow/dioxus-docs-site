---
title: Серверный рендеринг
---

# Серверный рендеринг

Dioxus Fullstack поддерживает мощную функцию, называемую «серверный рендеринг» (SSR). SSR позволяет вашим приложениям загружать данные на сервере *до* отправки HTML клиенту.

Серверный рендеринг улучшает время загрузки страницы вашего сайта и облегчает веб-краулерам, таким как Google, его индексацию. Сайты, которые легче индексировать, занимают более высокие позиции в поисковой выдаче, улучшая конверсию и, в конечном итоге, вашу прибыль.

## SSR vs CSR

Вас могут пугать различные термины, компромиссы и детали. Не волнуйтесь — эти дополнительные концепции — это просто оптимизации для улучшения производительности вашего сайта. Вы всё ещё можете создать красивый, полезный и доступный сайт без таких улучшений, как серверный рендеринг.

Термины SSR и CSR относятся к двум разным подходам к рендерингу страниц:

- **CSR**: *Клиентский рендеринг*, данные загружаются «скелетной» страницей с помощью `fetch()`
- **SSR**: *Серверный рендеринг*, данные загружаются на сервере и сериализуются в HTML

SSR даёт нам возможность отправлять пользователю более «полный» HTML-документ при посещении сайта, делая сайт сразу же пригодным для использования и улучшая его ранжирование в результатах поиска.

### CSR: архитектура «приложения»

Архитектура веб-приложений существенно изменилась за прошедшие годы. Клиентский рендеринг — это относительно «современная» архитектура, при которой сервер отвечает на запросы пользователей «скелетным» HTML.

Скелетный HTML может быть совсем простым — примерно таким:

```html

<html>
    <head>
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
        <script src="/index.js"> </script>
    </head>
    <body>
        <div id="main"></div>
    </body>
</html>
```

Обратите внимание, что при загрузке в HTML-документе *нет контента*. Как только эта простейшая страница загружается браузером, выполняется скрипт `index.js`, вызывая функцию `main` вашего приложения. Загрузка данных обычно происходит как *эффект* после первоначального выполнения `main`.

При использовании подхода CSR для загрузки страницы требуется *множество* HTTP-запросов:

- Первоначальный GET к `index.html`
- GET к `index.js`
- Несколько вызовов `GET` к бэкенд-эндпоинтам для загрузки данных

Также обратите внимание на многочисленные фазы, когда приложение *кажется* находящимся в состоянии загрузки:

- Первоначальный HTML пуст
- После выполнения `main` страница пуста, ожидая загрузки данных
- Каскадные загрузки вызывают пустоту дочерних компонентов в «водопаде»

Эта архитектура называется клиентским рендерингом, потому что **клиент** отвечает за рендеринг HTML на странице. Этот подход хорошо подходит для интерактивных приложений с небольшим количеством статического контента, таких как текстовые редакторы, поисковые инструменты или всё, что хорошо подходит в качестве «приложения». Эта архитектура является основной для десктопных и мобильных приложений.

![Диаграмма CSR](/assets/07/csr-diagram.avif)

### SSR: архитектура «сайта»

В отличие от CSR, серверный рендеринг широко используется для классических приложений типа «сайт». Веб-сайты, такие как интернет-магазины, портфолио, блоги, новостные и другие контентно-ёмкие приложения, предпочитают рендерить начальный HTML **на сервере**.

Как только начальный HTML достигает клиента, выполняется дополнительный поддерживающий JavaScript (или WebAssembly), превращая статическую страницу в интерактивную.

HTML, который доходит до клиента, обычно «полный» с контентом:

```html
<html>
    <head>
        <meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
        <title> Наш сайт | Страница XYZ </title>
        <meta name="description" content="Наш очень крутой сайт — Страница XYZ" />
        <link href="/main.css" />
        <link href="/page-xyz.css" />
        <script src="/index.js"/>
    </head>
    <body>
        <div id="main">
            <h1> Это очень крутой сайт </h1>
            <h3> Вы находитесь на странице XYZ </h3>
            <p> Наслаждайтесь контентом! </p>
        </div>
    </body>
</html>
```

Присмотритесь внимательно, чтобы сравнить два HTML-тела. HTML с SSR полон контента — в div «main» есть заголовки и параграфы, а в «head» приложения есть атрибуты, специфичные для страницы, такие как заголовок, мета-теги и стили, специфичные для страницы.

При использовании подхода SSR для загрузки страницы требуется *мало* HTTP-запросов:

- Первоначальный GET для загрузки `index.html`
- Последующие GET-запросы для загрузки ресурсов

Также обратите внимание, что страница кажется загружающейся только *один* раз:

- Пользователь ожидает загрузки `index.html`.

Поскольку первоначальный GET-запрос возвращает полную картину сайта, краулеры, такие как Google, могут легко читать содержимое вашего сайта, улучшая ваше ранжирование в результатах поиска.

![Диаграмма SSR](/assets/07/ssr-diagram.avif)

### Смешение CSR и SSR

К счастью, эти две архитектуры можно использовать *вместе* в гибридном подходе. Это бывает двух видов:

- По умолчанию SSR, добавление реактивности с помощью «островов»
- По умолчанию CSR, кэширование *некоторых* данных с сервера

Dioxus использует второй подход. Как фреймворк, мы сосредоточены на создании отличного опыта «приложений». Rust превосходен при создании сложной логики, которая обычно встречается в приложениях с интенсивным взаимодействием.

Существует *множество* фреймворков первой категории — такие проекты, как Ruby on Rails, NextJS и Elixir Phoenix, отлично справляются с отдачей преимущественно серверно-рендеримого контента. Dioxus с лёгкостью справляется с SSR, но предоставляет множество инструментов и утилит, ориентированных на клиентское взаимодействие.

## Нужен ли вам SSR?

SSR идеально подходит для сайтов и страниц, которые должны хорошо ранжироваться в поисковых системах, таких как интернет-магазины, блоги, новостные и другие статические сайты. В некоторых случаях, если ваш сайт *полностью* статичен, вы можете даже использовать генерацию статических сайтов для предварительного рендеринга каждой страницы и развёртывания напрямую на CDN.

Однако добавление SSR на ваш сайт не всегда необходимо, и его не нужно включать для каждой страницы. SSR в Dioxus является *прогрессивным*, то есть по умолчанию страницы рендерятся на клиенте, и вы можете *выбрать* рендеринг компонентов на сервере. Любые данные, не закэшированные сервером, станут клиентской загрузкой, когда страница окончательно загрузится.

## Гидратация

В Dioxus Fullstack сервер рендерит начальный HTML для улучшения времени загрузки. Эта начальная версия страницы — то, что видят большинство веб-краулеров и поисковых систем.

После рендеринга начального HTML клиент делает страницу интерактивной через процесс, называемый **гидратацией**. Обычно гидратация является чистым улучшением. Вам обычно не нужно думать о гидратации, но есть несколько вещей, о которых нужно помнить, чтобы избежать [ошибок гидратации](#ошибки-гидратации).

Чтобы лучше понять гидратацию, пройдёмся по простому примеру:

```rust
fn Weather() -> Element {
        let mut weather = use_server_future(fetch_weather)?;

        rsx! {
            div {
                "{weather:?}"
            }
            button {
                onclick: move |_| weather.restart(),
                "Refetch"
            }
        }
    }
```

## Рендеринг начального HTML

Когда сервер получает запрос на рендеринг компонента `Weather`, он рендерит страницу в HTML и сериализует некоторые дополнительные данные, необходимые клиенту для гидратации страницы. Он будет следовать этим шагам для рендеринга нашего компонента:

1. Запустить компонент
2. Дождаться, пока все серверные фьючеры (futures) разрешатся
3. Сериализовать любые недетерминированные данные (например, фьючер `weather`) для клиента
4. Отрендерить HTML

[![](https://mermaid.ink/img/pako:eNpdkDFTwzAMhf-KT3M70HbKwELhGMqSdAIziFhNfI2lnGzDQa__HZfk4Iq1-D1_ejr5BK04ggoOg3y0PWoy-61lE_Nbpzj2Jt68WGhI30lN4x2ZmtiReu4svBZwPs4rtckLm13958ZVaa4zmzsJozBxumqK6ynb4-C_yMxTHnLKSvGa3FyCfiabx_3Tbn4sxsTElVkub0vgLNeT3FieChYQSAN6V1Y9XSALqadAFqpydahHC5bPhcOcpPnkFqqkmRagkrseqgMOsag8Oky09Vh-J_y6I_KzSPhH3TufRGfz_A3Ce3PT?type=png)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNpdkDFTwzAMhf-KT3M70HbKwELhGMqSdAIziFhNfI2lnGzDQa__HZfk4Iq1-D1_ejr5BK04ggoOg3y0PWoy-61lE_Nbpzj2Jt68WGhI30lN4x2ZmtiReu4svBZwPs4rtckLm13958ZVaa4zmzsJozBxumqK6ynb4-C_yMxTHnLKSvGa3FyCfiabx_3Tbn4sxsTElVkub0vgLNeT3FieChYQSAN6V1Y9XSALqadAFqpydahHC5bPhcOcpPnkFqqkmRagkrseqgMOsag8Oky09Vh-J_y6I_KzSPhH3TufRGfz_A3Ce3PT)

Как только сервер завершит рендеринг, он отправит эту структуру клиенту как HTML:

[![](https://mermaid.ink/img/pako:eNqFUcFKAzEQ_ZUwh57agy22sAUFqaCgF1sQNCLTZLYbupss2VmLlv67s92luoo4uSRv3nvzhuzBBEuQQJqHnckwslottFdVvd5ELDNVjZ81LCk6zN0HWbVARg0vQpGyLpJhF7xaXbVIU_5MJCmxyV53hJxR7ATkbc96Irxb71i81c3q_u4_3ybKIOe5dW-DDc9P9GPzXJr7bl5yeeg3p51yXTOLa_Amd2b722QmvAdKI1XZH5mb3R57W7VVjb_dJ1_KY241Gl1IQjWQJB02bbGZ9u2BIRQUC3RWPmPfkDTIkII0JHK1GLcatD8ID2sOy3dvIOFY0xBiqDcZJCnmlbzq0iLTwqEELk5oif4phOIH69o6DrEDD5_uGqQ1?type=png)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNqFUcFKAzEQ_ZUwh57agy22sAUFqaCgF1sQNCLTZLYbupss2VmLlv67s92luoo4uSRv3nvzhuzBBEuQQJqHnckwslottFdVvd5ELDNVjZ81LCk6zN0HWbVARg0vQpGyLpJhF7xaXbVIU_5MJCmxyV53hJxR7ATkbc96Irxb71i81c3q_u4_3ybKIOe5dW-DDc9P9GPzXJr7bl5yeeg3p51yXTOLa_Amd2b722QmvAdKI1XZH5mb3R57W7VVjb_dJ1_KY241Gl1IQjWQJB02bbGZ9u2BIRQUC3RWPmPfkDTIkII0JHK1GLcatD8ID2sOy3dvIOFY0xBiqDcZJCnmlbzq0iLTwqEELk5oif4phOIH69o6DrEDD5_uGqQ1)

## Гидратация на клиенте

Когда клиент получает начальный HTML, он гидратирует HTML, повторно запуская каждый компонент. По мере повторного запуска каждого компонента Dioxus загружает кэшированные данные с сервера, правильно связывая HTML с каждым интерактивным узлом DOM.

Повторный запуск каждого компонента позволяет клиенту реконструировать некоторое несериализуемое состояние, такое как обработчики событий, и запустить любую клиентскую логику, такую как `use_effect` и `use_future`.

Гидратация следует этим шагам:

1. Десериализовать любые данные с сервера (например, фьючер `weather`)
2. Запустить компонент с десериализованными данными.
3. Гидратировать HTML, отправленный с сервера, добавляя слушателей событий и запуская эффекты.

[![](https://mermaid.ink/img/pako:eNpdkLFuAjEMhl_F8gxDgemGLlyrDnThmNp0SC-Gi7g4JydpRRHvXsOdkFpnif__s534jG10hBXu-_jddlYy7GrDkMrnQezQQXp4N7juPXGGxjuCl5MT63Nkgx8Kajgv1GYfGTbbUblGWmphTYnE297_EDQkXyTwXHIRSvfqG7tQdlsY1jEMkXXWX3ul9m1u1vm7183kErsRSkuYzx-1zZQuxnRleDw4w0ASrHf60_MVMpg7CmSw0quzcjRo-KKcLTk2J26xylJohhLLocNqb_ukWRmcvqH2VpcT7upg-S3G8I96crolmcTLL4RBdIg?type=png)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNpdkLFuAjEMhl_F8gxDgemGLlyrDnThmNp0SC-Gi7g4JydpRRHvXsOdkFpnif__s534jG10hBXu-_jddlYy7GrDkMrnQezQQXp4N7juPXGGxjuCl5MT63Nkgx8Kajgv1GYfGTbbUblGWmphTYnE297_EDQkXyTwXHIRSvfqG7tQdlsY1jEMkXXWX3ul9m1u1vm7183kErsRSkuYzx-1zZQuxnRleDw4w0ASrHf60_MVMpg7CmSw0quzcjRo-KKcLTk2J26xylJohhLLocNqb_ukWRmcvqH2VpcT7upg-S3G8I96crolmcTLL4RBdIg)

## Ошибки гидратации

Для работы гидратации **компонент должен рендерить точно то же самое на клиенте и на сервере**. Если это не так, вы можете увидеть ошибку такого вида:

```
Uncaught TypeError: Cannot set properties of undefined (setting 'textContent')
at RawInterpreter.run (yourwasm-hash.js:1:12246)
```

Или такую:

```
Error deserializing data:
Semantic(None, "invalid type: floating point `1.2`, expected integer")
This type was serialized on the server at src/main.rs:11:5 with the type name f64. The client failed to deserialize the type i32 at /path/to/server_future.rs
```

### Недетерминированные данные

Большая часть логики в ваших компонентах «детерминирована» — то есть при одинаковых входных данных в компонент он будет рендерить одинаковый вывод. Очень важно, чтобы входные данные вашего компонента оставались стабильными между клиентом и сервером.

Некоторые входные данные «недетерминированы». Например, приложение вроде Instagram имеет «ленту» контента. Вызов `GET /api/feed` может возвращать разные результаты каждый раз. Этот тип данных должен быть сериализован *в HTML*, а затем *десериализован на клиенте*, чтобы обеспечить использование точно таких же данных во время гидратации.

### Недетерминированные данные с серверным кэшированием

Вы должны помещать любые недетерминированные данные в `use_server_future`, `use_server_cached` или `use_effect`, чтобы избежать ошибок гидратации. Например, если вам нужно отрендерить случайное число на вашей странице, вы можете использовать `use_server_cached`, чтобы закэшировать случайное число на сервере, а затем использовать его на клиенте:

```rust
❌ The random number will be different on the client and the server
        let random: u8 = use_hook(|| rand::random());
✅ The same random number will be serialized on the server and deserialized on the client
        let random: u8 = use_server_cached(|| rand::random());
```

### Асинхронная загрузка с серверными фьючерами

Если вам нужно отрендерить некоторые данные из серверного фьючера, вам нужно использовать `use_server_future` для сериализации данных вместо ожидания (недетерминированного) времени, которое занимает `use_resource(...).suspend()?`:

```rust
❌ The server function result may be finished on the server, but pending on the client
        let random: u8 = use_resource(|| random_server_function()).suspend()?().unwrap_or_default();
✅ Once the server function is resolved on the server, it will be sent to the client
        let random: u8 = use_server_future(|| random_server_function())?()
            .unwrap()
            .unwrap_or_default();
```

### Асинхронная загрузка с `use_loader`

Новинка Dioxus 0.7 — хук `use_loader` — хук, предназначенный для изоморфной загрузки данных, который отлично работает как в архитектурах CSR, так и SSR.

Хук `use_loader` очень похож на `use_server_future`, но с немного другим API. В отличие от `use_server_future`, хук `use_loader` не будет повторно приостанавливать (re-suspend) страницу, когда базовый фьючер перезапускается. Также, в отличие от `use_server_future`, хук `use_loader` будет повторно выбрасывать любые ошибки загрузки в ближайшую границу ожидания (suspense boundary):

```rust
fn app() -> Element {
    // Получаем список пород из Dog API, используя синтаксис `?` для приостановки или выброса ошибок
    let breed_list = use_loader(move || async move {
        reqwest::get("https://dog.ceo/api/breeds/list/all")
            .await?
            .json::<ListBreeds>()
            .await
    })?;

    rsx! {
        for cur_breed in breed_list.read().message.keys().take(20).cloned() {
            button {
                onclick: move |_| {
                    breed.call(cur_breed.clone());
                },
                "{cur_breed}"
            }
        }
    }
}
```

Хук `use_loader` принимает колбэк, который возвращает `Result<T, E>`. Если этот фьючер возвращает результат, ошибка автоматически выбрасывается. Хук `use_loader` отлично подходит при создании сайтов, которые одновременно являются высокоинтерактивными и требуют возможностей SSR.

### Данные только для клиента с помощью эффектов

Если вам нужно получить некоторые данные, которые доступны только на клиенте, убедитесь, что вы получаете их внутри хука `use_effect`, который запускается после того, как компонент был гидратирован:

```rust
❌ Using a different value client side before hydration will cause hydration issues
// because the server rendered the html with another value
        let mut storage = use_signal(|| {
            #[cfg(feature = "server")]
            return None;
            let window = web_sys::window().unwrap();
            let local_storage = window.local_storage().unwrap().unwrap();
            local_storage.set_item("count", "1").unwrap();
            local_storage.get_item("count").unwrap()
        });

✅ Changing the value inside of an effect is fine because effects run after hydration
        let mut storage = use_signal(|| None);
        use_effect(move || {
            let window = web_sys::window().unwrap();
            let local_storage = window.local_storage().unwrap().unwrap();
            local_storage.set_item("count", "1").unwrap();
            storage.set(local_storage.get_item("count").unwrap());
        });
```

### Избегайте побочных эффектов в хуках серверного кэширования

Специфичные для Dioxus Fullstack хуки `use_server_cached` и `use_server_future` работают по-разному на сервере и на клиенте. Сервер всегда будет запускать замыкание, но клиент может не запустить замыкание, если сервер сериализовал результат. Поэтому код, который вы запускаете внутри этих хуков, **не может иметь побочных эффектов**. Если это так, побочные эффекты не будут сериализованы, и это может вызвать ошибку несоответствия гидратации:

```rust
❌ The state of the signal cannot be serialized on the server
        let mut storage = use_signal(|| None);
        use_server_future(move || async move {
            storage.set(Some(server_future().await));
        })?;

✅ The value returned from use_server_future will be serialized on the server and hydrated on the client
        let storage = use_server_future(|| async move { server_future().await })?;
```
