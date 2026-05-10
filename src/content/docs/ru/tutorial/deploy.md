---
title: Развертывание
---

# Развертывание

Мы *наконец* готовы развернуть наши собранные приложения в мир. Поздравляем с тем, что вы дошли так далеко!

Этот шаг является опциональным для туториала, но стоит рассмотреть, чтобы понять процесс. Не стесняйтесь пропустить вперед к [следующим шагам](next-steps.md), если вас не интересует развертывание.

## Dioxus Deploy

Как упоминалось во [введении](../index.md#whos-funding-dioxus), Dioxus — это независимый проект со стремлением финансировать себя через платную платформу деплоя. Надеемся, однажды достаточно людей будут запускать приложения с помощью [Dioxus Deploy](https://dioxuslabs.com/deploy), чтобы финансировать разработку самого Dioxus!

В настоящее время Dioxus не предоставляет собственную платформу деплоя. Если вы хотите записаться на бета-версию и помочь нам спроектировать идеальный "end-to-end опыт разработки приложений", пожалуйста, [присоединяйтесь к списку ожидания!](https://forms.gle/zeBZmrjSkajqg7hUA)

![Deploy](/assets/06_docs/deploy_screenshot.png)

## Развертывание десктопных и мобильных приложений

Как правило, развертывание десктопного приложения так же просто, как распространение бандла напрямую. Просто загрузите бандлы вашего приложения на хост вроде GitHub или S3. Со ссылкой для скачивания ваши пользователи смогут легко скачать и установить ваши приложения.

> 📣 При отправке фулстек-приложений в продакшен вы захотите убедиться, что правильно установили URL вашего бэкенд API, как [описано позже](#fullstack-desktop-and-mobile).

Если вы хотите распространять свое приложение через магазины приложений, вам нужно будет выполнить несколько дополнительных шагов.

- [iOS](https://developer.apple.com/ios/submit/): Прямая публикация в Apple App Store
- [macOS](https://developer.apple.com/macos/submit/): Прямая публикация в Apple App Store
- [Android](https://developer.android.com/studio/publish): Прямая публикация в Google Play Store

Tauri предоставляет несколько [полезных руководств](https://tauri.app/distribute/) для развертывания Tauri-приложений, которые, хотя и не являются приложениями Dioxus, должны следовать многим из тех же шагов для развертывания в магазины приложений.

Упрощение распространения нативных приложений является главным приоритетом для Dioxus Deploy!

## Требования к развертыванию

Веб-приложения Dioxus структурированы как клиентский бандл и серверный исполняемый файл. Как правило, любой провайдер деплоя, который предоставляет простой контейнер, будет достаточен для фулстек веб-приложения Dioxus.

Некоторые провайдеры вроде [Cloudflare Workers](http://workers.cloudflare.com) и [Fermyon Spin](https://www.fermyon.com/spin) предоставляют WASM-контейнеры для приложений. WASM-рантаймы обычно дешевле в эксплуатации и могут горизонтально масштабироваться лучше, чем традиционные контейнеры на основе виртуальных машин. При развертывании на WASM-рантаймах вам нужно будет создать WASM-сборку вашего сервера вручную.

Запуск веб-сервера так же прост, как выполнение `./server`. Убедитесь, что правильно установлены переменные окружения IP и PORT:

![Serving a Server](/assets/06_docs/serving_server.png)

## Выбор провайдера деплоя

Есть *множество* провайдеров деплоя! Мы не будем слишком углубляться в плюсы/минусы какого-либо конкретного провайдера. Как правило, провайдеры хороши в одной из нескольких категорий: цена, производительность, UI/UX, продвинутые функции и enterprise-требования.

В зависимости от вашего приложения у вас могут быть строгие требования, такие как SOC2 или HIPAA compliance. Обязательно проведите собственное исследование для вашего конкретного use-case.

- [AWS](http://aws.amazon.com): Полнофункциональный облачный провайдер от Amazon.
- [GCP](https://cloud.google.com): Полнофункциональный облачный провайдер от Google.
- [Azure](http://azure.microsoft.com): Полнофункциональный облачный провайдер от Microsoft.
- [Fly.io](http://fly.io): Простое scale-to-zero micro-vm облако с интегрированным wireguard.
- [Vercel](https://vercel.com): Облако, ориентированное на разработчиков, построенное на AWS cloud functions, популярное с JavaScript-фреймворками.
- [Render](http://render.com): "Современный Heroku", ориентированный на опыт разработчика и простоту.
- [Digital Ocean](https://www.digitalocean.com): Облако, построенное вокруг виртуальных машин, баз данных и хранилища.

Для *HotDog* мы собираемся развернуть на [Fly.io](http://fly.io). Нам нравится [Fly.io](http://fly.io) по ряду причин. Самое главное, Fly построен на проекте Amazon [Firecracker](https://firecracker-microvm.github.io), который полностью написан на Rust!

Fly также довольно прост в начале работы — просто войдите с помощью вашего GitHub-аккаунта или Google-аккаунта.

## Создание Dockerfile

Некоторые провайдеры деплоя имеют готовые решения для различных рантаймов. Например, у некоторых есть выделенные рантаймы NodeJS и Python со строгими требованиями.

Для Rust-приложений обычно нет готового "пака" для таргетирования. В этих случаях нам нужно написать простой Dockerfile, который компилирует и запускает наши приложения.

Наш Dockerfile будет иметь три фазы. Первая фаза скачивает и кэширует зависимости, чтобы инкрементальные сборки оставались быстрыми:

```dockerfile
FROM rust:1 AS chef
RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json
```

Во второй фазе мы используем cargo chef для загрузки кэшированных зависимостей и выполнения сборки:

```dockerfile
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .

# Установка `dx`
RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash
RUN cargo binstall dioxus-cli --root /.cargo -y --force
ENV PATH="/.cargo/bin:$PATH"

# Создание финальной папки бандла. Бандлинг с профилем release для включения оптимизаций.
RUN dx bundle --web --release
```

Наконец, мы копируем собранную папку "web" в "slim" рантайм, который обслуживает наше приложение.

```dockerfile
FROM chef AS runtime
COPY --from=builder /app/target/dx/hot_dog/release/web/ /usr/local/app

# устанавливаем наш порт и убеждаемся, что слушаем все подключения
ENV PORT=8080
ENV IP=0.0.0.0

# экспонируем порт 8080
EXPOSE 8080

WORKDIR /usr/local/app
ENTRYPOINT [ "/usr/local/app/server" ]
```

Также разумно настроить файл `.dockerignore`:

```
**/target
**/dist
LICENSES
LICENSE
temp
README.md
```

## Развертывание на Fly

Чтобы начать работу с Fly, нам нужно пройти [процесс регистрации](https://fly.io/app/sign-up) и ввести наши данные. Это не займёт много времени.

Мы добавим dockerfile из приведённого выше вместе с dockerignore. Нам нужно [установить `flyctl`](https://fly.io/docs/flyctl/install/), который также устанавливает CLI `fly`.

Давайте вызовем [`fly launch`](https://fly.io/docs/flyctl/launch/), который автоматически инициализирует наш `fly.toml`.

![Fly Launch](/assets/06_docs/fly_launch.png)

`fly launch` запустит для нас build-машину и соберёт наше приложение. Через минуту или две наше приложение должно быть полностью собрано и развёрнуто.

Если мы когда-нибудь захотим повторно развернуть наш код, мы можем запустить `fly deploy`.

<video src="/assets/06_docs/fly_deploy.mp4" controls></video>

Мы также можем добавить volume к нашему приложению для сохранения нашей Sqlite базы данных, добавив секцию `[mounts]` в наш Fly.toml:

```toml
[mounts]
  source = "hotdogdb"
  destination = "/usr/local/app/hotdogdb"
```

После завершения сборки Fly назначит нашему приложению URL, который мы сможем настроить позже. Если повезёт, наше приложение будет доступно!

![Live App](/assets/06_docs/fly-deployed.png)


## Непрерывное развертывание

Fly также поддерживает [непрерывное развертывание](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/). Когда мы пушим в наш GitHub-репозиторий, мы можем автоматически выполнять `fly deploy`. Это может служить основой для staging-сред и автоматических релизов.

Нашему приложению нужен только `.github/workflows/fly-deploy.yml`.

```yml
name: Fly Deploy
on:
  push:
    branches:
      - main
jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    concurrency: deploy-group
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Fullstack Desktop и Mobile

Теперь, когда наш бэкенд запущен, мы можем подключить API к нашим нативным приложениям. По умолчанию Dioxus не знает, где найти ваш API, поэтому вам нужно будет указать URL вручную, вызвав `server_fn::client::set_server_url`.

```rust
fn main() {
    #[cfg(not(feature = "server"))]
    server_fn::client::set_server_url("https://hot-dog.fly.dev");

    dioxus::launch(App);
}
```

Обратите внимание, что по мере изменений нашего приложения "истинный" endpoint наших серверных функций может измениться. Макрос `#[server]` генерирует API endpoint формы `/api/fetch_dogs-jkhj12`, где завершающие данные — это уникальный хеш. По мере обновления наших серверных функций хеш будет меняться.

Чтобы серверные функции поддерживали стабильный endpoint, мы можем вручную назвать их с помощью атрибута `endpoint = "xyz"`.

```rust
#[server(endpoint = "list_dogs")]
pub async fn list_dogs() -> Result<Vec<(usize, String)>, ServerFnError> {
    todo!()
}

#[server(endpoint = "remove_dog")]
pub async fn remove_dog(id: usize) -> Result<(), ServerFnError> {
    todo!()
}

#[server(endpoint = "save_dog")]
pub async fn save_dog(image: String) -> Result<(), ServerFnError> {
    todo!()
}
```

Давайте повторно развернём наше веб-приложение с помощью `fly deploy`. Это развертывание должно завершиться быстрее благодаря тому, что `cargo chef` кэширует нашу сборку.

Теперь с `dx serve --desktop` мы должны иметь возможность взаимодействовать с тем же бэкендом через веб и десктоп.

Удивительно! Наш стартап развивается неплохо.

![Full Cross Build](/assets/06_docs/full-crossplatform.png)

## Следующие шаги

Наше приложение ещё не готово, но это руководство стало довольно длинным!

Есть ещё так много всего:

- Добавление пользователей, логина и аутентификации.
- Защита нашего сайта от DDOS с помощью инструментов вроде Cloudflare.
- Добавление большего количества функций
- Маркетинг и шеринг с друзьями!
