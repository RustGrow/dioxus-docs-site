---
title: Вложенные маршруты
---

# Вложенные маршруты

При разработке более крупных приложений нам часто хочется вкладывать маршруты друг в друга. Например, мы можем захотеть организовать меню настроек, используя следующую структуру:

```plain
└ Settings
  ├ Общие настройки (отображаются при открытии настроек)
  ├ Смена пароля
  └ Настройки конфиденциальности
```

Мы можем захотеть сопоставить эту структуру с этими путями и компонентами:

```plain
/settings          -> Settings { GeneralSettings }
/settings/password -> Settings { PWSettings }
/settings/privacy  -> Settings { PrivacySettings }
```

Вложенные маршруты позволяют нам делать это без повторения `/settings` в каждом маршруте.

## Вложение

Для вложения маршрутов мы используем атрибуты `#[nest("path")]` и `#[end_nest]`.

Путь во вложении не должен:

1. Содержать [универсальный сегмент](index.md#универсальные-сегменты)
2. Содержать [сегмент запроса](index.md#сегменты-запроса)

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
