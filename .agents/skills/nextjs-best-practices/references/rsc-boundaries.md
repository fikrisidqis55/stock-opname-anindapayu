# React Server Components and App Router Boundaries

Inspect `package.json` and determine whether the target uses App Router or Pages Router before applying these rules. App Router files are Server Components by default; Pages Router components use the traditional client rendering model.

## Place the Boundary at Interactive Leaves

Add `'use client'` only when a component needs hooks, event handlers, browser APIs, or client-only libraries. Everything imported below that file joins the client bundle.

```tsx
// app/users/[id]/page.tsx — Server Component
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  return <UserProfile user={{ ...user, createdAt: user.createdAt.toISOString() }} />;
}
```

```tsx
// UserProfile.tsx — Client Component
'use client';

export function UserProfile({ user }: { user: UserDAO }) {
  return <button onClick={() => console.log(user.id)}>{user.name}</button>;
}
```

Client Components cannot be `async`. Fetch in a Server Component, use TanStack Query, or read promise props with React `use` when the App Router page itself must be a Client Component.

## Next.js 15/16 Async Request APIs

In Server Components, await dynamic request values:

```tsx
import { cookies, headers } from 'next/headers';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query?: string }>;
}) {
  const { id } = await params;
  const { query } = await searchParams;
  const cookieStore = await cookies();
  const headersList = await headers();

  return <div data-agent={headersList.get('user-agent')}>{id}: {query ?? cookieStore.get('query')?.value}</div>;
}
```

For Next.js 14 repositories, preserve the synchronous API shape already used by that version instead of copying a Next.js 15/16 signature blindly.

## Router-Specific APIs

| Need | App Router | Pages Router |
|---|---|---|
| Navigation hook | `next/navigation` | `next/router` |
| Server page data | Async Server Component | `getServerSideProps` / `getStaticProps` |
| API endpoint | `app/api/**/route.ts` | `pages/api/**` |
| Metadata | `metadata` / `generateMetadata` in Server Component | `next/head` |

Never export `metadata` from a file marked `'use client'`; keep it in a Server Component parent.

## Server-to-Client Props

Use the stricter QSI boundary rule so API and UI contracts remain plain JSON.

| Value | QSI boundary action |
|---|---|
| Plain object, array, string, number, boolean, null | Pass directly |
| `Date` | Convert with `.toISOString()` |
| `Map` / `Set` | Convert to object / array |
| Class instance | Map to a plain DAO/DTO object |
| Event handler or callback | Define inside the Client Component |
| Server Action | Pass only when the repository already uses `'use server'` |

## Hydration Safety

Do not render `window`, `localStorage`, locale-dependent current time, random values, or DOM measurements during the initial server render. Read them after mount or behind a client-only boundary while keeping the first server and client output identical.

```tsx
'use client';

export function StoredTheme() {
  const [theme, setTheme] = useState<string>();
  useEffect(() => setTheme(localStorage.getItem('theme') ?? 'light'), []);
  return <span>{theme ?? 'light'}</span>;
}
```

Do not use `suppressHydrationWarning` as a general fix; identify and remove the mismatched value.
