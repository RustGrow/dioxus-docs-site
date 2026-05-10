---
title: Тестирование веба
---

# Тестирование

При создании приложений или библиотек с Dioxus вы можете захотеть включить некоторые тесты для проверки поведения частей вашего приложения. Это руководство научит вас тестировать различные части вашего приложения Dioxus.

## Тестирование компонентов

Вы можете использовать комбинацию [pretty-assertions](https://docs.rs/pretty_assertions/latest/pretty_assertions/) и [dioxus-ssr](http://crates.io/crates/dioxus-ssr), чтобы проверить, что два фрагмента rsx равны:

```rust
use futures::FutureExt;
use std::{cell::RefCell, sync::Arc};

use dioxus::prelude::*;

#[test]
fn test() {
    assert_rsx_eq(
        rsx! {
            div { "Hello world" }
            div { "Hello world" }
        },
        rsx! {
            for _ in 0..2 {
                div { "Hello world" }
            }
        },
    )
}

fn assert_rsx_eq(first: Element, second: Element) {
    let first = dioxus_ssr::render_element(first);
    let second = dioxus_ssr::render_element(second);
    pretty_assertions::assert_str_eq!(first, second);
}
```

## Тестирование хуков

При создании библиотек вокруг Dioxus может быть полезно написать тесты для ваших [пользовательских хуков](../../essentials/advanced/custom-hooks.md).

Dioxus в настоящее время не имеет полноценной библиотеки тестирования хуков, но вы можете построить собственный тестовый фреймворк, вручную управляя виртуальным DOM.

```rust
use futures::FutureExt;
use std::{cell::RefCell, rc::Rc, sync::Arc, thread::Scope};

use dioxus::{dioxus_core::NoOpMutations, prelude::*};

#[test]
fn test() {
    test_hook(
        || use_signal(|| 0),
        |mut value, mut proxy| match proxy.generation {
            0 => {
                value.set(1);
            }
            1 => {
                assert_eq!(*value.read(), 1);
                value.set(2);
            }
            2 => {
                proxy.rerun();
            }
            3 => {}
            _ => todo!(),
        },
        |proxy| assert_eq!(proxy.generation, 4),
    );
}

fn test_hook<V: 'static>(
    initialize: impl FnMut() -> V + 'static,
    check: impl FnMut(V, MockProxy) + 'static,
    mut final_check: impl FnMut(MockProxy) + 'static,
) {
    #[derive(Props)]
    struct MockAppComponent<I: 'static, C: 'static> {
        hook: Rc<RefCell<I>>,
        check: Rc<RefCell<C>>,
    }

    impl<I, C> PartialEq for MockAppComponent<I, C> {
        fn eq(&self, _: &Self) -> bool {
            true
        }
    }

    impl<I, C> Clone for MockAppComponent<I, C> {
        fn clone(&self) -> Self {
            Self {
                hook: self.hook.clone(),
                check: self.check.clone(),
            }
        }
    }

    fn mock_app<I: FnMut() -> V, C: FnMut(V, MockProxy), V>(
        props: MockAppComponent<I, C>,
    ) -> Element {
        let value = props.hook.borrow_mut()();

        props.check.borrow_mut()(value, MockProxy::new());

        rsx! {
            div {}
        }
    }

    let mut vdom = VirtualDom::new_with_props(
        mock_app,
        MockAppComponent {
            hook: Rc::new(RefCell::new(initialize)),
            check: Rc::new(RefCell::new(check)),
        },
    );

    vdom.rebuild_in_place();

    while vdom.wait_for_work().now_or_never().is_some() {
        vdom.render_immediate(&mut NoOpMutations);
    }

    vdom.in_scope(ScopeId::ROOT, || {
        final_check(MockProxy::new());
    })
}

struct MockProxy {
    rerender: Arc<dyn Fn()>,
    pub generation: usize,
}

impl MockProxy {
    fn new() -> Self {
        let generation = dioxus::core::generation();
        let rerender = dioxus::core::schedule_update();

        Self {
            rerender,
            generation,
        }
    }

    pub fn rerun(&mut self) {
        (self.rerender)();
    }
}
```

## Сквозное тестирование

Вы можете использовать [Playwright](https://playwright.dev/) для создания сквозных тестов для вашего приложения Dioxus.

В вашем `playwright.config.js` вам нужно будет запускать `cargo run` или `dx serve` вместо команды сборки по умолчанию. Вот фрагмент из примера сквозного веб-теста:

```js
//...
webServer: [
    {
        cwd: path.join(process.cwd(), 'playwright-tests', 'web'),
        command: 'dx serve',
        port: 8080,
        timeout: 10 * 60 * 1000,
        reuseExistingServer: !process.env.CI,
        stdout: "pipe",
    },
],
```

- [Веб-пример](https://github.com/DioxusLabs/dioxus/tree/main/packages/playwright-tests/web)
- [LiveView-пример](https://github.com/DioxusLabs/dioxus/tree/main/packages/playwright-tests/liveview)
- [Fullstack-пример](https://github.com/DioxusLabs/dioxus/tree/main/packages/playwright-tests/fullstack)
