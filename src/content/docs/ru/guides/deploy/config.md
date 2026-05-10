---
title: Конфигурация пакета
---

### Конфигурация упаковки

Раздел `[bundle]` нашего Dioxus.toml может принимать множество опций.

Вот опции в виде структур Rust.

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub(crate) struct BundleConfig {
    /// например, com.dioxuslabs
    pub(crate) identifier: Option<String>,
    /// например, DioxusLabs
    pub(crate) publisher: Option<String>,
    /// например, assets/icon.png
    pub(crate) icon: Option<Vec<String>>,
    /// например, дополнительные ресурсы, такие как "img.png"
    pub(crate) resources: Option<Vec<String>>,
    /// например, DioxusLabs
    pub(crate) copyright: Option<String>,
    /// например, "Social Media"
    pub(crate) category: Option<String>,
    /// например, "A great social media app"
    pub(crate) short_description: Option<String>,
    /// например, "A social media app that makes people love app development"
    pub(crate) long_description: Option<String>,
    /// например, дополнительные бинарники (например, инструменты) для включения в финальное приложение
    pub(crate) external_bin: Option<Vec<String>>,
    // Дополнительные настройки только для Debian (см. ниже)
    pub(crate) deb: Option<DebianSettings>,
    // Дополнительные настройки для macOS (см. ниже)
    pub(crate) macos: Option<MacOsSettings>,
    // Дополнительные настройки для Windows (см. ниже)
    pub(crate) windows: Option<WindowsSettings>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub(crate) struct DebianSettings {
    // Операционно-системные настройки:
    /// список зависимостей Debian.
    pub depends: Option<Vec<String>>,
    /// список зависимостей, которые предоставляет пакет.
    pub provides: Option<Vec<String>>,
    /// список конфликтов пакетов.
    pub conflicts: Option<Vec<String>>,
    /// список замен пакетов.
    pub replaces: Option<Vec<String>>,
    /// Список пользовательских файлов для добавления в deb-пакет.
    /// Сопоставляет путь в deb-пакете с путём файла для включения (относительно текущей рабочей директории).
    pub files: HashMap<PathBuf, PathBuf>,
    /// Путь к пользовательскому шаблону desktop-файла Handlebars.
    ///
    /// Доступные переменные: `categories`, `comment` (необязательно), `exec`, `icon` и `name`.
    pub desktop_template: Option<PathBuf>,
    /// Определить секцию в файле Debian Control. См.: <https://www.debian.org/doc/debian-policy/ch-archive.html#s-subsections>
    pub section: Option<String>,
    /// Изменить приоритет пакета Debian. По умолчанию установлено `optional`.
    /// Признанные приоритеты на данный момент: `required`, `important`, `standard`, `optional`, `extra`
    pub priority: Option<String>,
    /// Путь к несжатому файлу Changelog, который будет храниться по адресу /usr/share/doc/package-name/changelog.gz. См.
    /// <https://www.debian.org/doc/debian-policy/ch-docs.html#changelog-files-and-release-notes>
    pub changelog: Option<PathBuf>,
    /// Путь к скрипту, который будет выполнен перед распаковкой пакета. См.
    /// <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>
    pub pre_install_script: Option<PathBuf>,
    /// Путь к скрипту, который будет выполнен после распаковки пакета. См.
    /// <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>
    pub post_install_script: Option<PathBuf>,
    /// Путь к скрипту, который будет выполнен перед удалением пакета. См.
    /// <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>
    pub pre_remove_script: Option<PathBuf>,
    /// Путь к скрипту, который будет выполнен после удаления пакета. См.
    /// <https://www.debian.org/doc/debian-policy/ch-maintainerscripts.html>
    pub post_remove_script: Option<PathBuf>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub(crate) struct WixSettings {
    pub(crate) language: Vec<(String, Option<PathBuf>)>,
    pub(crate) template: Option<PathBuf>,
    pub(crate) fragment_paths: Vec<PathBuf>,
    pub(crate) component_group_refs: Vec<String>,
    pub(crate) component_refs: Vec<String>,
    pub(crate) feature_group_refs: Vec<String>,
    pub(crate) feature_refs: Vec<String>,
    pub(crate) merge_refs: Vec<String>,
    pub(crate) skip_webview_install: bool,
    pub(crate) license: Option<PathBuf>,
    pub(crate) enable_elevated_update_task: bool,
    pub(crate) banner_path: Option<PathBuf>,
    pub(crate) dialog_image_path: Option<PathBuf>,
    pub(crate) fips_compliant: bool,
    /// Версия установщика MSI в формате `major.minor.patch.build` (build необязателен).
    ///
    /// Поскольку для установщика MSI требуется действительная версия, она будет получена из [`PackageSettings::version`], если это поле не задано.
    ///
    /// Первое поле — основная версия и имеет максимальное значение 255. Второе поле — дополнительная версия и имеет максимальное значение 255.
    /// Третье и четвёртое поля имеют максимальное значение 65 535.
    ///
    /// См. <https://learn.microsoft.com/en-us/windows/win32/msi/productversion> для получения дополнительной информации.
    pub version: Option<String>,
    /// GUID кода обновления для установщика MSI. Этот код **_должен оставаться неизменным во всех ваших обновлениях_**,
    /// в противном случае Windows будет рассматривать ваше обновление как другое приложение, и у ваших пользователей будет дублирующиеся версии вашего приложения.
    ///
    /// По умолчанию tauri генерирует этот код, создавая Uuid v5 с использованием строки `<productName>.exe.app.x64` в пространстве имён DNS.
    /// Вы можете использовать CLI Tauri для генерации и вывода этого кода, запустив `tauri inspect wix-upgrade-code`.
    ///
    /// Рекомендуется задать это значение в файле конфигурации tauri, чтобы избежать случайных изменений в коде обновления
    /// при изменении имени продукта.
    pub upgrade_code: Option<uuid::Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub(crate) struct MacOsSettings {
    pub(crate) frameworks: Option<Vec<String>>,
    pub(crate) minimum_system_version: Option<String>,
    pub(crate) license: Option<String>,
    pub(crate) exception_domain: Option<String>,
    pub(crate) signing_identity: Option<String>,
    pub(crate) provider_short_name: Option<String>,
    pub(crate) entitlements: Option<String>,
    pub(crate) info_plist_path: Option<PathBuf>,
    /// Список пользовательских файлов для добавления в пакет приложения.
    /// Сопоставляет путь в директории Contents в приложении с путём файла для включения (относительно текущей рабочей директории).
    pub files: HashMap<PathBuf, PathBuf>,
    /// Сохранить флаг hardened runtime, см. <https://developer.apple.com/documentation/security/hardened_runtime>
    ///
    /// Установка этого значения в `false` полезна при использовании ad-hoc подписи, делая её менее строгой.
    pub hardened_runtime: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct WindowsSettings {
    pub(crate) digest_algorithm: Option<String>,
    pub(crate) certificate_thumbprint: Option<String>,
    pub(crate) timestamp_url: Option<String>,
    pub(crate) tsp: bool,
    pub(crate) wix: Option<WixSettings>,
    pub(crate) icon_path: Option<PathBuf>,
    pub(crate) webview_install_mode: WebviewInstallMode,
    pub(crate) webview_fixed_runtime_path: Option<PathBuf>,
    pub(crate) allow_downgrades: bool,
    pub(crate) nsis: Option<NsisSettings>,
    /// Указать пользовательскую команду для подписи бинарников.
    /// Эта команда должна содержать `%1`, который является просто заполнителем для пути к бинарнику,
    /// который мы обнаружим и заменим перед вызовом команды.
    ///
    /// Пример:
    /// ```text
    /// sign-cli --arg1 --arg2 %1
    /// ```
    ///
    /// По умолчанию мы используем `signtool.exe`, который доступен только в Windows, поэтому
    /// если вы находитесь на другой платформе и хотите кросс-компилировать и подписывать, вам
    /// понадобится использовать другой инструмент, например `osslsigncode`.
    pub sign_command: Option<CustomSignCommandSettings>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct NsisSettings {
    pub(crate) template: Option<PathBuf>,
    pub(crate) license: Option<PathBuf>,
    pub(crate) header_image: Option<PathBuf>,
    pub(crate) sidebar_image: Option<PathBuf>,
    pub(crate) installer_icon: Option<PathBuf>,
    pub(crate) install_mode: NSISInstallerMode,
    pub(crate) languages: Option<Vec<String>>,
    pub(crate) custom_language_files: Option<HashMap<String, PathBuf>>,
    pub(crate) display_language_selector: bool,
    pub(crate) start_menu_folder: Option<String>,
    pub(crate) installer_hooks: Option<PathBuf>,
    /// Попытаться обеспечить, чтобы версия WebView2 была равна или новее этой версии,
    /// если WebView2 пользователя старше этой версии,
    /// установщик попытается инициировать обновление WebView2.
    pub minimum_webview2_version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) enum NSISInstallerMode {
    CurrentUser,
    PerMachine,
    Both,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) enum WebviewInstallMode {
    Skip,
    DownloadBootstrapper { silent: bool },
    EmbedBootstrapper { silent: bool },
    OfflineInstaller { silent: bool },
    FixedRuntime { path: PathBuf },
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomSignCommandSettings {
    /// Команда для запуска подписи бинарника.
    pub cmd: String,
    /// Аргументы, передаваемые команде.
    ///
    /// "%1" будет заменён на путь к бинарнику для подписи.
    pub args: Vec<String>,
}

#[derive(Clone, Copy, Debug)]
pub(crate) enum PackageType {
    /// "macos"
    MacOsBundle,
    /// "ios"
    IosBundle,
    /// "msi"
    WindowsMsi,
    /// "nsis"
    Nsis,
    /// "deb"
    Deb,
    /// "rpm"
    Rpm,
    /// "appimage"
    AppImage,
    /// "dmg"
    Dmg,
    /// "updater"
    Updater,
}
```

## Бандлинг иконок приложений Windows

Начиная с Dioxus 0.7.6, `dx serve` и `dx bundle` поддерживают бандлинг иконок приложений Windows. Чтобы настроить путь к иконке, установите поле `icon_path` в секции `[bundle.windows]` вашего `Dioxus.toml`:

```toml
[bundle]
icon = ["icons/32x32.png", "icons/128x128.png", "icons/icon.ico"]

[bundle.windows]
icon_path = "icons/icon.ico"
```

Иконка будет встроена в исполняемый файл и отображена в панели задач и заголовке окна.
