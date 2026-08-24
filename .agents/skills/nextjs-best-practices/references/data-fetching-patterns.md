# Data Fetching and Server State Patterns

Choose the repository's existing router and data layer first. QSI feature modules use centralized Axios services plus TanStack Query for interactive client state; App Router Server Components may fetch initial read data directly.

## Decision Matrix

| Context | Preferred pattern |
|---|---|
| App Router initial server-rendered read | Fetch in an async Server Component |
| Client-side read, polling, filters, or refetch | TanStack Query `useQuery` / `useInfiniteQuery` |
| Client-side create/update/delete | TanStack Query `useMutation` calling a service function |
| Pages Router SSR/SSG | Existing `getServerSideProps` / `getStaticProps` pattern |
| External API/webhook endpoint | App Router Route Handler or Pages API route |
| Shared browser HTTP call | `src/services/[feature].api.ts` using the centralized Axios `instance` |

Do not call the backend directly from presentational components. Do not create a Route Handler merely to proxy an API already reachable through the established Axios service.

## Centralized Service

```typescript
import { instance } from './interceptor';
import type { IFeatureDAO } from '@/modules/Feature/DAO/feature.dao';
import type { IFeatureDTO } from '@/modules/Feature/DTO/feature.dto';

export async function getFeatureAPI(id: string): Promise<IFeatureDAO> {
  const { data } = await instance.get<IFeatureDAO>(`/features/${id}`);
  return data;
}

export async function submitFeatureAPI(payload: IFeatureDTO): Promise<IFeatureDAO> {
  const { data } = await instance.post<IFeatureDAO>('/features', payload);
  return data;
}
```

The interceptor owns base URL and bearer-token injection. Never duplicate auth headers in every service function.

## TanStack Query v5

```tsx
const detailQuery = useQuery({
  queryKey: ['feature', 'detail', id],
  queryFn: () => getFeatureAPI(id),
  enabled: Boolean(id),
});

const mutation = useMutation({
  mutationFn: submitFeatureAPI,
  onSuccess: (saved) => {
    queryClient.setQueryData(['feature', 'detail', saved.id], saved);
    queryClient.invalidateQueries({ queryKey: ['feature', 'list'] });
  },
});
```

- Include every query input in `queryKey`.
- Use `enabled` when required inputs may be absent.
- Invalidate or update only related keys after mutation.
- Use `isPending` for mutation state in TanStack Query v5.
- Keep server state in TanStack Query; use Zustand only for client-owned state.

## Prevent Waterfalls

Start independent server requests together:

```tsx
export default async function DashboardPage() {
  const [profile, permissions] = await Promise.all([
    getProfile(),
    getPermissions(),
  ]);

  return <Dashboard profile={profile} permissions={permissions} />;
}
```

Use separate `Suspense` boundaries when independent sections should stream. Keep sequential requests only when the second request truly depends on the first result.

## Error Handling

Let the centralized interceptor normalize cross-cutting authentication behavior. Handle feature-specific messages in the container and avoid `any` where the repository has a typed API error shape.

```tsx
onError: (error: AxiosError<{ message?: string }>) => {
  toast.error(error.response?.data.message ?? 'Gagal menyimpan data');
}
```
