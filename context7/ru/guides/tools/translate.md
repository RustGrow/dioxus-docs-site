---
title: Перевод HTML
---

# Перевод существующего HTML

Dioxus использует собственный формат под названием RSX для представления HTML, потому что он более лаконичен и больше похож на код Rust. Однако преобразование существующего HTML в RSX может быть утомительным. Поэтому Dioxus поставляется с инструментом `dx translate`, который может автоматически конвертировать HTML в RSX!

Команда `dx translate` может значительно упростить конвертацию больших фрагментов HTML в RSX! Давайте попробуем перевести часть HTML с главной страницы Dioxus:

```sh
dx translate --raw  "<div class=\"relative w-full mx-4 sm:mx-auto text-gray-600\"><div class=\"text-[3em] md:text-[5em] font-semibold dark:text-white text-ghdarkmetal font-sans py-12 flex flex-col\"><span>Fullstack, crossplatform,</span><span>lightning fast, fully typed.</span></div><h3 class=\"text-[2em] dark:text-white font-extralight text-ghdarkmetal pt-4 max-w-screen-md mx-auto\">Dioxus is a Rust library for building apps that run on desktop, web, mobile, and more.</h3><div class=\"pt-12 text-white text-[1.2em] font-sans font-bold flex flex-row justify-center space-x-4\"><a href=\"/learn/0.7/getting_started\" dioxus-prevent-default=\"onclick\" class=\"bg-red-600 py-2 px-8 hover:-translate-y-2 transition-transform duration-300\" data-dioxus-id=\"216\">Quickstart</a><a href=\"/learn/0.7/reference\" dioxus-prevent-default=\"onclick\" class=\"bg-blue-500 py-2 px-8 hover:-translate-y-2 transition-transform duration-300\" data-dioxus-id=\"214\">Read the docs</a></div><div class=\"max-w-screen-2xl mx-auto pt-36\"><h1 class=\"text-md\">Trusted by top companies</h1><div class=\"pt-4 flex flex-row flex-wrap justify-center\"><div class=\"h-12 w-40 bg-black p-2 m-4 flex justify-center items-center\"><img src=\"static/futurewei_bw.png\"></div><div class=\"h-12 w-40 bg-black p-2 m-4 flex justify-center items-center\"><img src=\"static/airbuslogo.svg\"></div><div class=\"h-12 w-40 bg-black p-2 m-4 flex justify-center items-center\"><img src=\"static/ESA_logo.svg\"></div><div class=\"h-12 w-40 bg-black p-2 m-4 flex justify-center items-center\"><img src=\"static/yclogo.svg\"></div><div class=\"h-12 w-40 bg-black p-2 m-4 flex justify-center items-center\"><img src=\"static/satellite.webp\"></div></div></div></div>"
```

Мы получим следующий RSX, который вы можете легко скопировать и вставить в свой код:

```rs
div { class: "relative w-full mx-4 sm:mx-auto text-gray-600",
   div { class: "text-[3em] md:text-[5em] font-semibold dark:text-white text-ghdarkmetal font-sans py-12 flex flex-col",
      span { "Fullstack, crossplatform," }
      span { "lightning fast, fully typed." }
   }
   h3 { class: "text-[2em] dark:text-white font-extralight text-ghdarkmetal pt-4 max-w-screen-md mx-auto",
      "Dioxus is a Rust library for building apps that run on desktop, web, mobile, and more."
   }
   div { class: "pt-12 text-white text-[1.2em] font-sans font-bold flex flex-row justify-center space-x-4",
      a {
         href: "/learn/0.7/getting_started",
         data_dioxus_id: "216",
         dioxus_prevent_default: "onclick",
         class: "bg-red-600 py-2 px-8 hover:-translate-y-2 transition-transform duration-300",
         "Quickstart"
      }
      a {
         dioxus_prevent_default: "onclick",
         href: "/learn/0.7/reference",
         data_dioxus_id: "214",
         class: "bg-blue-500 py-2 px-8 hover:-translate-y-2 transition-transform duration-300",
         "Read the docs"
      }
   }
   div { class: "max-w-screen-2xl mx-auto pt-36",
      h1 { class: "text-md", "Trusted by top companies" }
      div { class: "pt-4 flex flex-row flex-wrap justify-center",
         div { class: "h-12 w-40 p-2 m-4 flex justify-center items-center",
            img { src: "/assets/static/futurewei_bw.png" }
         }
         div { class: "h-12 w-40 p-2 m-4 flex justify-center items-center",
            img { src: "/assets/static/airbuslogo.svg" }
         }
         div { class: "h-12 w-40 p-2 m-4 flex justify-center items-center",
            img { src: "/assets/static/ESA_logo.svg" }
         }
         div { class: "h-12 w-40 p-2 m-4 flex justify-center items-center",
            img { src: "/assets/static/yclogo.svg" }
         }
         div { class: "h-12 w-40 p-2 m-4 flex justify-center items-center",
            img { src: "/assets/static/satellite.webp" }
         }
      }
   }
}
```

## Использование

Команда `dx translate` имеет несколько флагов, которые вы можете использовать для управления входным HTML и выходным RSX.

Вы можете использовать флаг `--file`, чтобы перевести HTML-файл в RSX:

```sh
dx translate --file index.html
```

Или вы можете использовать флаг `--raw`, чтобы перевести строку HTML в RSX:

```sh
dx translate --raw "<div>Hello world</div>"
```

Обе эти команды выведут следующий RSX:

```rs
div { "Hello world" }
```

Команда `dx translate` выводит RSX в stdout. Вы можете использовать флаг `--output`, чтобы записать RSX в файл вместо этого.

```sh
dx translate --raw "<div>Hello world</div>" --output index.rs
```

Вы можете автоматически создать компонент с помощью флага `--component`.

```sh
dx translate --raw "<div>Hello world</div>" --component
```

Это выведет следующий компонент:

```rs
fn component() -> Element {
   rsx! {
      div { "Hello world" }
   }
}
```

Чтобы узнать больше о различных флагах, которые поддерживает `dx translate`, выполните `dx translate --help`.
