---
title: Data Fetching
---
# Data Fetching

One of the most common asynchronous operations in applications is making network requests. This guide will cover how to fetch data in Dioxus, how to avoid waterfalls, and using libraries to manage caching and invalidating requests.

The hooks and techniques we cover here are built on top of the Future and Signal primitives.

## Library Dependencies

While Dioxus does not provide a built-in HTTP client, you can use the popular [reqwest](https://docs.rs/reqwest/latest/reqwest/) library to make asynchronous network requests. We will be using the reqwest library throughout the examples in this page. Before we start, make sure to add the `reqwest` and `serde` libraries to your `Cargo.toml`:

```sh
cargo add reqwest --features json
cargo add serde --features derive
```

Your Cargo.toml should have the reqwest and serde libraries:
```toml
[dependencies]
# ... dioxus and other dependencies
reqwest = { version = "*", features = ["json"] }
serde = { version = "1", features = ["derive"] }
```

We are planning on eventually integrating a library like [dioxus-query](https://crates.io/crates/dioxus-query) directly into Dioxus for better integration with the app router.

## Requests from Event Handlers

The simplest way to request data is simply by attaching an async closure to an EventHandler.

```rust
#[derive(serde::Deserialize)]
struct DogApi {
    message: String,
}

let mut img_src = use_signal(|| "image.png".to_string());

let fetch_new = move |_| async move {
    let response = reqwest::get("https://dog.ceo/api/breeds/image/random")
        .await
        .unwrap()
        .json::<DogApi>()
        .await
        .unwrap();

    img_src.set(response.message);
};

rsx! {
    img { src: img_src }
    button { onclick: fetch_new, "Fetch a new dog!" }
}
```

Whenever the user clicks the button, the `fetch_new` closure is fired, a new Future is spawned, and the network request is made. When the response is complete, we set `img_src` to the return value.

Unfortunately, data fetching is not always quite this simple. If the user rapidly presses the fetch button, multiple requests will be made simultaneously, and the image source will overwritten multiple times. To mitigate this, we can add a "loading" Signal to prevent multiple requests:

```rust
let mut img_src = use_signal(|| "image.png".to_string());
let mut loading = use_signal(|| false);

let fetch_new = move |_| async move {
    if loading() {
        return;
    }

    loading.set(true);
    let response = reqwest::get("https://dog.ceo/api/breeds/image/random")
        .await
        .unwrap()
        .json::<DogApi>()
        .await
        .unwrap();

    img_src.set(response.message);
    loading.set(false);
};

// ...
```

Manually handling edge cases of data loading can be tedious, so we've built a more general solution for futures with `use_resource`.

## Asynchronous State with `use_resource`

The [`use_resource`](https://docs.rs/dioxus-hooks/latest/dioxus_hooks/fn.use_resource.html) hook can be used to *derive* asynchronous state. This function accepts an async closure that returns a Future. As the future is polled, `use_resource` tracks `.read()` calls of any contained Signals. If another action calls `.write()` on the tracked signals, the `use_resource` immediately restarts.

```rust
let mut breed = use_signal(|| "hound".to_string());
let dogs = use_resource(move || async move {
    reqwest::Client::new()
        // Since breed is read inside the async closure, the resource will subscribe to the signal
        // and rerun when the breed is written to
        .get(format!("https://dog.ceo/api/breed/{breed}/images"))
        .send()
        .await?
        .json::<BreedResponse>()
        .await
});

rsx! {
    input {
        value: "{breed}",
        // When the input is changed and the breed is set, the resource will rerun
        oninput: move |evt| breed.set(evt.value()),
    }

    div {
        display: "flex",
        flex_direction: "row",
        // You can read resource just like a signal. If the resource is still
        // running, it will return None
        if let Some(response) = &*dogs.read() {
            match response {
                Ok(urls) => rsx! {
                    for image in urls.iter().take(3) {
                        img {
                            src: "{image}",
                            width: "100px",
                            height: "100px",
                        }
                    }
                },
                Err(err) => rsx! { "Failed to fetch response: {err}" },
            }
        } else {
            "Loading..."
        }
    }
}
```


The `use_resource` hook might look similar to the `use_memo` hook. Unlike `use_memo`, the resource's output is not memoized with `PartialEq`. That means any components/reactive hooks that read the output will rerun if the future reruns even if the value it returns is the same:

```rust
let mut number = use_signal(|| 0);

// Resources rerun any time their dependencies change. They will
// rerun any reactive scopes that read the resource when they finish
// even if the value hasn't changed
let halved_resource = use_resource(move || async move { number() / 2 });

log!("Component reran");

rsx! {
    button {
        onclick: move |_| number += 1,
        "Increment"
    }
    p {
        if let Some(halved) = halved_resource() {
            "Halved: {halved}"
        } else {
            "Loading..."
        }
    }
}
```

## Resource State

Resources return a value based on some existing state. You can read the state of a resource to check if the future is still running, finished, or was stopped:

```rust no_run
let mut count = use_signal(|| 1);
let double_count = use_resource(move || async move {
    let response = reqwest::get(format!("https://myserver.com/doubleme?count={count}")).await.unwrap();
    response.text().await.unwrap()
});

// Calling .state() on a resource will return a Signal<UseResourceState> with information about the current status of the resource
println!("{:?}", double_count.state().read()); // Prints "UseResourceState::Pending"

// You can also try to get the last resolved value of the resource with the .value() method
println!("{:?}", double_count.read()); // Prints "None"
```

## With non-reactive dependencies

`use_resource` can determine dependencies automatically with any reactive value (Signals, ReadSignals, Memos, Resources, etc). If you need to rerun the future when a normal Rust value changes, you can add it as a dependency with the `use_reactive` hook:

```rust
#[component]
fn Comp(count: u32) -> Element {
    // We manually add the resource to the dependencies list with the `use_reactive` hook
    // Any time `count` changes, the resource will rerun
    let new_count = use_resource(use_reactive!(|(count,)| async move {
        sleep(100).await;
        // count + 1
    }));
    rsx! { "{new_count:?}" }
}

// If your value is already reactive, you never need to call `use_reactive` manually
// Instead of manually adding count to the dependencies list, you can make your prop reactive by wrapping it in `ReadSignal`
#[component]
fn ReactiveComp(count: ReadSignal<u32>) -> Element {
    // Because `count` is reactive, the resource knows to rerun when `count` changes automatically
    let new_count = use_resource(move || async move {
        sleep(100).await;
        // count() + 1
    });
    rsx! { "{new_count:?}" }
}
```

## Differences from `use_future` and `use_memo`

Just like `use_future`, `use_resource` spawns an async task in a component. However, unlike `use_future`, `use_resource` returns the result of the future and will rerun when any dependencies change.

Resources return a value based on some existing state just like memos, but unlike memos, resources do not memorize the output of the closure. They will always rerun any parts of your app that read the value of the resource when the future resolves even if the output doesn't change.

> Note: The future you pass to `use_resource` must be cancel safe. Cancel safe futures are futures that can be stopped at any await point without causing issues. For example, this task is not cancel safe:
>
> ```rust
static RESOURCES_RUNNING: GlobalSignal<HashSet<String>> = Signal::global(|| HashSet::new());
let mut breed = use_signal(|| "hound".to_string());
let dogs = use_resource(move || async move {
    // Modify some global state
    RESOURCES_RUNNING.write().insert(breed());

    // Wait for a future to finish. The resource may cancel
    // without warning if breed is changed while the future is running. If
    // it does, then the breed pushed to RESOURCES_RUNNING will never be popped
    let response = reqwest::Client::new()
        .get(format!("https://dog.ceo/api/breed/{breed}/images"))
        .send()
        .await?
        .json::<BreedResponse>()
        .await;

    // Restore some global state
    RESOURCES_RUNNING.write().remove(&breed());

    response
});
```

## Asynchronous State with `use_loader`

The `use_resource` hook is great for loading arbitrary values. However, working with resources that return results can be a bit cumbersome. In some cases, the `use_loader` hook is a better choice.

The `use_loader` hook is designed to work with reactive futures that return `Result<T, E>`. Instead of returning a `Resource<T>` like `use_resource`, `use_loader` actually returns `Result<Loader<T>, Loading>`. The `Loading` return type is tightly integrated with Error Boundaries and Suspense — both very useful when doing server-side rendering (SSR).

Because `use_loader` returns a Result, you can use the `?` syntax to early return if the resource is pending or errored:

```rust
// Fetch the list of breeds from the Dog API, using the `?` syntax to suspend or throw errors
let breed_list = use_loader(move || async move {
    reqwest::get("https://dog.ceo/api/breeds/list/all")
        .await?
        .json::<ListBreeds>()
        .await
})?;
```

Generally, we recommend using `use_resource` when doing client-side fetching and `use_loader` when doing hybrid client/server fetching.

## Avoiding Waterfalls

One common issue when fetching data is the "waterfall" effect, where requests run sequentially. This can lead to slow loading times and a poor user experience. To avoid waterfalls, you can hoist your data loading logic to a higher level in your component tree and avoid returning early before unrelated requests.

Lets look at at an app that causes a waterfall effect:

```rust
fn fetch_dog_image(
    breed: impl Display,
) -> impl Future<Output = dioxus::Result<String, CapturedError>> {
    async move {
        let response = reqwest::get(format!("https://dog.ceo/api/breed/{breed}/images/random"))
            .await?
            .json::<DogApi>()
            .await?;
        Ok(response.message)
    }
}

#[component]
fn DogView() -> Element {
    let poodle_img = use_resource(|| fetch_dog_image("poodle"));

    let poodle_img = match poodle_img() {
        Some(Ok(src)) => src,
        _ => {
            return rsx! {
                p { "Loading or error..." }
            };
        }
    };

    let golden_retriever_img = use_resource(|| fetch_dog_image("golden retriever"));

    let golden_retriever_img = match golden_retriever_img() {
        Some(Ok(src)) => src,
        _ => {
            return rsx! {
                p { "Loading or error..." }
            };
        }
    };

    let pug_img = use_resource(|| fetch_dog_image("pug"));

    let pug_img = match pug_img() {
        Some(Ok(src)) => src,
        _ => {
            return rsx! {
                p { "Loading or error..." }
            };
        }
    };

    rsx! {
        div {
            h1 { "Dog Images" }
            img { src: "{poodle_img}" }
            img { src: "{golden_retriever_img}" }
            img { src: "{pug_img}" }
        }
    }
}
```

In this example, we return early from the component when any of the requests are still loading. The request for the golden retriever and pug images will not start until the poodle image is loaded, causing a waterfall effect.

![waterfall effect](/assets/07/waterfall_effect.png)

We can avoid this issue by moving all of the early returns after the data fetching for all three images has started. This way, all requests will start at the same time which means they can execute in parallel:

```rust
let poodle_img = use_resource(|| fetch_dog_image("poodle"));
let golden_retriever_img = use_resource(|| fetch_dog_image("golden retriever"));
let pug_img = use_resource(|| fetch_dog_image("pug"));

let poodle_img = match poodle_img() {
    Some(Ok(src)) => src,
    _ => {
        return rsx! {
            p { "Loading or error..." }
        };
    }
};
let golden_retriever_img = match golden_retriever_img() {
    Some(Ok(src)) => src,
    _ => {
        return rsx! {
            p { "Loading or error..." }
        };
    }
};
let pug_img = match pug_img() {
    Some(Ok(src)) => src,
    _ => {
        return rsx! {
            p { "Loading or error..." }
        };
    }
};

rsx! {
    div {
        h1 { "Dog Images" }
        img { src: "{poodle_img}" }
        img { src: "{golden_retriever_img}" }
        img { src: "{pug_img}" }
    }
}
```

![no waterfall effect](/assets/07/no_waterfall_effect.png)

## Organizing Data Fetching

While it might be tempting to place `use_resource` calls *everywhere* in your app, we strongly recommend limiting yourself to just a few sources of data fetching. It is generally easier to reason about centralized loading states rather than many fragmented sources.

As we add more sources of data fetching, we also add a larger combination of loading states. If possible, it's better to load a users's "name" and "id" in *one* request, rather than two.

## Libraries for Data Fetching

`use_resource` is a great way to fetch data in dioxus, but it can be cumbersome to manage complex data fetching scenarios. Libraries like [Dioxus query](https://docs.rs/dioxus-query/latest/dioxus_query/) provide more advanced features for data fetching, such as caching, invalidation, and polling. We won't cover the api of these libraries in detail here, but you can check out the [dioxus awesome](https://dioxuslabs.com/awesome/) list for more libraries that can help you with data fetching.

## Related Examples

- [Dog App](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/dog_app.rs) — Fetching dog breeds and images from an API
- [Weather App](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/weather_app.rs) — Viewing weather forecasts
- [Repo Readme](https://github.com/DioxusLabs/dioxus/tree/main/examples/01-app-demos/repo_readme.rs) — GitHub README viewer
- [Router Resource](https://github.com/DioxusLabs/dioxus/tree/main/examples/06-routing/router_resource.rs) — Loading data with routing

