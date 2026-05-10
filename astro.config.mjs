import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://dioxuslabs.com',
  server: {
    host: true,
  },
  integrations: [
    starlight({
      title: 'Dioxus 0.7 Docs',
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        ru: {
          label: 'Русский',
          lang: 'ru',
        },
      },
      sidebar: [
        {
          label: 'Getting Started',
          translations: { ru: 'Начало работы' },
          items: [
            {
              label: 'Welcome',
              translations: { ru: 'Добро пожаловать' },
              slug: 'getting-started/welcome',
            },
            {
              label: 'Roadmap',
              translations: { ru: 'Дорожная карта' },
              slug: 'getting-started/roadmap',
            },
          ],
        },
        {
          label: 'Tutorial',
          translations: { ru: 'Туториал' },
          items: [
            { label: 'Overview', translations: { ru: 'Обзор' }, slug: 'tutorial/overview' },
            { label: 'Tooling Setup', translations: { ru: 'Настройка инструментов' }, slug: 'tutorial/tooling' },
            { label: 'Creating a New App', translations: { ru: 'Создание приложения' }, slug: 'tutorial/new-app' },
            { label: 'Your First Component', translations: { ru: 'Первый компонент' }, slug: 'tutorial/component' },
            { label: 'Creating UI with RSX', translations: { ru: 'UI с помощью RSX' }, slug: 'tutorial/rsx' },
            { label: 'Styling and Assets', translations: { ru: 'Стили и ресурсы' }, slug: 'tutorial/assets' },
            { label: 'Adding State', translations: { ru: 'Добавление состояния' }, slug: 'tutorial/state' },
            { label: 'Fetching Data', translations: { ru: 'Загрузка данных' }, slug: 'tutorial/data-fetching' },
            { label: 'Add a Backend', translations: { ru: 'Добавление бэкенда' }, slug: 'tutorial/backend' },
            { label: 'Working with Databases', translations: { ru: 'Работа с базами данных' }, slug: 'tutorial/databases' },
            { label: 'Routing and Structure', translations: { ru: 'Маршрутизация и структура' }, slug: 'tutorial/routing' },
            { label: 'Bundling', translations: { ru: 'Сборка' }, slug: 'tutorial/bundle' },
            { label: 'Deploying', translations: { ru: 'Развертывание' }, slug: 'tutorial/deploy' },
            { label: 'Next Steps', translations: { ru: 'Дальнейшие шаги' }, slug: 'tutorial/next-steps' },
          ],
        },
        {
          label: 'Core Concepts',
          translations: { ru: 'Основные концепции' },
          items: [
            {
              label: 'Building UI',
              translations: { ru: 'Построение UI' },
              items: [
                { label: 'Introducing RSX', translations: { ru: 'Введение в RSX' }, slug: 'essentials/ui/rsx' },
                { label: 'Elements and Text', translations: { ru: 'Элементы и текст' }, slug: 'essentials/ui/elements' },
                { label: 'Dynamic Attributes', translations: { ru: 'Динамические атрибуты' }, slug: 'essentials/ui/attributes' },
                { label: 'Conditional Rendering', translations: { ru: 'Условный рендеринг' }, slug: 'essentials/ui/conditional' },
                { label: 'Rendering Lists', translations: { ru: 'Рендеринг списков' }, slug: 'essentials/ui/iteration' },
                { label: 'Components', translations: { ru: 'Компоненты' }, slug: 'essentials/ui/components' },
                { label: 'Reconciliation', translations: { ru: 'Реконсиляция' }, slug: 'essentials/ui/render' },
                { label: 'Assets', translations: { ru: 'Ресурсы' }, slug: 'essentials/ui/assets' },
                { label: 'Styling', translations: { ru: 'Стилизация' }, slug: 'essentials/ui/styling' },
                { label: 'Hot-Reload', translations: { ru: 'Горячая перезагрузка' }, slug: 'essentials/ui/hotreload' },
                { label: 'Escape Hatches', translations: { ru: 'Обходные пути' }, slug: 'essentials/ui/escape' },
                { label: 'Head', translations: { ru: 'Head' }, slug: 'essentials/ui/head' },
              ],
            },
            {
              label: 'State & Reactivity',
              translations: { ru: 'Состояние и реактивность' },
              items: [
                { label: 'Intro to Reactivity', translations: { ru: 'Введение в реактивность' }, slug: 'essentials/basics/reactivity' },
                { label: 'Storing State in Hooks', translations: { ru: 'Хранение состояния в Hooks' }, slug: 'essentials/basics/hooks' },
                { label: 'Reactive Signals', translations: { ru: 'Реактивные сигналы' }, slug: 'essentials/basics/signals' },
                { label: 'User Input', translations: { ru: 'Пользовательский ввод' }, slug: 'essentials/basics/event-handlers' },
                { label: 'Async and Futures', translations: { ru: 'Асинхронность и Futures' }, slug: 'essentials/basics/async' },
                { label: 'Data Fetching', translations: { ru: 'Загрузка данных' }, slug: 'essentials/basics/resources' },
                { label: 'Effects and Memos', translations: { ru: 'Эффекты и мемоизация' }, slug: 'essentials/basics/effects' },
                { label: 'Hoisting State', translations: { ru: 'Поднятие состояния' }, slug: 'essentials/basics/hoisting' },
                { label: 'Global Context', translations: { ru: 'Глобальный контекст' }, slug: 'essentials/basics/context' },
                { label: 'Stores and Collections', translations: { ru: 'Хранилища и коллекции' }, slug: 'essentials/basics/collections' },
                { label: 'Error Handling', translations: { ru: 'Обработка ошибок' }, slug: 'essentials/basics/error-handling' },
                { label: 'Suspense', translations: { ru: 'Suspense' }, slug: 'essentials/basics/suspense' },
              ],
            },
            {
              label: 'Fullstack',
              translations: { ru: 'Фулстек' },
              items: [
                { label: 'Project Setup', translations: { ru: 'Настройка проекта' }, slug: 'essentials/fullstack/project-setup' },
                { label: 'Server Side Rendering', translations: { ru: 'SSR' }, slug: 'essentials/fullstack/ssr' },
                { label: 'Server Functions', translations: { ru: 'Серверные функции' }, slug: 'essentials/fullstack/server-functions' },
                { label: 'Custom Error Pages', translations: { ru: 'Страницы ошибок' }, slug: 'essentials/fullstack/errors' },
                { label: 'Router and State (Axum)', translations: { ru: 'Роутер и состояние (Axum)' }, slug: 'essentials/fullstack/axum' },
                { label: 'Middleware', translations: { ru: 'Промежуточное ПО' }, slug: 'essentials/fullstack/middleware' },
                { label: 'Websockets', translations: { ru: 'Веб-сокеты' }, slug: 'essentials/fullstack/websockets' },
                { label: 'Streams and SSE', translations: { ru: 'Потоки и SSE' }, slug: 'essentials/fullstack/streams' },
                { label: 'Forms and Multipart', translations: { ru: 'Формы' }, slug: 'essentials/fullstack/forms' },
                { label: 'Authentication', translations: { ru: 'Аутентификация' }, slug: 'essentials/fullstack/authentication' },
                { label: 'Native Clients', translations: { ru: 'Нативные клиенты' }, slug: 'essentials/fullstack/native' },
                { label: 'HTML Streaming', translations: { ru: 'HTML стриминг' }, slug: 'essentials/fullstack/streaming' },
                { label: 'Static Site Generation', translations: { ru: 'SSG' }, slug: 'essentials/fullstack/ssg' },
              ],
            },
            {
              label: 'Routing',
              translations: { ru: 'Маршрутизация' },
              items: [
                { label: 'Introduction', translations: { ru: 'Введение' }, slug: 'essentials/router/introduction' },
                { label: 'Defining Routes', translations: { ru: 'Определение маршрутов' }, slug: 'essentials/router/routes' },
                { label: 'Navigation', translations: { ru: 'Навигация' }, slug: 'essentials/router/navigation' },
                { label: 'Layouts', translations: { ru: 'Макеты' }, slug: 'essentials/router/layouts' },
                { label: 'Nested Routes', translations: { ru: 'Вложенные маршруты' }, slug: 'essentials/router/nested' },
                { label: 'Redirects', translations: { ru: 'Перенаправления' }, slug: 'essentials/router/redirects' },
              ],
            },
            {
              label: 'Advanced',
              translations: { ru: 'Продвинутые темы' },
              items: [
                { label: 'Custom Hooks', translations: { ru: 'Пользовательские хуки' }, slug: 'essentials/advanced/custom-hooks' },
                { label: 'Component Lifecycle', translations: { ru: 'Жизненный цикл компонента' }, slug: 'essentials/advanced/lifecycle' },
                { label: 'Breaking Out', translations: { ru: 'Выход из абстракции' }, slug: 'essentials/advanced/breaking-out' },
              ],
            },
          ],
        },
        {
          label: 'Guides',
          translations: { ru: 'Руководства' },
          items: [
            {
              label: 'Tools',
              translations: { ru: 'Инструменты' },
              items: [
                { label: 'Create a Project', translations: { ru: 'Создание проекта' }, slug: 'guides/tools/creating' },
                { label: 'Configure Project', translations: { ru: 'Настройка проекта' }, slug: 'guides/tools/configure' },
                { label: 'Translate HTML', translations: { ru: 'Перевод HTML' }, slug: 'guides/tools/translate' },
              ],
            },
            {
              label: 'Platforms',
              translations: { ru: 'Платформы' },
              items: [
                { label: 'Web', slug: 'guides/platforms/web' },
                { label: 'Desktop', translations: { ru: 'Десктоп' }, slug: 'guides/platforms/desktop' },
                { label: 'Mobile', slug: 'guides/platforms/mobile' },
                { label: 'LiveView', slug: 'guides/platforms/liveview' },
              ],
            },
            {
              label: 'Deployment',
              translations: { ru: 'Развертывание' },
              items: [
                { label: 'Overview', translations: { ru: 'Обзор' }, slug: 'guides/deploy' },
                { label: 'Bundle Config', translations: { ru: 'Конфигурация сборки' }, slug: 'guides/deploy/config' },
              ],
            },
            {
              label: 'Testing & Debugging',
              translations: { ru: 'Тестирование и отладка' },
              items: [
                { label: 'Web Testing', translations: { ru: 'Веб-тестирование' }, slug: 'guides/testing/web' },
                { label: 'Debugging', translations: { ru: 'Отладка' }, slug: 'guides/testing/debugging' },
              ],
            },
            {
              label: 'Tips',
              translations: { ru: 'Советы' },
              items: [
                { label: 'Optimizing', translations: { ru: 'Оптимизация' }, slug: 'guides/tips/optimizing' },
                { label: 'Anti-patterns', translations: { ru: 'Антипаттерны' }, slug: 'guides/tips/antipatterns' },
              ],
            },
            {
              label: 'Utilities',
              translations: { ru: 'Утилиты' },
              items: [
                { label: 'Logging', slug: 'guides/utilities/logging' },
                { label: 'Internationalization', translations: { ru: 'Интернационализация' }, slug: 'guides/utilities/i18n' },
                { label: 'Tailwind', slug: 'guides/utilities/tailwind' },
                { label: 'SSR (Low-level)', translations: { ru: 'SSR (низкоуровневый)' }, slug: 'guides/utilities/ssr' },
                { label: 'Custom Renderer', translations: { ru: 'Пользовательский рендерер' }, slug: 'guides/utilities/custom-renderer' },
                { label: 'JavaScript Interop', translations: { ru: 'Интероп с JavaScript' }, slug: 'guides/utilities/eval' },
              ],
            },
            {
              label: 'Examples',
              translations: { ru: 'Примеры' },
              slug: 'guides/examples',
            },
            {
              label: 'Changelog',
              translations: { ru: 'История изменений' },
              slug: 'guides/changelog',
            },
          ],
        },
        {
          label: 'Migration',
          translations: { ru: 'Миграция' },
          items: [
            { label: 'To 0.7', slug: 'migration/to-07' },
            { label: 'To 0.6', slug: 'migration/to-06' },
            { label: 'To 0.5', slug: 'migration/to-05' },
          ],
        },
        {
          label: 'Community',
          translations: { ru: 'Сообщество' },
          items: [
            { label: 'Contributing', translations: { ru: 'Участие в проекте' }, slug: 'beyond/contributing' },
            { label: 'Project Structure', translations: { ru: 'Структура проекта' }, slug: 'beyond/project-structure' },
          ],
        },
      ],
    }),
  ],
});
