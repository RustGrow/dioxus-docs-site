---
title: Определение маршрутов
---

# Определение маршрутов

При создании перечисления `Routable` мы можем определять маршруты для нашего приложения с помощью атрибута `route("path")`.

## Сегменты маршрутов

Каждый маршрут состоит из сегментов. Большинство сегментов разделяются символами `/` в пути.

Существует пять основных типов сегментов:

1. [Статические сегменты](#статические-сегменты) — фиксированные строки, которые должны присутствовать в пути.
2. [Динамические сегменты](#динамические-сегменты) — типы, которые могут быть разобраны из сегмента.
3. [Универсальные сегменты](#универсальные-сегменты) — типы, которые могут быть разобраны из нескольких сегментов.
4. [Сегменты запроса](#сегменты-запроса) — типы, которые могут быть разобраны из строки запроса.
5. [Хеш-фрагменты](#хеш-сегменты) — типы, которые могут быть разобраны из хеш-фрагмента.

Маршруты сопоставляются:

- Сначала от наиболее специфичного к наименее специфичному (Статические, затем Динамические, затем Универсальные) (Сегменты запроса и хеш всегда сопоставляются)
- Затем, если несколько маршрутов соответствуют одному пути, следуется порядок, в котором они определены в перечислении.

## Статические сегменты

Фиксированные маршруты соответствуют определённому пути. Например, маршрут `#[route("/about")]` будет соответствовать пути `/about`.

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
// Routes always start with a slash
    #[route("/")]
    Home {},
// You can have multiple segments in a route
    #[route("/hello/world")]
    HelloWorld {},
}

#[component]
fn Home() -> Element {
    todo!()
}

#[component]
fn HelloWorld() -> Element {
    todo!()
}
```

## Динамические сегменты

Динамические сегменты имеют форму `:name`, где `name` — это имя поля в варианте маршрута. Если сегмент успешно разобран, то маршрут совпадает, иначе сопоставление продолжается.

Сегмент может быть любого типа, который реализует `FromStr`.

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
// segments that start with : are dynamic segments
    #[route("/post/:name")]
    BlogPost {
// You must include dynamic segments in child variants
        name: String,
    },

    #[route("/document/:id")]
    Document {
// You can use any type that implements FromStr
// If the segment can't be parsed, the route will not match
        id: usize,
    },
}

// Components must contain the same dynamic segments as their corresponding variant
#[component]
fn BlogPost(name: String) -> Element {
    todo!()
}

#[component]
fn Document(id: usize) -> Element {
    todo!()
}
```

<details>
<summary>Разбор собственных типов динамических сегментов</summary>

Любой тип, реализующий `FromStr` + `Display`, может использоваться в качестве динамического сегмента. Если разбор не удался, маршрут не совпадёт, и маршрутизатор перейдёт к следующему кандидату. Это позволяет ограничить, какие URL соответствуют маршруту — например, принимая только известные локали:

```rust
/// A locale like "en", "fr", or "es" parsed from a URL segment.
    #[derive(Clone, PartialEq, Debug)]
    struct Locale {
        language: String,
    }

    /// Display is required so the router can serialize the type back into a URL.
    impl fmt::Display for Locale {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(f, "{}", self.language)
        }
    }

    /// Any type that implements FromStr can be used as a dynamic segment.
    /// If parsing fails, the route won't match and the router moves on.
    impl FromStr for Locale {
        type Err = String;

        fn from_str(s: &str) -> Result<Self, Self::Err> {
            match s {
                "en" | "fr" | "es" | "de" | "ja" => Ok(Locale {
                    language: s.to_string(),
                }),
                other => Err(format!("Unknown locale: {other}")),
            }
        }
    }

    #[derive(Routable, Clone)]
    #[rustfmt::skip]
    enum Route {
With this route, /en/about and /fr/about will match,
// but /xyz/about will not.
        #[route("/:locale/about")]
        About { locale: Locale },
    }

    #[component]
    fn About(locale: Locale) -> Element {
        rsx! { "Viewing the about page in {locale}" }
    }
```

При таком маршруте `/en/about` и `/fr/about` будут совпадать, а `/xyz/about` — нет.

См. [`FromRouteSegment`](https://docs.rs/dioxus-router/latest/dioxus_router/routable/trait.FromRouteSegment.html) на docs.rs для полного определения трейта.

</details>

## Универсальные сегменты

Универсальные сегменты имеют форму `:..name`, где `name` — это имя поля в варианте маршрута. Если сегменты успешно разобраны, то маршрут совпадает, иначе сопоставление продолжается.

Сегмент может быть любого типа, который реализует `FromSegments`. (`Vec<String>` реализует это по умолчанию)

Универсальные сегменты должны быть _последним сегментом маршрута_ в пути (сегменты запроса не учитываются) и не могут быть включены во вложения.

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
// segments that start with :.. are catch all segments
    #[route("/blog/:..segments")]
    BlogPost {
// You must include catch all segment in child variants
        segments: Vec<String>,
    },
}

// Components must contain the same catch all segments as their corresponding variant
#[component]
fn BlogPost(segments: Vec<String>) -> Element {
    todo!()
}
```

<details>
<summary>Разбор собственных типов универсальных сегментов</summary>

По умолчанию `Vec<String>` собирает универсальные сегменты. Вы можете реализовать [`FromRouteSegments`](https://docs.rs/dioxus-router/latest/dioxus_router/routable/trait.FromRouteSegments.html) и [`ToRouteSegments`](https://docs.rs/dioxus-router/latest/dioxus_router/routable/trait.ToRouteSegments.html) напрямую, чтобы разобрать сегменты в структурированный тип и сериализовать их обратно в URL:

```rust
/// A path like /docs/en/guide/intro parsed into structured data.
    #[derive(Clone, PartialEq, Debug)]
    struct DocPath {
        locale: String,
        sections: Vec<String>,
    }

    impl fmt::Display for DocPath {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(f, "{}", self.locale)?;
            for section in &self.sections {
                write!(f, "/{section}")?;
            }
            Ok(())
        }
    }

    /// For custom catch-all types, implement both FromRouteSegments (for parsing
    /// URLs into your type) and ToRouteSegments (for serializing back to a URL).
    impl dioxus::router::routable::FromRouteSegments for DocPath {
        type Err = String;

        fn from_route_segments(segments: &[&str]) -> Result<Self, Self::Err> {
            let mut iter = segments.iter();
            let locale = iter
                .next()
                .ok_or("Missing locale segment")?
                .to_string();
            let sections = iter.map(|s| s.to_string()).collect();
            Ok(DocPath { locale, sections })
        }
    }

    impl dioxus::router::routable::ToRouteSegments for DocPath {
        fn display_route_segments(
            &self,
            f: &mut std::fmt::Formatter<'_>,
        ) -> std::fmt::Result {
            write!(f, "/{}", self.locale)?;
            for section in &self.sections {
                write!(f, "/{section}")?;
            }
            Ok(())
        }
    }

    #[derive(Routable, Clone)]
    #[rustfmt::skip]
    enum Route {
        #[route("/docs/:..path")]
        Docs { path: DocPath },
    }

    #[component]
    fn Docs(path: DocPath) -> Element {
        rsx! {
            div { "Locale: {path.locale}" }
            div { "Sections: {path.sections:?}" }
        }
    }
```

</details>

## Сегменты запроса

Сегменты запроса имеют форму `?:name&:othername`, где `name` и `othername` — имена полей в варианте маршрута.

В отличие от [динамических сегментов](#динамические-сегменты) и [универсальных сегментов](#универсальные-сегменты), разбор сегмента запроса не должен завершаться неудачей.

Сегмент может быть любого типа, который реализует `FromQueryArgument`.

Сегменты запроса должны находиться _после всех сегментов маршрута_ и не могут быть включены во вложения.

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
// segments that start with ?: are query segments
    #[route("/blog?:name&:surname")]
    BlogPost {
// You must include query segments in child variants
        name: String,
        surname: String,
    },
}

#[component]
fn BlogPost(name: String, surname: String) -> Element {
    rsx! {
        div { "This is your blogpost with a query segment:" }
        div { "Name: {name}" }
        div { "Surname: {surname}" }
    }
}
```

<details>
<summary>Разбор собственных типов параметров запроса</summary>

Отдельные параметры запроса используют трейт [`FromQueryArgument`](https://docs.rs/dioxus-router/latest/dioxus_router/routable/trait.FromQueryArgument.html), который автоматически реализуется для любого типа `FromStr + Default`. Если параметр отсутствует или не удаётся разобрать, вместо ошибки маршрута используется `Default::default()`.

Вы можете использовать свои собственные типы в качестве параметров запроса, реализовав `FromStr`, `Default` и `Display`:

```rust
/// A sort order parsed from a query parameter like ?sort=asc or ?sort=desc.
    #[derive(Clone, Default, PartialEq, Debug)]
    enum SortOrder {
        #[default]
        Asc,
        Desc,
    }

    impl fmt::Display for SortOrder {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            match self {
                SortOrder::Asc => write!(f, "asc"),
                SortOrder::Desc => write!(f, "desc"),
            }
        }
    }

    /// Any type that implements FromStr + Default can be used as a query parameter.
    / If the parameter is missing or fails to parse, Default::default() is used.
    impl FromStr for SortOrder {
        type Err = String;

        fn from_str(s: &str) -> Result<Self, Self::Err> {
            match s {
                "asc" => Ok(SortOrder::Asc),
                "desc" => Ok(SortOrder::Desc),
                other => Err(format!("Unknown sort order: {other}")),
            }
        }
    }

    #[derive(Routable, Clone)]
    #[rustfmt::skip]
    enum Route {
        #[route("/search?:query&:sort")]
        Search {
            query: String,
            sort: SortOrder,
        },
    }

    #[component]
    fn Search(query: String, sort: SortOrder) -> Element {
        rsx! {
            div { "Searching for: {query}" }
            div { "Sort order: {sort}" }
        }
    }
```

Если вам нужен полный контроль над всей строкой запроса — например, для обработки динамических ключей или пользовательской сериализации — вы можете захватить её в один тип, используя синтаксис распространения `?:..field`. Тип должен реализовывать [`From<&str>`](https://docs.rs/dioxus-router/latest/dioxus_router/routable/trait.FromQuery.html) и `Display`:

```rust
/// A custom type that parses the entire query string at once.
    /// This is useful when you need full control over query parameter handling.
    #[derive(Clone, Default, PartialEq, Debug)]
    struct SearchParams {
        query: String,
        page: usize,
        sort: String,
    }

    impl fmt::Display for SearchParams {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            write!(
                f,
                "query={}&page={}&sort={}",
                self.query, self.page, self.sort
            )
        }
    }

    /// Implementing From<&str> gives you FromQuery automatically.
    impl From<&str> for SearchParams {
        fn from(query: &str) -> Self {
            let mut params = SearchParams::default();
            for pair in query.split('&') {
                if let Some((key, value)) = pair.split_once('=') {
                    match key {
                        "query" => params.query = value.to_string(),
                        "page" => params.page = value.parse().unwrap_or(0),
                        "sort" => params.sort = value.to_string(),
                        _ => {}
                    }
                }
            }
            params
        }
    }

    #[derive(Routable, Clone)]
    #[rustfmt::skip]
    enum Route {
// Use ?:..field to capture the entire query string into a single type.
        #[route("/search?:..params")]
        Search { params: SearchParams },
    }

    #[component]
    fn Search(params: SearchParams) -> Element {
        rsx! {
            div { "Query: {params.query}" }
            div { "Page: {params.page}" }
            div { "Sort: {params.sort}" }
        }
    }
```

</details>

## Хеш-сегменты

Хеш-сегменты имеют форму `#:field`, где `field` — это поле в варианте маршрута.

Как и [сегменты запроса](#сегменты-запроса), разбор хеш-сегмента не должен завершаться неудачей.

Сегмент может быть любого типа, который реализует `FromHashFragment`.

Хеш-фрагменты должны находиться _после всех сегментов маршрута и любых сегментов запроса_ и не могут быть включены во вложения.

```rust
#[derive(Routable, Clone)]
#[rustfmt::skip]
enum Route {
// segments that start with #: are hash segments
    #[route("/blog#:name")]
    BlogPost {
// You must include hash segments in child variants
        name: String,
    },
}

#[component]
fn BlogPost(name: String) -> Element {
    rsx! {
        div { "This is your blogpost with a query segment:" }
        div { "Name: {name}" }
    }
}
```

<details>
<summary>Разбор собственных типов хеш-фрагментов</summary>

Трейт [`FromHashFragment`](https://docs.rs/dioxus-router/latest/dioxus_router/routable/trait.FromHashFragment.html) автоматически реализуется для любого типа `FromStr + Default`. Ошибки разбора возвращают `Default::default()` вместо вызова ошибки маршрута.

Вы можете использовать пользовательский тип для разбора структурированных данных из хеш-фрагмента:

```rust
/// A section anchor parsed from a hash fragment like #section-intro.
    #[derive(Clone, Default, PartialEq, Debug)]
    struct SectionAnchor {
        section: String,
        subsection: String,
    }

    impl std::fmt::Display for SectionAnchor {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "{}-{}", self.section, self.subsection)
        }
    }

    /// Any type that implements FromStr + Default gets FromHashFragment
    / automatically. Parsing failures return Default::default().
    impl FromStr for SectionAnchor {
        type Err = String;

        fn from_str(s: &str) -> Result<Self, Self::Err> {
            match s.split_once('-') {
                Some((section, sub)) => Ok(SectionAnchor {
                    section: section.to_string(),
                    subsection: sub.to_string(),
                }),
                None => Ok(SectionAnchor {
                    section: s.to_string(),
                    subsection: String::new(),
                }),
            }
        }
    }

    #[derive(Routable, Clone)]
    #[rustfmt::skip]
    enum Route {
        #[route("/page#:anchor")]
        Page { anchor: SectionAnchor },
    }

    #[component]
    fn Page(anchor: SectionAnchor) -> Element {
        rsx! {
            div { "Section: {anchor.section}" }
            div { "Subsection: {anchor.subsection}" }
        }
    }
```

</details>

## Вложенные маршруты

При разработке более крупных приложений нам часто хочется вкладывать маршруты друг в друга. Например, мы можем захотеть организовать меню настроек, используя следующую структуру:

```plain
└ Settings
  ├ General Settings (отображается при открытии настроек)
  ├ Change Password
  └ Privacy Settings
```

Мы можем захотеть сопоставить эту структуру с этими путями и компонентами:

```plain
/settings          -> Settings { GeneralSettings }
/settings/password -> Settings { PWSettings }
/settings/privacy  -> Settings { PrivacySettings }
```

Вложенные маршруты позволяют нам делать это без повторения `/settings` в каждом маршруте.

### Вложение

Для вложения маршрутов мы используем атрибуты `#[nest("path")]` и `#[end_nest]`.

Путь во вложении не должен:

1. Содержать [универсальный сегмент](routes.md#универсальные-сегменты)
2. Содержать [сегмент запроса](routes.md#сегменты-запроса)

Если вы определяете динамический сегмент во вложении, он будет доступен всем дочерним маршрутам и макетам.

Чтобы завершить вложение, мы используем атрибут `#[end_nest]` или конец перечисления.

```rust
#[derive(Routable, Clone)]
// Skipping formatting allows you to indent nests
#[rustfmt::skip]
enum Route {
// Start the /blog nest
    #[nest("/blog")]
// You can nest as many times as you want
        #[nest("/:id")]
            #[route("/post")]
            PostId {
// You must include parent dynamic segments in child variants
                id: usize,
            },
// End nests manually with #[end_nest]
        #[end_nest]
        #[route("/:id")]
// The absolute route of BlogPost is /blog/:name
        BlogPost {
            id: usize,
        },
// Or nests are ended automatically at the end of the enum
}

#[component]
fn BlogPost(id: usize) -> Element {
    todo!()
}

#[component]
fn PostId(id: usize) -> Element {
    todo!()
}
```
