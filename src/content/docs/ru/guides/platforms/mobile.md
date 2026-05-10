---
title: Мобильные устройства
---

# Мобильное приложение

Создавайте мобильные приложения с Dioxus!

## Поддержка

Экосистема Rust для мобильных устройств продолжает развиваться, и Dioxus предлагает сильную поддержку мобильных приложений. Мобильные устройства — это цель первого класса для приложений Dioxus, с надёжной реализацией WebView, поддерживающей CSS-анимации и эффекты прозрачности.

Мобильные приложения рендерятся либо с помощью платформенного WebView, либо экспериментально с WGPU. В то время как нативные Android-анимации и виджеты в настоящее время не поддерживаются, CSS-анимации и стилизация предоставляют мощную альтернативу.

Поддержка мобильных устройств хорошо подходит для большинства типов приложений — от бизнес-инструментов до потребительских приложений, что делает её отличным выбором для команд, стремящихся создавать кроссплатформенные приложения с единой кодовой базой.

## Подготовка к работе

## Android

Устройства Android используют другую архитектуру исполняемых файлов, чем десктоп и веб. Нам нужно установить эти тулчейны для сборки приложений Dioxus для Android.

Сначала установите целевые платформы Rust для Android:

```sh
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

Для разработки под Android вам необходимо [установить Android Studio](https://developer.android.com/studio).

После установки Android Studio вам нужно установить Android SDK и NDK:

1. Создайте пустой Android-проект
2. Выберите `Tools > SDK manager`
3. Перейдите в окно `SDK tools`:

![Окно установки NDK](/assets/static/android_ndk_install.png)

Затем выберите:
- SDK
- SDK Command line tools
- NDK (side by side)
- CMAKE

4. Нажмите `apply` и следуйте инструкциям

> Более подробная информация, которая может быть полезна для отладки ошибок, доступна [в официальной документации Android](https://developer.android.com/studio/intro/update#sdk-manager)

Далее установите переменные Java, Android, NDK и PATH:

Mac:
```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/25.2.9519653"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
```

Windows:
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LocalAppData\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("NDK_HOME", "$env:LocalAppData\Android\Sdk\ndk\25.2.9519653", "User")
```

> Версия NDK в путях должна соответствовать версии, которую вы установили на предыдущем шаге

Мы вручную устанавливаем переменную PATH, чтобы включить Android-эмулятор, поскольку некоторые дистрибутивы Android Studio включают эмулятор в неправильное место.

## iOS

Для разработки под iOS вам необходимо [установить XCode](https://apps.apple.com/us/app/xcode/id497799835). Также убедитесь, что установлены целевые платформы iOS

```sh
rustup target add aarch64-apple-ios aarch64-apple-ios-sim
```

> Если вы используете M1, вам придётся запускать `cargo build --target x86_64-apple-ios` вместо `cargo apple build`, если вы хотите запускать в симуляторе.

Вам также необходимо установить iOS SDK и инструменты командной строки Xcode.

## Запуск приложения

Начиная с Dioxus 0.6, `dx` поставляется со встроенной поддержкой мобильных устройств.

Просто создайте новый проект Dioxus:

```sh
dx new my-app
```

Убедитесь, что запущен соответствующий мобильный симулятор. Для Android вы можете использовать эмулятор Android Studio или Android Emulator в терминале. Убедитесь, что вы скорректировали имя устройства в зависимости от установленного эмулятора.

```sh
emulator -avd Pixel_6_API_34  -netdelay none -netspeed full
```

Для iOS вы можете использовать iOS-симулятор. Вы можете запустить его с помощью:

```sh
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
xcrun simctl boot "iPhone 15 Pro Max"
```

А затем запустите приложение с помощью:

```sh
cd my-app
dx serve
```

Это запустит приложение в режиме разработки.

## Кастомизация мобильных сборок

Начиная с Dioxus 0.7.4, можно кастомизировать все аспекты сборок iOS и Android через `Dioxus.toml`. Схема CLI включает поля для:

- **Android**: версия SDK, путь к NDK, конфигурация подписи, разрешения и кастомизация манифеста
- **iOS**: bundle identifier, team ID, конфигурация подписи, таргетинг устройств и поддержка LaunchScreen storyboard

Полный список доступных полей см. в [схеме CLI](https://github.com/DioxusLabs/dioxus/blob/main/packages/cli/schema.json).

## FFI для мобильных устройств

Начиная с Dioxus 0.7.4, Dioxus включает новый FFI-интерфейс для **Kotlin**, **Java** и **Swift**. Это позволяет вызывать нативные платформенные API прямо из вашего Rust-кода. Система FFI автоматически бандлит соответствующие исходные файлы в ваши мобильные сборки.

Чтобы использовать FFI-интерфейс, поместите платформенно-специфичный код в соответствующие директории и укажите их в `Dioxus.toml`:

```toml
[android.ffi]
source = "src/android"

[ios.ffi]
source = "src/ios"
```

Поддержка FFI для TypeScript/JavaScript запланирована на будущий релиз.
