---
title: Changelog
---

# Changelog

This page contains release notes for Dioxus patch releases. For migration guides between major versions, see the [Migration Guides](../migration/index.md).

## Dioxus 0.7

### v0.7.7

- **JS Module Auto-detection**: Fixed a regression where DX would always bundle JS snippets as ESM, even when they were CJS, UMD, or generic JS snippets. DX now properly detects the JS module type and runs esbuild with the appropriate flags.

### v0.7.6

- **Final release of 0.7**: The repository will now ship breaking changes in preparation for 0.8.
- **Shell Completions**: Added `dx completions` command to generate shell completions for bash, zsh, fish, and PowerShell.
- **Faster Hotpatching**: Significantly faster dev server starts when using `dx serve --hotpatch`.
- **Panic Recovery**: Dioxus web apps that panic while handling events will no longer brick the webpage.
- **New Examples**: Added 20+ new code examples to the repository.
- **Windows App Icon Bundling**: `dx serve` and `dx bundle` now support bundling Windows app icons.

### v0.7.5

- **Dependency Version Fix**: Fixed a critical issue where Dioxus wouldn't compile if `Cargo.lock` specified too-old versions of dependencies like `futures-unordered`. The `dioxus` crate itself was not updated — only its dependencies.
- **Hotpatching Fixes**: Fixed bugs related to hotpatching, autoformatting, and bundling.

### v0.7.4

- **Mobile Build Customization**: You can now customize all aspects of iOS and Android builds via `Dioxus.toml`. See the [CLI schema](https://github.com/DioxusLabs/dioxus/blob/main/packages/cli/schema.json) for available fields.
- **FFI Interface**: Added a new FFI interface for Kotlin, Java, and Swift. Automatically bundles relevant source files into your mobile builds.

### v0.7.3

- **New Events**: Added support for `auxclick` and `scrollend` events.
- **Scoped CSS and CSS Modules**: Added built-in support for scoped CSS and CSS modules. See the [Styling guide](../essentials/ui/styling.md) for details.
- **Server-Only Extractors**: Added support for server-only extractors in server functions.

### v0.7.2

- **Drag & Drop**: Fixed serialization issues with drag and drop events.
- **Sync Stores**: Fixed a deadlock in synchronous stores.
- **Hotpatching**: Fixed WASM hotpatching and Windows hot-patch `cdylib` issues.
- **Platform Fixes**: Fixed macOS code signing, Linux window issues, Linux musl builds, and fullstack streaming missing frames.

### v0.7.1

- **Async File Dialogs**: File dialogs on desktop are now async instead of sync. This prevents the UI from freezing during file selection.
- **Query String Support**: Server functions now use `serde_qs` for query string support.
- **SSR-only Builds**: Added `--platform web2` for SSR-only builds without hydration.
- **iOS LaunchScreen**: Added support for iOS LaunchScreen storyboards.

### v0.7.0

The initial 0.7 release. See the [Migration Guide](../migration/to-07.md) for a full list of breaking changes and new features, including:

- Hot-patching with Subsecond
- Native rendering
- Bundle splitting
- Radix UI primitives
- Fullstack streaming
- New Stores API

## Dioxus 0.6

### v0.6.3

- **HTML Translation**: Fixed issues in `dx html` → RSX translation.
- **Windows Bundling**: Fixed bundling `.exe` on Windows.
- **Asset Hot-Reload**: Fixed gitignored manganis assets handling.
- **Android Hot-Reload**: Added support for Android device hot-reloading over ADB.

### v0.6.2

- **iPadOS Support**: Added iPadOS support for `dx serve`.
- **Cache Busting**: Added cache-busting for `.wasm` files.
- **Device Hot-Reload**: `dx serve` now serves on `0.0.0.0` for device hot-reload support.
- **Bundle Output Directory**: Added `out_dir` support for `dx bundle`.

### v0.6.1

- **Dynamic wasm-bindgen**: The CLI now installs the proper `wasm-bindgen` version dynamically instead of requiring a new download of `dx`.
- **Asset Hot-Reload Resilience**: Fixed an issue where asset hot-reload accidentally broke on web.

### v0.6.0

The initial 0.6 release. See the [Migration Guide](../migration/to-06.md) for a full list of breaking changes and new features.
