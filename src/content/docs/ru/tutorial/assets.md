---
title: Стили и ассеты
---

# Стили и ассеты

## Dioxus использует CSS для стилизации

Как упоминалось ранее, приложения Dioxus используют HTML и CSS как основные технологии разметки и стилизации. Вместо того чтобы изобретать колесо заново, как Flutter и React-Native, мы разработали Dioxus для использования HTML и CSS.

CSS — безусловно, самая популярная система стилизации и чрезвычайно функциональна. Например, вот скриншот [ebou](https://github.com/terhechte/Ebou), очень красивого клиента Mastodon, созданного с помощью Dioxus.

![Ebou](/assets/06_docs/ebou-following.png)

## Добавление CSS-файла с помощью asset!()

Шаблон bare-bones уже включает базовый `main.css` в папке `assets`.

```sh
├── Cargo.toml
├── assets
│   └── main.css
└── src
    └── main.rs
```

Чтобы включить CSS в наше приложение, мы можем использовать макрос `asset!()`. Этот макрос гарантирует, что ассет будет включен в финальный бандл приложения.

```rust
static CSS: Asset = asset!("/assets/main.css");
```

Нам также нужно загрузить ассет в наше приложение с помощью компонента `document::Stylesheet`. Этот компонент эквивалентен HTML-элементу `<link>`, но также гарантирует, что CSS будет предварительно загружен во время серверного рендеринга.

```rust
fn App() -> Element {
    rsx! {
        document::Stylesheet { href: CSS }
    }
}
```

В отличие от макроса Rust `include_str!()`, макрос `asset!()` на самом деле не включает *содержимое* ассета в наш финальный исполняемый файл. Вместо этого он генерирует уникальный путь, чтобы ассет мог быть загружен во время выполнения. Это идеально подходит для веб-приложений, где ассеты загружаются параллельно через разные HTTP-запросы.

> 📣 Макрос `asset!()` генерирует уникальное имя, которое не будет точно соответствовать входному имени. Это помогает предотвратить конфликты имен и улучшает кэширование.

## Горячая перезагрузка

Все ассеты в Dioxus участвуют в горячей перезагрузке. Попробуйте отредактировать `main.css` вашего приложения и наблюдайте, как изменения распространяются в реальном времени.

<video src="/assets/06_docs/dog-asset-hotreload.mp4" controls></video>

## Включение изображений

В Dioxus вы можете включать изображения двумя способами:

- Динамически с помощью URL
- Статически с помощью макроса `asset!()`.

При включении ассетов с помощью URL просто заполните атрибут `src` элемента `img {}`. Обратите внимание, что когда приложение находится в офлайн-режиме, изображения на основе URL не будут загружаться.

```rust
rsx! {
    // ...
    div {
        img { src: "https://images.dog.ceo/breeds/pitbull/dog-3981540_1280.jpg" }
    }
}
```

Для статических изображений вы можете использовать тот же макрос `asset!()`, который мы использовали для включения CSS приложения.

```rust
static ICON: Asset = asset!("/assets/icon.png");

rsx! {
    img { src: ICON }
}
```

## Оптимизации

По умолчанию макрос `asset!()` слегка оптимизирует CSS, JavaScript, JSON и изображения. Имя ассета также будет изменено, чтобы включить хеш содержимого.

```rust
// выведет main-j1238nask123.css
asset!("/assets/main.css").to_string();
```

Вы можете оптимизировать ассеты ещё дальше с помощью опциональной структуры `Options`. Например, `dx` может автоматически конвертировать изображения `.png` в более оптимизированный формат `.avif`:

```rust
// выводит icon-j1238jd2.avif
asset!("/assets/icon.png", AssetOptions::image().with_avif());
```
Для многих приложений оптимизация ассетов — самый эффективный способ улучшить время загрузки. Как разработчики, мы часто упускаем размер изображений и случайно замедляем загрузку наших сайтов.

Ознакомьтесь с [руководством по ассетам](../essentials/ui/assets.md) для более подробного объяснения работы системы ассетов Dioxus.

## Финальный CSS

Мы можем использовать систему горячей перезагрузки ассетов `dx` и наши знания CSS, чтобы создать красивое приложение:

![Styled Dog App](/assets/06_docs/dog_app_styled.png)

Финальный CSS приведён здесь для справки:

```css
/* App-wide styling */
html, body {
    background-color: #0e0e0e;
    color: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    height: 100%;
    width: 100%;
    overflow: hidden;
    margin: 0;
}

#main {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
}

#dogview {
    max-height: 80vh;
    flex-grow: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

#dogview img {
    display: block;
    max-width: 50%;
    max-height: 50%;
    transform: scale(1.8);
    border-radius: 5px;
    border: 1px solid rgb(233, 233, 233);
    box-shadow: 0px 0px 5px 1px rgb(216, 216, 216, 0.5);
}

#title {
    text-align: center;
    padding-top: 10px;
    border-bottom: 1px solid #a8a8a8;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
}

#title a {
    text-decoration: none;
    color: white;
}

a#heart {
    background-color: white;
    color: red;
    padding: 5px;
    border-radius: 5px;
}

#title span {
    width: 20px;
}

#title h1 {
    margin: 0.25em;
    font-style: italic;
}

#buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    /* padding-top: 20px; */
    padding-bottom: 20px;
}

#skip { background-color: gray }
#save { background-color: green; }

#skip, #save {
    padding: 5px 30px 5px 30px;
    border-radius: 3px;
    font-size: 2rem;
    font-weight: bold;
    color: rgb(230, 230, 230)
}

#navbar {
    border: 1px solid rgb(233, 233, 233);
    border-width: 1px 0px 0px 0px;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    padding: 20px;
    gap: 20px;
}

#navbar a {
    background-color: #a8a8a8;
    border-radius: 5px;
    border: 1px solid black;
    text-decoration: none;
    color: black;
    padding: 10px 30px 10px 30px;
}

#favorites {
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 10px;
}

#favorites-container {
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    padding: 10px;
}

.favorite-dog {
    max-height: 180px;
    max-width: 60%;
    position: relative;
}

.favorite-dog img {
    max-height: 150px;
    border-radius: 5px;
    margin: 5px;
}

.favorite-dog:hover button {
    display: block;
}

.favorite-dog button {
    display: none;
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 10;
}
```
