---
title: Effects and Memos
---
# Effects and Memos

Signals provide a foundation for mutable state in Dioxus apps. Calls to `.read()` subscribe reactive scopes and calls to `.write()` queue side-effects.

However, sometimes we want to run *our own* side-effects when a Signal's value changes. Other times, we want to isolate reactive scopes such that changes to a signal do not automatically queue a component to be re-rendered. In these cases, we reach for Memos with `use_memo` and Effects with `use_effect`.

## Multiple Reactive Scopes

To understand Effects and Memos, we need to first understand that a single Signal (or other reactive value) can be read in multiple reactive scopes simultaneously. For instance, a signal may be shared among several components via props. Each component that calls `.read()` on the signal value is automatically subscribed to any changes of the signal's value. When the signal value changes, it runs the re-render side-effect.

Effects and Memos allow us to observe changes in reactive values without re-rendering components. We can isolate smaller units of reactivity with memos and then queue our own side-effects with effects.

![Multiple Readers](/assets/07/multiple-scopes.png)

Memos implement the `Readable` trait (but not the Writable trait!) and thus implement the same ergonomic extensions as signals. Both Memos and Effects are `Copy` and have the same lifecycle and Drop semantics as signals.

## Derived State with Memo

`use_memo` is a reactive primitive that lets you derive state from any tracked value. It takes a closure that computes the new state and returns a tracked value that contains the current state of the memo. When a dependency of the memo changes, the memo will rerun, and a new value will be calculated.

The value returned from the closure will only cause the memo's value to update - and thus any side-effects - when they are not equal, determined by the `PartialEq` between the old and new value.

```rust
fn Memo() -> Element {
    let mut count = use_signal(|| 0);

    // use_memo creates a tracked value that is derived from count
    // Since we read count inside the closure, it becomes a dependency of the memo
    // Whenever count changes, the memo will rerun
    let half_count = use_memo(move || count() / 2);

    use_effect(move || {
        // half_count is itself a tracked value
        // When we read half_count, it becomes a dependency of the effect
        // and the effect will rerun when half_count changes
        log!("{half_count}");
    });

    rsx! {
        button { onclick: move |_| count += 1, "Increment" }

        div { "Count is {count}" }
        div { "Half count is {half_count}" }
    }
}
```


Memos can be useful to perform expensive computations outside the component's reactive scope, preventing re-renders when the inputs change. In this example, by performing our computation *inside* the memo, we prevent the component from re-rendering when either `loading` or `loading_text` changes. Instead, the component will only re-render when the computed memo value changes.

```rust
let mut loading = use_signal(|| false);
let mut loading_text = use_signal(|| "loading".to_string());

let subheading = use_memo(move || {
    if loading() && loading_text() == "loading" {
        return "The state is loading";
    }

    "The state is not loading"
});

rsx! {
    h1 { "{subheading}" }
}
```

## Derived Elements

The `use_memo` hook is particularly powerful. In addition to primitive values, it can even memoize `Element` objects! We can break up large components into a series of smaller memos for a performance boost.

In practice, you won't need to frequently use Element memoization, but it can be useful. Most commonly, we can transform the result of some expensive computation directly into an Element without needing to store the intermediate value:

```rust
let mut loading_text = use_signal(|| "loading".to_string());

let loading_ui = use_memo(move || {
    let num_chars = loading_text.read().chars().count();
    rsx! { "there are {num_chars} characters!" }
});

rsx! {
    h1 { "Demo" }
    {loading_ui}
}
```

Astute readers will recognize that memoized UI and components are essentially the same concept - components are simply functions of memoized state that return an Element.

## Memo Chains and PartialEq

The closure you pass into memos will be called whenever the state you read inside the memo is written to — even if the value hasn't actually changed — but the memo you get will not rerun other parts of your app unless the output changes (`PartialEq` returns false).

Let's dig into some examples to see how this works:

```rust no_run
let mut count = use_signal(|| 1);
// double_count will rerun when state we read inside the memo changes (count)
let double_count = use_memo(move || count() * 2);

// memos act a lot like a read only version of a signal. You can read them, display them, and move them around like any other signal
println!("{}", double_count); // Prints "2"

// But you can't write to them directly
// Instead, any time you write to a value the memo reads, the memo will rerun
count += 1;

println!("{}", double_count); // Prints "4"

// Let's create another memo that reads the value of double_count
let double_count_plus_one = use_memo(move || double_count() + 1);

println!("{}", double_count_plus_one); // Prints "5"

// Now if we write to count the double_count memo will rerun
// If the output of double_count changes, then it will cause double_count_plus_one to rerun
count += 1;

println!("{}", double_count); // Prints "6"
println!("{}", double_count_plus_one); // Prints "7"

// However if the value of double_count doesn't change after a write, then it won't trigger double_count_plus_one to rerun
// Since we just write the same value, the doubled value is still 6 and we don't rerun double_count_plus_one
*count.write() = 3;

println!("{}", double_count); // Prints "6"
println!("{}", double_count_plus_one); // Prints "7"
```

## Memos with Async

Because memos check borrows at runtime, you need to be careful when reading memos inside of async code. If you hold a read of a memo over an await point, that read may still be open when the memo reruns which will cause a panic:

```rust no_run
async fn double_me_async(value: &u32) -> u32 {
    sleep(100).await;
    *value * 2
}
let mut signal = use_signal(|| 0);
let halved = use_memo(move || signal() / 2);

let doubled = use_resource(move || async move {
    // Don't hold reads over await points
    let halved = halved.read();
    // While the future is waiting for the async work to finish, the read will be open
    double_me_async(&halved).await
});

rsx!{
    "{doubled:?}"
    button {
        onclick: move |_| {
            // When you write to signal, it will cause the memo to rerun which may panic because you are holding a read of the memo over an await point
            signal += 1;
        },
        "Increment"
    }
};
```

Instead of holding a read over an await point, you can clone whatever values you need out of your memo:

```rust no_run
async fn double_me_async(value: u32) -> u32 {
    sleep(100).await;
    // value * 2
}
let mut signal = use_signal(|| 0);
let halved = use_memo(move || signal() / 2);

let doubled = use_resource(move || async move {
    // Calling the memo will clone the inner value
    let halved = halved();
    double_me_async(halved).await
});

rsx!{
    "{doubled:?}"
    button {
        onclick: move |_| {
            signal += 1;
        },
        "Increment"
    }
};
```

## Running Side-Effects

By default, whenever a Tracked value changes, any reactive scopes observing the value with `.read()` will run side-effects. The classic example is a component: when a signal value changes, the component queues a side-effect that re-renders the component.

![Component renders are effects](/assets/07/component-effect.png)

We can attach our own side-effects to Signals and Memos using the `use_effect` hook. It creates a closure that is run any time a tracked value that is run inside the closure changes.

Any value you read inside the closure will become a dependency of the effect. If the value changes, the effect will rerun.

```rust
fn Effect() -> Element {
    // use_signal creates a tracked value called count
    let mut count = use_signal(|| 0);

    use_effect(move || {
        // When we read count, it becomes a dependency of the effect
        let current_count = count();
        // Whenever count changes, the effect will rerun
        log!("{current_count}");
    });

    rsx! {
        button { onclick: move |_| count += 1, "Increment" }

        div { "Count is {count}" }
    }
}
```

## Effects with Non-Reactive Dependencies

To add non-reactive dependencies to an effect, you can use the `use_reactive` hook. Signals are automatically added as dependencies, so you don't need to call this method for them.

```rust
#[component]
fn Comp(count: u32) -> Element {
    // Since the effect subscribes to `count` by adding it as a dependency, the effect will rerun every time `count` changes.
    use_effect(use_reactive((&count,), |(count,)| println!("Effect ran with count: {count}") ));

    todo!()
}
```

## Modifying Mounted Nodes

One of the most common use cases for effects is modifying or reading something from the rendered DOM. Dioxus provides access to the DOM through the `onmounted` event.

You can combine `use_effect` with `onmounted` to run an effect with access to the DOM element after all rendering is complete:

```rust
fn MyComponent() -> Element {
    let mut current_text = use_signal(String::new);
    let mut mounted_text_div: Signal<Option<MountedEvent>> = use_signal(|| None);
    let mut rendered_size = use_signal(String::new);

    use_effect(move || {
        // If we have a mounted text div, we can read the width of the div
        if let Some(div) = mounted_text_div() {
            // We read the current text here inside the effect instead of spawn so the effect subscribes to the signal
            let text = current_text();
            spawn(async move {
                let bounding_box = div.get_client_rect().await;
                rendered_size.set(format!("{text} is {bounding_box:?}"));
            });
        }
    });

    rsx! {
        input {
            // When you type text into the input field, the effect will rerun because it is subscribed to the current_text signal
            oninput: move |evt| current_text.set(evt.value()),
            placeholder: "Enter text here",
            value: "{current_text}"
        }
        // When the text changes, it will resize this div
        div {
            onmounted: move |element| {
                mounted_text_div.set(Some(element.clone()));
            },
            "{current_text}"
        }

        "{rendered_size}"
    }
}
```

## Prefer Actions over Side-Effects

You might be wondering: "why should I ever run side-effects?" And, indeed, they should not be a frequently used tool in your toolbox. Side-effects can be difficult to reason about and are frequently misused when an action should be preferred.

The classic example of a side-effect is to synchronize UI state with some external state. For example, we might have a `Title {}` component that sets the window's title whenever the title changes:

```rust
fn Title() -> Element {
    let mut text = use_signal(|| "".to_string());

    // attach an effect to modify the document title whenever title changes
    use_effect(move || {
        window().unwrap().document().unwrap().set_title(&text());
    });

    rsx! {
        input {
            oninput: move |e| text.set(e.value()),
            placeholder: "Set the document title"
        }
    }
}
```

This is a valid use case for side-effects. Dioxus guarantees side-effects will be run *after* the UI has been painted to the screen. If we instead set the document title from the oninput handler, another change in state during the same step might cause the `Title {}` component to be unmounted. In this case, the document title will have been set even though the `Title {}` component is no longer present.

However, some actions should *not* be effects. Effects are widely over-used in React and the source of many state headaches. If you can be reasonably sure that the `Title {}` component won't be unmounted, then it is better to set the document title directly in the handler:


```rust
fn Title() -> Element {
    rsx! {
        input {
            oninput: move |e| {
                window().document().set_title(e.value())
            },
            placeholder: "Set the document title"
        }
    }
}
```

## Opting Out of Subscriptions

In some situations, you may need to read a reactive value without subscribing to it. You can use the `peek` method to get a reference to the inner value without registering the value as a dependency of the current reactive context:

```rust
fn Peek() -> Element {
    let mut count = use_signal(|| 0);

    // The toggle signal is a tracked value
    let mut toggle = use_signal(|| false);

    use_effect(move || {
        // When we read count, it becomes a dependency of the effect
        let current_count = count();
        log!("current_count is {current_count}");

        if current_count % 4 == 0 {
            // We peek at the value of toggle instead of reading it,
            // so it does not become a dependency
            let current_toggle = *toggle.peek();
            // We didn't subscribe to toggle, so this will not cause
            // the effect to rerun forever
            toggle.set(!current_toggle);
            log!("flipped toggle to {toggle}");
        }
    });

    rsx! {
        button { onclick: move |_| count += 1, "Change Signal" }

        div { "Count is {count}" }
        div { "Toggle is {toggle}" }
    }
}
```


## Working with Untracked State

Most of the state in your app will be tracked values. All built in hooks return tracked values, and we encourage custom hooks to do the same. However, there are times when you need to work with untracked state. For example, you may receive a raw untracked value in props. When you read an untracked value inside a reactive context, it will not subscribe to the value:

```rust
fn Component() -> Element {
    let mut count = use_signal(|| 0);

    rsx! {
        button { onclick: move |_| count += 1, "Change Signal" }

        Count { count: count() }
    }
}

// The count reruns the component when it changes, but it is not a tracked value
#[component]
fn Count(count: i32) -> Element {
    // When you read count inside the memo, it does not subscribe to the count signal
    // because the value is not reactive
    let double_count = use_memo(move || count * 2);

    rsx! {
        div { "Double count: {double_count}" }
    }
}
```


You can start tracking raw state with the `use_reactive` hook. This hook takes a tuple of dependencies and returns a reactive closure. When the closure is called in a reactive context, it will track subscribe to the dependencies and rerun the closure when the dependencies change.

```rust
#[component]
fn Count(count: i32) -> Element {
    // You can manually track a non-reactive value with the use_reactive hook
    let double_count = use_memo(
        // Use reactive takes a tuple of dependencies and returns a reactive closure
        use_reactive!(|(count,)| count * 2),
    );

    rsx! {
        div { "Double count: {double_count}" }
    }
}
```


## Making Props Reactive

To avoid losing reactivity with props, we recommend you wrap any props you want to track in a `ReadSignal`. Dioxus will automatically convert `T` into `ReadSignal<T>` when you pass props to the component. This will ensure your props are tracked and rerun any state you derive in the component:

```rust
// You can track props by wrapping the type in a ReadOnlySignal
// Dioxus will automatically convert T into ReadOnlySignal<T> when you pass
// props to the component
#[component]
fn Count(count: ReadOnlySignal<i32>) -> Element {
    // Then when you read count inside the memo, it subscribes to the count signal
    let double_count = use_memo(move || count() * 2);

    rsx! {
        div { "Double count: {double_count}" }
    }
}
```

## Memo Lifecycle

Memos are implemented with [generational-box](https://crates.io/crates/generational-box) which makes all values Copy even if the inner value is not Copy.

This is incredibly convenient for UI development, but it does come with some tradeoffs. The lifetime of the memo is tied to the lifetime of the component it was created in. If you drop the component that created the memo, the memo will be dropped as well. You might run into this if you try to pass a memo from a child component to a parent component and drop the child component. To avoid this you can create your memo higher up in your component tree, or use global memos.

**Don't pass memos up in the component tree**. It will cause issues:

```rust
fn MyComponent() -> Element {
    let child_signal = use_signal(|| None);

    rsx! {
        IncrementButton {
            child_signal
        }
    }
}

#[component]
fn IncrementButton(mut child_signal: Signal<Option<Memo<i32>>>) -> Element {
    let signal_owned_by_child = use_signal(|| 0);
    let memo_owned_by_child = use_memo(move || signal_owned_by_child() * 2);
    // Don't do this: it may cause issues if you drop the child component
    child_signal.set(Some(memo_owned_by_child));

    todo!()
}
```

## Related Examples

- [Use Effect](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_effect.rs) — Side effects with `use_effect`
- [Use Memo](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/use_memo.rs) — Memoized computations
- [Memo Chain](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/memo_chain.rs) — Chained computed values
- [Signals](https://github.com/DioxusLabs/dioxus/tree/main/examples/04-managing-state/signals.rs) — Core signal patterns with effects and memos
