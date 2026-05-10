---
title: Пользовательский рендерер
---

# Пользовательский рендерер

Dioxus — невероятно портативный фреймворк для разработки UI. Уроки, знания, хуки и компоненты, которые вы приобретаете со временем, всегда могут быть использованы в будущих проектах. Однако иногда эти проекты не могут использовать поддерживаемый рендерер, или вам нужно реализовать свой собственный, более лучший рендерер.

Отличные новости: дизайн рендерера полностью зависит от вас! Мы предоставляем предложения и вдохновение с помощью первичных рендереров, но на самом деле требуем только обработки `Mutations` и отправки `UserEvents`.

## Детали

Реализация рендерера довольно проста. Рендерер должен:

1. Обрабатывать поток изменений, генерируемых обновлениями виртуального DOM
2. Регистрировать слушателей и передавать события в систему событий виртуального DOM

По сути, ваш рендерер должен обрабатывать изменения и генерировать события для обновления VirtualDOM. Оттуда у вас будет всё необходимое для рендеринга VirtualDOM на экран.

Внутренне Dioxus обрабатывает древовидные отношения, диффинг, управление памятью и систему событий, оставляя для рендереров минимум требуемой реализации.

Для справки ознакомьтесь с [javascript interpreter](https://github.com/DioxusLabs/dioxus/tree/v0.5/packages/interpreter) или [tui renderer](https://github.com/DioxusLabs/blitz/tree/master/packages/dioxus-tui) в качестве отправной точки для вашего пользовательского рендерера.

## Шаблоны

Dioxus построен вокруг концепции [Templates](https://docs.rs/dioxus-core/latest/dioxus_core/prelude/struct.Template.html). Шаблоны описывают дерево UI, известное на этапе компиляции, с динамическими частями, заполняемыми во время выполнения. Это полезно внутренне для пропуска диффинга статических узлов, но также полезно для рендерера повторно использовать части дерева UI. Это может быть полезно для таких вещей, как список элементов. Каждый элемент может содержать некоторые статические части и некоторые динамические части. Рендерер может использовать шаблон для создания статической части UI один раз, клонировать её для каждого элемента в списке, а затем заполнять динамические части.

## Мутации

Тип `Mutation` — это сериализованное перечисление, представляющее операцию, которая должна быть применена для обновления UI. Варианты примерно следуют этому набору:

```rust
enum Mutation {
 AppendChildren,
 AssignId,
 CreatePlaceholder,
 CreateTextNode,
 HydrateText,
 LoadTemplate,
 ReplaceWith,
 ReplacePlaceholder,
 InsertAfter,
 InsertBefore,
 SetAttribute,
 SetText,
 NewEventListener,
 RemoveEventListener,
 Remove,
 PushRoot,
}
```

Механизм диффинга Dioxus работает как [стековая машина](https://en.wikipedia.org/wiki/Stack_machine), где мутации [LoadTemplate](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.LoadTemplate), [CreatePlaceholder](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.CreatePlaceholder) и [CreateTextNode](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.CreateTextNode) помещают новый «реальный» DOM-узел в стек, а [AppendChildren](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.AppendChildren), [InsertAfter](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.InsertAfter), [InsertBefore](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.InsertBefore), [ReplacePlaceholder](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.ReplacePlaceholder) и [ReplaceWith](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.ReplaceWith) удаляют узлы из стека.

## Хранение узлов

Dioxus сохраняет и загружает элементы по ID. Внутри VirtualDOM это просто отслеживается как u64.

Всякий раз, когда во время диффинга генерируется `CreateElement`, Dioxus увеличивает свой счётчик узлов и назначает новому элементу текущий NodeCount. RealDom отвечает за запоминание этого ID и помещение правильного узла, когда id используется в мутации. Dioxus освобождает ID элементов при их удалении. Чтобы оставаться синхронизированным с Dioxus, вы можете использовать разреженный Vec (Vec<Option<T>>) с возможно незанятыми элементами. Вы можете использовать id как индексы в Vec для элементов и расширять Vec, когда id не существует.

### Пример

Ради понимания давайте рассмотрим этот пример — очень простое объявление UI:

```rust
rsx! {
	h1 { "count: {x}" }
}
```

#### Создание шаблонов

Приведённый выше rsx создаст шаблон, содержащий один статический тег h1 и заполнитель для динамического текстового узла. Шаблон содержит статические части UI и id для динамических частей вместе с путями доступа к ним.

Шаблон будет выглядеть примерно так:

```rust
Template {
	// Некоторый id, уникальный для всего проекта
	name: "main.rs:1:1:0",
	// Корневые узлы шаблона
 roots: &[
		TemplateNode::Element {
			tag: "h1",
   namespace: None,
			attrs: &[],
   children: &[
				TemplateNode::DynamicText {
     id: 0
				},
			],
		}
	],
	// путь к каждому из динамических узлов
 node_paths: &[
		// путь к динамическому узлу с id 0
		&[
			// к первому корневому узлу
			0,
			// первый потомок корневого узла
			0,
		]
	],
	// путь к каждому из динамических атрибутов
	attr_paths: &'a [&'a [u8]],
}
```

> Для более подробной документации о структуре шаблонов см. [документацию Template API](https://docs.rs/dioxus-core/latest/dioxus_core/prelude/struct.Template.html)

Этот шаблон будет отправлен рендереру в [списке шаблонов](https://docs.rs/dioxus-core/latest/dioxus_core/struct.Mutations.html#structfield.templates), поставляемом с мутациями, при первом использовании. Всякий раз, когда рендерер встречает мутацию [LoadTemplate](https://docs.rs/dioxus-core/latest/dioxus_core/enum.Mutation.html#variant.LoadTemplate) после этого, он должен клонировать шаблон и сохранить его по заданному id.

Для динамических узлов и динамических текстовых узлов должен быть создан placeholder-узел и вставлен в UI, чтобы узел можно было изменить позже.

В HTML-рендерерах этот шаблон может выглядеть так:

```html
<h1>""</h1>
```

#### Применение мутаций

После того как рендерер создал все новые шаблоны, он может начать обрабатывать мутации.

Когда рендерер запускается, он должен содержать Root-узел в стеке и сохранить Root-узел с id 0. Root-узел — это узел верхнего уровня UI. В HTML это элемент `<div id="main">`.

```rust
instructions: []
stack: [
 RootNode,
]
nodes: [
 RootNode,
]
```

Первая мутация — `LoadTemplate`. Это говорит рендереру загрузить корень из шаблона с заданным id. Рендерер затем помещает корневой узел шаблона в стек и сохраняет его с id для дальнейшего использования. В данном случае корневой узел — это элемент h1.

```rust
instructions: [
	LoadTemplate {
		// id шаблона
		name: "main.rs:1:1:0",
		// индекс корневого узла в шаблоне
		index: 0,
		// id для сохранения
		id: ElementId(1),
	}
]
stack: [
 RootNode,
	<h1>""</h1>,
]
nodes: [
 RootNode,
	<h1>""</h1>,
]
```

Далее Dioxus создаст динамический текстовый узел. Алгоритм диффинга решает, что этот узел нужно создать, поэтому Dioxus генерирует мутацию `HydrateText`. Когда рендерер получает эту инструкцию, он переходит к placeholder-текстовому узлу в шаблоне и заменяет его новым текстом.

```rust
instructions: [
	LoadTemplate {
		name: "main.rs:1:1:0",
		index: 0,
		id: ElementId(1),
	},
	HydrateText {
		// id для сохранения текстового узла
		id: ElementId(2),
		// текст для установки
		text: "count: 0",
	}
]
stack: [
 RootNode,
	<h1>"count: 0"</h1>,
]
nodes: [
 RootNode,
	<h1>"count: 0"</h1>,
	"count: 0",
]
```

Помните, узел h1 ни к чему не прикреплён (он несмонтирован), поэтому Dioxus должен сгенерировать Edit, который соединяет узел h1 с Root. Это зависит от ситуации, но в данном случае мы используем `AppendChildren`. Это выталкивает текстовый узел из стека, оставляя Root-элемент следующим элементом в стеке.

```rust
instructions: [
	LoadTemplate {
		name: "main.rs:1:1:0",
		index: 0,
		id: ElementId(1),
	},
	HydrateText {
		id: ElementId(2),
		text: "count: 0",
	},
	AppendChildren {
		// id родительского узла
		id: ElementId(0),
		// количество узлов для выталкивания из стека и добавления
  m: 1
	}
]
stack: [
 RootNode,
]
nodes: [
 RootNode,
	<h1>"count: 0"</h1>,
	"count: 0",
]
```

Со временем наш стек выглядел так:

```rust
[Root]
[Root, <h1>""</h1>]
[Root, <h1>"count: 0"</h1>]
[Root]
```

Удобно, что этот подход полностью отделяет Virtual DOM от Real DOM. Кроме того, эти изменения сериализуемы, а это означает, что мы можем даже управлять UI через сетевое соединение. Эта маленькая стековая машина и сериализованные изменения делают Dioxus независимым от специфики платформы.

Dioxus также очень быстр. Поскольку Dioxus разделяет фазу диффинга и патча, он может вносить все изменения в RealDOM за очень короткое время (менее одного кадра), делая рендеринг очень отзывчивым. Это также позволяет Dioxus отменять большие операции диффинга, если приходит работа с более высоким приоритетом, пока он выполняет диффинг.

Этот небольшой демонстрационный пример служит для показа того, как рендерер должен обрабатывать поток мутаций для построения UI.

## Цикл событий

Как и большинство GUI, Dioxus полагается на цикл событий для продвижения VirtualDOM. Сам VirtualDOM тоже может производить события, поэтому важно, чтобы ваш пользовательский рендерер мог обрабатывать и их.

Код реализации WebSys прост, поэтому мы добавим его здесь, чтобы продемонстрировать, как простым может быть цикл событий:

```rust
pub async fn run(&mut self) -> dioxus_core::error::Result<()> {
	// Поместить body-элемент в стековую машину WebsysDom
	let mut websys_dom = crate::new::WebsysDom::new(prepare_websys_dom());
	websys_dom.stack.push(root_node);

	// Перестроить или гидратировать virtualdom
	let mutations = self.internal_dom.rebuild();
	websys_dom.apply_mutations(mutations);

	// Ожидать обновлений от реального dom и продвигать виртуальный dom
	loop {
		let user_input_future = websys_dom.wait_for_event();
		let internal_event_future = self.internal_dom.wait_for_work();

		match select(user_input_future, internal_event_future).await {
			Either::Left((_, _)) => {
				let mutations = self.internal_dom.work_with_deadline(|| false);
				websys_dom.apply_mutations(mutations);
			},
			Either::Right((event, _)) => websys_dom.handle_event(event),
		}

		// рендер
	}
}
```

Важно декодировать реальные события для вашей системы событий в синтетическую систему событий Dioxus (синтетическая — значит абстрагированная). Это просто означает сопоставление вашего типа события и создание типа Dioxus `UserEvent`. Прямо сейчас виртуальная система событий смоделирована почти полностью вокруг спецификации HTML, но мы заинтересованы в её упрощении.

```rust
fn virtual_event_from_websys_event(event: &web_sys::Event) -> VirtualEvent {
	match event.type_().as_str() {
		"keydown" => {
			let event: web_sys::KeyboardEvent = event.clone().dyn_into().unwrap();
			UserEvent::KeyboardEvent(UserEvent {
    scope_id: None,
				priority: EventPriority::Medium,
				name: "keydown",
				// Это должен быть любой элемент, который находится в фокусе
				element: Some(ElementId(0)),
				data: Arc::new(KeyboardData{
					char_code: event.char_code(),
					key: event.key(),
					key_code: event.key_code(),
					alt_key: event.alt_key(),
					ctrl_key: event.ctrl_key(),
					meta_key: event.meta_key(),
					shift_key: event.shift_key(),
					location: event.location(),
					repeat: event.repeat(),
					which: event.which(),
				})
			})
		}
		_ => todo!()
	}
}
```

## Пользовательские raw-элементы

Если вам нужно полагаться на пользовательские элементы/атрибуты для вашего рендерера — вы абсолютно можете. Это всё ещё позволяет вам использовать реактивную природу Dioxus, систему компонентов, общее состояние и другие фичи, но в конечном итоге будет генерировать другие узлы. Все атрибуты и слушатели для пространства имён HTML и SVG передаются через вспомогательные структуры, которые по сути компилируются в ничто. Вы можете вставлять свои элементы в любое время, с минимальными хлопотами. Однако вы должны быть уверены, что ваш рендерер может обработать новое пространство имён.

Для получения дополнительных примеров и информации о создании пользовательских пространств имён см. [крейт `dioxus_html`](https://github.com/DioxusLabs/dioxus/blob/main/packages/html/README.md#how-to-extend-it).

## Заключение

Вот и всё! У вас должно быть почти всё необходимое знание о том, как реализовать свой рендерер. Мы очень заинтересованы в том, чтобы увидеть приложения Dioxus, перенесённые на пользовательские десктопные рендереры, мобильные рендереры, UI видеоигр и даже дополненную реальность! Если вы заинтересованы внесением вклада в любой из этих проектов, не бойтесь обращаться или присоединяйтесь к [сообществу](https://discord.gg/XgGxMSkvUM).
