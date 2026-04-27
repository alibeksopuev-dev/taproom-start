# TanStack Start — Руководство на русском языке

### На основе проекта `taproom-start` (81 Taproom, Đà Nẵng)

---

## Содержание

1. [Что такое TanStack Start и зачем он нужен](#1-что-такое-tanstack-start-и-зачем-он-нужен)
2. [Как работает SSR в твоём проекте](#2-как-работает-ssr-в-твоём-проекте)
3. [SEO-оптимизация через `head`](#3-seo-оптимизация-через-head)
4. [Route Loaders — серверный префетч данных](#4-route-loaders--серверный-префетч-данных)
5. [Server Functions (`createServerFn`)](#5-server-functions-createserverfn)
6. [SSG — статическая генерация](#6-ssg--статическая-генерация)
7. [File-based routing и типобезопасность](#7-file-based-routing-и-типобезопасность)
8. [Практические задания для изучения](#8-практические-задания-для-изучения)
9. [Как проверить что SSR работает](#9-как-проверить-что-ssr-работает)
10. [Шпаргалка: текущие проблемы в проекте и как их исправить](#10-шпаргалка-текущие-проблемы-и-как-их-исправить)

---

## 1. Что такое TanStack Start и зачем он нужен

**TanStack Start** — это full-stack React-фреймворк поверх TanStack Router. Он добавляет к клиентскому роутингу:

| Возможность      | Без Start (SPA)              | С TanStack Start           |
| ---------------- | ---------------------------- | -------------------------- |
| Рендеринг        | Только в браузере            | Сервер + браузер (SSR)     |
| SEO              | ❌ Боты видят пустой `<div>` | ✅ Боты видят полный HTML  |
| Первая загрузка  | Долгая (нужен JS)            | Быстрая (HTML сразу)       |
| Server Functions | ❌                           | ✅ RPC прямо в компонентах |
| Типобезопасность | Частичная                    | 100% end-to-end            |

В твоём проекте уже используется TanStack Start — об этом говорит структура `src/routes/__root.tsx` с `shellComponent`, `HeadContent` и `Scripts`.

---

## 2. Как работает SSR в твоём проекте

### Что происходит при запросе страницы

```
Браузер запрашивает /
       ↓
Сервер (Node.js / Vite SSR)
  1. Создаёт HTML-документ (RootDocument)
  2. Рендерит React-дерево на сервере
  3. Вставляет <HeadContent /> — title, meta, CSS
  4. Отправляет готовый HTML браузеру
       ↓
Браузер получает полный HTML (виден мгновенно)
       ↓
React "гидратирует" страницу — навешивает события
       ↓
SPA-навигация работает дальше без перезагрузок
```

### Твой `__root.tsx` — точка входа SSR

```tsx
// src/routes/__root.tsx

// shellComponent — это серверный шаблон документа
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "81 Taproom" },
      {
        name: "description",
        content: "Craft beer taproom menu — 81 Taproom, Đà Nẵng",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument, // ← рендерится ТОЛЬКО на сервере
});

function RootDocument({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent /> {/* ← вставляет все meta теги */}
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthInit />
          {children} {/* ← сюда вставляется контент страницы */}
        </QueryClientProvider>
        <Scripts /> {/* ← JS-бандлы для гидратации */}
      </body>
    </html>
  );
}
```

> [!NOTE]
> `shellComponent` отличается от обычного `component` — он управляет всем HTML-документом. Обычные маршруты используют `component` для контента внутри `<body>`.

### Текущая проблема: данные загружаются клиентски

В `src/routes/index.tsx` данные меню грузятся через `useQuery` — это **клиентский** запрос:

```tsx
// ❌ Текущий код — данные недоступны при SSR
function Home() {
  const { data, isLoading } = useQuery(menuQueryOptions()); // запрос в браузере
  // ...
}
```

Пока страница приходит с сервера, `data` = `undefined` и юзер видит спиннер. Это **не настоящий SSR для данных**. Как это исправить — смотри в [Задании 1](#задание-1-добавить-loader-в-роут-index).

---

## 3. SEO-оптимизация через `head`

### Как это работает

TanStack Router позволяет задавать `<head>` теги на **каждом уровне** вложенности роутов. Теги мёржатся сверху вниз: дочерний роут перезаписывает родительский.

```
__root.tsx    → title: "81 Taproom"
  └── index.tsx → title: "81 Taproom — Главная"
  └── category.$categoryId.tsx → title: "IPA Beers — 81 Taproom"
```

### Текущее состояние в проекте

У тебя `head` задан только в `__root.tsx`:

```tsx
// src/routes/__root.tsx ✅ Глобальные мета
head: () => ({
  meta: [
    { title: "81 Taproom" },
    {
      name: "description",
      content: "Craft beer taproom menu — 81 Taproom, Đà Nẵng",
    },
  ],
});
```

Но в `category.$categoryId.tsx` и `index.tsx` нет своих `head` — все страницы имеют одинаковый тайтл. Для SEO это плохо.

### Как добавить динамический `head` в категорию

```tsx
// src/routes/category.$categoryId.tsx

export const Route = createFileRoute("/category/$categoryId")({
  validateSearch: (search) => searchSchema.parse(search),

  // Добавляем loader — получаем данные ДО рендера
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(menuQueryOptions());
    const category = data.categories.find((c) => c.id === params.categoryId);
    return { category };
  },

  // head получает loaderData — данные уже есть!
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.category
          ? `${loaderData.category.name} — 81 Taproom`
          : "81 Taproom",
      },
      {
        name: "description",
        content: loaderData?.category
          ? `Смотри ${loaderData.category.name} в меню 81 Taproom, Đà Nẵng`
          : "Craft beer taproom menu",
      },
    ],
  }),

  component: CategoryView,
});
```

### Open Graph теги (для соцсетей)

```tsx
head: ({ loaderData }) => ({
  meta: [
    { title: `${loaderData.category.name} — 81 Taproom` },
    { name: "description", content: "Beer menu" },
    // Open Graph
    {
      property: "og:title",
      content: `${loaderData.category.name} — 81 Taproom`,
    },
    { property: "og:description", content: "Craft beer in Da Nang" },
    { property: "og:image", content: "https://yoursite.com/og-image.jpg" },
    { property: "og:type", content: "website" },
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
```

---

## 4. Route Loaders — серверный префетч данных

### Что такое loader

`loader` — функция, которая выполняется **до рендера компонента**. В контексте SSR она запускается на сервере, данные попадают в HTML, и компонент рендерится уже с данными — никакого спиннера.

```
Request /category/ipa
   ↓
loader() выполняется на сервере
   ↓
Данные категории получены
   ↓
CategoryView рендерится с данными
   ↓
HTML с контентом отправляется браузеру ✅
```

### Интеграция loader с TanStack Query

Правильный паттерн для твоего стека:

```tsx
// src/routes/category.$categoryId.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { menuQueryOptions } from "#/queries/menu";

export const Route = createFileRoute("/category/$categoryId")({
  // loader — запускается на сервере, заполняет QueryClient кэш
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(menuQueryOptions()),

  component: CategoryView,
});

function CategoryView() {
  // useQuery теперь читает из кэша — нет лишнего запроса!
  // isLoading = false с первого рендера
  const { data } = useQuery(menuQueryOptions());
  // ...
}
```

> [!IMPORTANT]
> Чтобы `context.queryClient` был доступен в loaders, нужно передать его при создании роутера в `src/router.tsx`. Это ключевая настройка — смотри [Задание 1](#задание-1-добавить-loader-в-роут-index).

### Как передать QueryClient в контекст роутера

```tsx
// src/router.tsx
import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  context: {
    queryClient, // ← делает queryClient доступным во всех loaders
  },
  defaultPreload: "intent", // предзагрузка при hover на ссылку
});
```

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

// Описываем тип контекста
interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // ... head, shellComponent
});
```

---

## 5. Server Functions (`createServerFn`)

### Что это и зачем

`createServerFn` — это RPC (Remote Procedure Call) прямо в TypeScript-файле. Ты пишешь функцию с пометкой "серверная", и TanStack Start автоматически:

- На сервере — вызывает её напрямую
- На клиенте — делает HTTP-запрос и получает результат

```
// Вместо: клиент → REST API → база данных
// Получается: компонент → server fn → база данных
```

### Пример: серверная функция для меню

```tsx
// src/queries/menuServer.ts
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "#/lib/supabase";
import { ORGANIZATION_ID } from "#/lib/constants";

// 'use server' директива — этот код НИКОГДА не попадёт в браузер
export const fetchMenuOnServer = createServerFn({ method: "GET" }).handler(
  async () => {
    // Здесь можно использовать process.env, секреты, прямое подключение к БД
    const { data, error } = await supabase
      .from("menu_items")
      .select("*, price_per_size (*), category:categories (*)")
      .eq("organization_id", ORGANIZATION_ID)
      .eq("is_disabled", false);

    if (error) throw error;
    return data;
  },
);
```

```tsx
// В route loader
export const Route = createFileRoute('/')(({
  loader: () => fetchMenuOnServer(), // вызывается на сервере
  component: Home,
})

function Home() {
  const data = Route.useLoaderData() // данные уже в компоненте, без useQuery
}
```

### Разница: с Server Functions vs без

|                            | Текущий код (useQuery) | С createServerFn |
| -------------------------- | ---------------------- | ---------------- |
| Ключ API в браузере        | ✅ Виден               | ❌ Скрыт         |
| Первый рендер              | Спиннер                | Данные сразу     |
| SEO                        | Пустая страница        | Полный HTML      |
| Дополнительный HTTP-запрос | Всегда                 | Нет при SSR      |

---

## 6. SSG — статическая генерация

### Важно понять разницу

|                    | SSR                | SSG                           |
| ------------------ | ------------------ | ----------------------------- |
| Когда генерируется | При каждом запросе | При сборке (`npm run build`)  |
| Данные             | Свежие             | Замороженные на момент сборки |
| Скорость           | Быстро             | Очень быстро (просто файл)    |
| Подходит для       | Динамичный контент | Статичный контент             |

### Подходит ли SSG для taproom-start?

**Частично.** Меню бара меняется редко — можно предгенерировать страницы категорий. Но корзина и заказы — динамические, SSG не подходит.

### Как TanStack Start поддерживает SSG

На момент написания TanStack Start использует подход **"prerendering"** — предрендер страниц при сборке:

```ts
// vite.config.ts (экспериментально)
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      prerender: {
        // Предрендерить эти пути
        routes: ["/", "/category/beer", "/category/wine"],
      },
    }),
  ],
});
```

> [!WARNING]
> Полноценный SSG в TanStack Start ещё в разработке. Для меню бара SSR + кэш (staleTime в QueryClient) даёт похожий результат без сложности SSG.

### Реальная альтернатива SSG: агрессивное кэширование

В твоём `__root.tsx` уже есть:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000 }, // 5 минут кэш
  },
});
```

Для меню бара можно поднять до 30 минут — меню не меняется каждую минуту:

```tsx
// src/queries/menu.ts
export function menuQueryOptions() {
  return queryOptions({
    queryKey: ["menu", ORGANIZATION_ID],
    queryFn: () => fetchMenuData(ORGANIZATION_ID),
    staleTime: 30 * 60 * 1000, // 30 минут
    gcTime: 60 * 60 * 1000, // 1 час в памяти
  });
}
```

---

## 7. File-based routing и типобезопасность

### Как работает маршрутизация

```
src/routes/
├── __root.tsx              → корневой layout (всегда рендерится)
├── index.tsx               → /
├── category.$categoryId.tsx → /category/:categoryId
├── cart.tsx                → /cart
└── order.$orderId.tsx      → /order/:orderId
```

После любого изменения файлов роутов TanStack Router **автоматически** регенерирует `src/routeTree.gen.ts` — это файл с полной типизацией всех маршрутов.

### Типобезопасные параметры

```tsx
// В category.$categoryId.tsx — $categoryId это "параметр"
const { categoryId } = Route.useParams();
// categoryId: string — TypeScript знает об этом параметре!

// В index.tsx с validateSearch
const { search } = Route.useSearch();
// search: string | undefined — типизировано через zod-схему
```

### Навигация с полной типизацией

```tsx
import { Link, useNavigate } from "@tanstack/react-router";

// TypeScript проверит, что '/category/$categoryId' существует
// и что params.categoryId — обязательный string
<Link to="/category/$categoryId" params={{ categoryId: "beer" }}>
  Пиво
</Link>;

// useNavigate тоже типизирован
const navigate = useNavigate();
navigate({ to: "/cart" }); // ✅
navigate({ to: "/nonexistent" }); // ❌ TypeScript ошибка
```

---

## 8. Практические задания для изучения

### Задание 1: Добавить `loader` в роут `index`

**Цель:** Понять как loader убирает спиннер и ускоряет первый рендер

**Что сделать:**

1. Настроить `RouterContext` с `QueryClient` в `router.tsx`
2. Изменить `__root.tsx` на `createRootRouteWithContext`
3. Добавить `loader` в `index.tsx`:

```tsx
loader: ({ context: { queryClient } }) =>
  queryClient.ensureQueryData(menuQueryOptions()),
```

4. Открыть DevTools → Network → проверить, что на странице нет лишнего запроса к Supabase при первой загрузке

**Как проверить:** Отключи JavaScript в браузере (DevTools → Settings → Disable JS). Страница всё равно должна показывать меню.

---

### Задание 2: SEO для страниц категорий

**Цель:** Научиться управлять `<head>` тегами динамически

**Что сделать:**

1. Добавить `head` в `category.$categoryId.tsx` с динамическим тайтлом
2. Добавить Open Graph теги
3. Проверить результат

**Как проверить:**

```bash
# Просмотр HTML с сервера (без JS)
curl http://localhost:3000/category/beer | grep -E "<title>|<meta"
```

Ты должен увидеть динамический тайтл прямо в HTML-ответе сервера.

---

### Задание 3: Создать Server Function для заказа

**Цель:** Понять `createServerFn` и как скрыть логику на сервере

**Что сделать:**

```tsx
// src/actions/order.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderSchema = z.object({
  tableNumber: z.number(),
  items: z.array(z.object({ id: z.string(), qty: z.number() })),
});

export const submitOrder = createServerFn({ method: "POST" })
  .validator(orderSchema)
  .handler(async ({ data }) => {
    // Здесь: валидация, запись в Supabase, отправка уведомления
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ table_number: data.tableNumber, status: "pending" })
      .select()
      .single();

    if (error) throw error;
    return order;
  });
```

Вызов из компонента корзины — точно так же как обычная функция!

---

### Задание 4: Streaming SSR для страницы заказа

**Цель:** Понять как Suspense + SSR работают вместе

**Что сделать:**

```tsx
// src/routes/order.$orderId.tsx
import { Suspense } from "react";

export const Route = createFileRoute("/order/$orderId")({
  component: () => (
    <Suspense fallback={<div>Загрузка заказа...</div>}>
      <OrderDetails />
    </Suspense>
  ),
});
```

При SSR + Suspense сервер **стримит** HTML — сначала отправляет оболочку с fallback, потом добирасывает данные. Юзер видит что-то быстрее.

---

### Задание 5: Prefetch при hover

**Цель:** Понять как TanStack Router ускоряет навигацию

**Что сделать:**

```tsx
// src/router.tsx
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent", // ← prefetch при наведении мыши
  defaultPreloadStaleTime: 0,
});
```

**Как проверить:** Открой Network tab, наведи мышь на категорию — увидишь запрос к Supabase ещё до клика.

---

### Задание 6: Middleware — проверка авторизации

**Цель:** Понять серверный middleware в TanStack Start

**Что сделать:**

```tsx
// src/middleware/auth.ts
import { createMiddleware } from "@tanstack/react-start";

export const authMiddleware = createMiddleware().server(
  async ({ next, data }) => {
    const session = await getServerSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return next({ context: { user: session.user } });
  },
);

// Применить к роуту:
export const Route = createFileRoute("/admin")({
  middleware: [authMiddleware],
  component: AdminPage,
});
```

---

## 9. Как проверить что SSR работает

### Метод 1: curl (самый надёжный)

```bash
# Запусти dev сервер
npm run dev

# В другом терминале — запроси страницу без JS
curl http://localhost:3000/ | grep -c "data-"
# Если SSR работает — увидишь контент в HTML
```

### Метод 2: Отключить JS в браузере

1. Chrome DevTools → три точки → Settings
2. Preferences → Debugger → "Disable JavaScript"
3. Перезагрузи страницу — контент должен быть виден

### Метод 3: View Source

- Правый клик → View Page Source (не Inspect!)
- Ищи данные меню в HTML — если SSR работает, они там есть

### Метод 4: Lighthouse SEO аудит

```bash
# Установи lighthouse глобально
npm install -g lighthouse

# Запусти аудит
lighthouse http://localhost:3000 --only-categories=seo,performance
```

---

## 10. Шпаргалка: текущие проблемы и как их исправить

| Проблема                                 | Текущий код                  | Решение                                                                      |
| ---------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| Данные загружаются клиентски             | `useQuery()` без `loader`    | Добавить `loader: ({ context }) => context.queryClient.ensureQueryData(...)` |
| Одинаковый тайтл на всех страницах       | `head` только в `__root.tsx` | Добавить `head` в каждый роут                                                |
| QueryClient не в контексте роутера       | Создан в `__root.tsx`        | Перенести в `router.tsx` и добавить `context: { queryClient }`               |
| `__root.tsx` не типизирован по контексту | `createRootRoute`            | Заменить на `createRootRouteWithContext<{ queryClient: QueryClient }>()`     |

---

## Полезные ссылки

- [TanStack Start Docs](https://tanstack.com/start/latest/docs)
- [TanStack Router — Loaders](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- [TanStack Router — SEO / Head](https://tanstack.com/start/latest/docs/framework/react/guide/seo)
- [Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Query — queryOptions](https://tanstack.com/query/latest/docs/framework/react/reference/queryOptions)

Что было сделано
Задание 1 — Loader + RouterContext
Проблема была: данные меню загружались только в браузере (через useQuery). Сервер отдавал пустую страницу → пользователь видел крутилку.

Три изменения:

1. src/router.tsx — QueryClient перенесён сюда и передан в context роутера:

context: { queryClient }
Теперь все loaders в любом роуте могут обращаться к context.queryClient.

2. src/routes/\_\_root.tsx — заменён createRootRoute на createRootRouteWithContext<RouterContext>(). Это говорит TypeScript: "в контексте роутера точно есть queryClient типа QueryClient". queryClient теперь импортируется из router.tsx, а не создаётся локально.

3. src/routes/index.tsx и src/routes/category.$categoryId.tsx — добавлен loader:

loader: ({ context: { queryClient } }) =>
queryClient.ensureQueryData(menuQueryOptions())
ensureQueryData — если данные уже есть в кеше, берёт оттуда. Если нет — делает запрос на сервере. Когда компонент рендерится, useQuery читает уже готовый кеш → isLoading = false с первого рендера, крутилки нет.

Задание 2 — Динамический SEO head
Проблема была: все страницы имели одинаковый <title>81 Taproom</title>.

В src/routes/category.$categoryId.tsx добавлен head, который получает данные из loaderData:

/category/beer → <title>Beer — 81 Taproom</title>
/category/wine → <title>Wine — 81 Taproom</title>
Плюс добавлены og:title и og:description для корректного отображения при шаринге в соцсетях.

Итог: страница теперь рендерится на сервере с данными, крутилка при первой загрузке пропала, у каждой категории свой тайтл в браузере и для поисковиков.
