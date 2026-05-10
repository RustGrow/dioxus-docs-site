---
title: Формы и Multipart
---

# Формы и Multipart

Dioxus нативно поддерживает HTML-формы и Multipart-загрузки.

- HTML-формы — это коллекции элементов ввода, представленных как список пар ключ-значение
- Multipart-запросы — это запросы, содержащие несколько тел

Многие формы, которые вы будете создавать, будут довольно простыми. Их загрузка потребует только одного тела запроса. В некоторых случаях, как при загрузке файлов, вам понадобится multi-part form data.

## Формы

Dioxus Fullstack поддерживает загрузку форм через типизированный axum-тип `Form<T>`. Просто оберните структуру, реализующую `Serialize + Deserialize`, и передайте её как аргумент серверной функции:

```rust
// Наш пейлоад формы
#[derive(Deserialize, Serialize)]
pub struct LoginForm {
    username: String,
    password: String,
}

// Наш эндпоинт формы
#[post("/api/login")]
async fn login(form: Form<LoginForm>) -> Result<()> {
    // Проверяем имя пользователя и пароль.
    // В реальном приложении вы бы проверяли их по базе данных.
    if form.0.username == "admin" && form.0.password == "password" {
        ..
    }
}
```

Значения из формы можно создать вручную, сконструировав тело формы, или автоматически, вызвав `.parsed_values()` на типе `FormEvent`, созданном событием `onsubmit`.

```rust
rsx! {
    form {
        onsubmit: move |evt: FormEvent| async move {
            // Предотвращаем навигацию браузера.
            evt.prevent_default();

            // Извлекаем значения формы в нашу структуру `LoginForm`. Метод `.parsed_values`
            // предоставляется Dioxus и работает с любым элементом формы, имеющим атрибуты `name`.
            let values: LoginForm = evt.parsed_values().unwrap();

            // Вызываем эндпоинт логина
            login(Form(values)).await;
        },
        input { r#type: "text", id: "username", name: "username" }
        label { "Имя пользователя" }
        input { r#type: "password", id: "password", name: "password" }
        label { "Пароль" }
        button { "Войти" }
    }
}
```

Элементы формы должны иметь атрибут «name», который будет использоваться во время процесса десериализации для идентификации полей формы.

Обратите внимание, что запросы `GET` будут кодировать значения формы в URL запроса. Это может не работать для сложных структур данных, поэтому рекомендуется использовать эндпоинты `POST` для обработки данных форм.

## Multipart

В некоторых формах вам нужно обрабатывать несколько тел запроса в одном запросе. Например, если ваша форма имеет поля для загрузки файлов, браузер автоматически создаст multi-part запрос со значениями формы в одном теле, а загрузками файлов — в другом.

Dioxus предоставляет тип `MultipartFormData`, который автоматически преобразует объекты `FormEvent` в корректные multi-part запросы.

На клиенте вы можете преобразовать `FormEvent` с помощью `.into()`:

```
rsx! {
    form {
        display: "flex",
        flex_direction: "column",
        gap: "8px",
        onsubmit: move |evt| async move {
            evt.prevent_default();

            upload(evt.into()).await;
        },
        label { r#for: "headshot", "Фотографии" }
        input { r#type: "file", name: "headshot", multiple: true, accept: ".png,.jpg,.jpeg" }
        label { r#for: "resume", "Резюме" }
        input { r#type: "file", name: "resume", multiple: false, accept: ".pdf" }
        label { r#for: "name", "Имя" }
        input { r#type: "text", name: "name", placeholder: "Имя" }
        label { r#for: "age", "Возраст" }
        input { r#type: "number", name: "age", placeholder: "Возраст" }
        input { r#type: "submit", name: "submit", value: "Отправить ваше резюме" }
    }
}
```

На сервере вы можете использовать эндпоинт, принимающий `MultipartFormData`, а затем пройтись по полям с помощью `next_field()`:

```rust
#[post("/api/upload-multipart")]
async fn upload(mut form: MultipartFormData) -> Result<()> {
    while let Ok(Some(field)) = form.next_field().await {
        let name = field.name().unwrap_or("<none>").to_string();
        let file_name = field.file_name().unwrap_or("<none>").to_string();
        let content_type = field.content_type().unwrap_or("<none>").to_string();
        let bytes = field.bytes().await;

        ...
    }

    Ok(())
}
```

В настоящее время Dioxus не поддерживает типизированные объекты `MultipartFormData`, но это *то*, что мы хотели бы добавить в будущем.
