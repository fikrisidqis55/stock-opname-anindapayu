---
name: nextjs-best-practices
description: Quadrant-SI Next.js & Frontend Specialist — comprehensive Next.js 14/15/16 App/Pages Router rules (RSC boundaries, async params, data patterns, hydration error prevention, image/font optimization) combined with internal Enterprise Web Boilerplate Stack (Ant Design 5, MUI v5, TanStack Query v5, React Hook Form + Zod, Zustand, Axios interceptors, and Modular Feature Architecture with Component/Container/DAO/DTO/Validation).
---

# Next.js & Frontend Specialist (Enterprise Web Stack)

You are a specialist Frontend Engineer for **Quadrant-SI**. Apply these comprehensive Next.js best practices and internal Enterprise Web Boilerplate conventions whenever writing, refactoring, or reviewing Next.js frontend code.

> **Activation:** Triggered on requests to write Next.js components, build frontend feature modules, debug React hydration/RSC errors, or refactor Web code.

---

## 🔍 Core Directive: Analyze Repository Context

Before writing code or scaffolding components, inspect the existing project repository:
1. Determine whether the project uses **Next.js App Router** (`src/app/`) or **Next.js Pages Router** (`src/pages/`).
2. Verify the project's web stack versions (`package.json`) and existing folder structures (`src/modules/`).
3. Follow established QSI naming conventions (`PascalCase` for components, `camelCase` for hooks/utilities).

---

## ⛔ Monorepo Safety Guardrail: Scoped Web Application Code

1. 🎯 **SCOPED TO FRONTEND CODEBASE:** Focus edits strictly inside the Web application directory (`src/modules/`, `src/components/`, `src/services/`, `src/store/`, `src/pages/`, `src/app/`).
2. ❌ **READ-ONLY FOR OTHER DOMAINS:** Never edit SQA Katalon automation files (`Test Cases/`, `Object Repository/`) or .NET backend services (`.cs`) unless explicitly requested.

---

## ⚠️ Common AI Hallucination Traps

Do NOT introduce any of the following commonly hallucinated patterns in Next.js repositories:

| Hallucination | Reality in Next.js App Router | Correct Action |
|---------------|-------------------------------|----------------|
| `getServerSideProps` / `getStaticProps` | Pages Router only (forbidden in App Router) | Fetch directly inside async Server Components |
| `import { useRouter } from 'next/router'` | Pages Router import | Import from `'next/navigation'` in App Router |
| Un-awaited `cookies()` / `headers()` | Next.js 15+ async requirement | Always use `const cookieStore = await cookies()` |
| Un-awaited `params` / `searchParams` | Next.js 15+ async requirement | Always `await params` in Page/Layout props |
| `export const metadata` in `'use client'` | Invalid in Client Components | Move `metadata` export to Server Component parent |
| `async` function on `'use client'` component | Runtime error in React | Client Components CANNOT be async |
| Passing functions / `Date` across RSC boundary | Non-serializable props runtime error | Convert `Date` to `.toISOString()`, keep functions in Client |

---

## 🚫 Out of Scope

This skill handles Next.js and frontend React code. It does NOT handle:
- .NET Core backend controllers or ORM mappings → Use `dotnet-core-expert`
- Katalon test automation or scripts → Use `katalon-test-generator`
- CI/CD pipeline or Docker container setup → Use `katalon-ci-cd-pipeline`

---

## 🛠️ Enterprise Web Technology Stack Reference

| Library | Version | Role / Purpose |
|---------|---------|----------------|
| `next` | ^14 / ^15 / ^16 | Primary Web Framework (App / Pages Router) |
| `react` / `react-dom` | ^18 / ^19 | UI Core Library |
| `antd` | ^5.22.5 | Primary UI Component Library |
| `@mui/material` | ^5.16.5 | Secondary UI Component Library |
| `@tanstack/react-query` | ^5.56.2 | Server State & Data Fetching (`useQuery`, `useMutation`, `useInfiniteQuery`) |
| `react-hook-form` | ^7.63.0 | Form State Management |
| `@hookform/resolvers` | ^3.9.0 | RHF + Zod Integration (`zodResolver`) |
| `zod` | ^3.23.8 | Schema Validation |
| `zustand` | ^4.5.4 | Client State Management |
| `axios` | ^1.7.2 | HTTP Client with Auth Interceptor (`interceptor.ts`) |
| `dayjs` | ^1.11.13 | Date Utility |
| `react-toastify` | ^10.0.5 | Toast Notifications |
| `tailwindcss` | ^3.4.1 | Utility CSS Styling |

---

## 📁 Modular Feature Architecture (`src/modules/[FeatureName]/`)

All feature logic MUST be structured **modularly by feature**:

```
src/
├── components/         # Shared/reusable UI components (buttons, navbar, modal)
├── helpers/            # Pure utility functions (date formatters, regex, number format)
├── hooks/              # Custom React hooks
├── modules/            # Feature modules (main business logic)
│   └── [FeatureName]/
│       ├── Component/  # Presentational UI components (dumb, receives props)
│       ├── Container/  # Smart container components (logic, state, useQuery/useMutation)
│       ├── DAO/        # Data Access Objects — API Response TypeScript interfaces (I[Feature]DAO)
│       ├── DTO/        # Data Transfer Objects — API Request Payload interfaces (I[Feature]DTO)
│       └── Validation/ # Zod validation schemas ([feature].schema.ts)
├── services/           # Axios API caller functions (axios instance from interceptor.ts)
├── store/              # Global Zustand store
└── types/              # Global TypeScript interfaces
```

---

## ⚡ Service & Axios Interceptor Pattern (`src/services/`)

### 1. Centralized Interceptor (`src/services/interceptor.ts`)
```typescript
import axios from 'axios';
import getConfig from 'next/config';
import Store, { IStore } from 'store';

const { publicRuntimeConfig } = getConfig();

export const instance = axios.create({
  baseURL: publicRuntimeConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async (config: any) => {
    const state: IStore = Store.getState();
    const unAuthenticatedUrls = ['auth/login', 'config/get'];

    if (unAuthenticatedUrls.indexOf(config.url) === -1 && state.token) {
      config.headers['Authorization'] = `Bearer ${state.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 2. API Caller Function (`src/services/[feature].api.ts`)
```typescript
import { instance } from './interceptor';
import { I[Feature]DAO } from 'modules/[FeatureName]/DAO/[feature].dao';
import { I[Feature]DTO } from 'modules/[FeatureName]/DTO/[feature].dto';

export async function Submit[Feature]API(payload: I[Feature]DTO): Promise<I[Feature]DAO> {
  const { data } = await instance.post('/[endpoint]', payload);
  return data;
}

export async function Get[Feature]API(id: string): Promise<I[Feature]DAO> {
  const { data } = await instance.get(`/[endpoint]/${id}`);
  return data;
}
```

---

## 📝 Modular Component & Container Pattern

### 1. DAO & DTO Type Declarations (`src/modules/[FeatureName]/DAO/[feature].dao.ts`)
```typescript
export interface I[Feature]DAO {
  id: string;
  code: string;
  name: string;
  status: string;
  createdAt: string;
}
```

### 2. Validation Schema (`src/modules/[FeatureName]/Validation/[feature].schema.ts`)
```typescript
import { z } from 'zod';

export const [feature]Schema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
});

export type I[Feature]FormData = z.infer<typeof [feature]Schema>;
```

### 3. Container Component (`src/modules/[FeatureName]/Container/[Feature]Container.tsx`)
Smart container handling logic, TanStack Query, and state management:

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { [Feature]Component } from '../Component/[Feature]Component';
import { [feature]Schema, I[Feature]FormData } from '../Validation/[feature].schema';
import { Submit[Feature]API, Get[Feature]API } from 'services/[feature].api';

export function [Feature]Container({ id }: { id: string }) {
  const { control, handleSubmit, formState: { errors } } = useForm<I[Feature]FormData>({
    resolver: zodResolver([feature]Schema),
    defaultValues: { name: '', email: '' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['[feature]-detail', id],
    queryFn: () => Get[Feature]API(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: Submit[Feature]API,
    onSuccess: () => {
      toast.success('Data berhasil disimpan');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    },
  });

  const onSubmit = (formData: I[Feature]FormData) => {
    mutation.mutate({
      name: formData.name,
      email: formData.email,
    });
  };

  return (
    <[Feature]Component
      control={control}
      errors={errors}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading || mutation.isPending}
      detailData={data}
    />
  );
}
```

### 4. Presentational Component (`src/modules/[FeatureName]/Component/[Feature]Component.tsx`)
Pure UI presentation layer using Ant Design / MUI:

```tsx
'use client';

import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Form, Input, Button, Card, Spin } from 'antd';
import { I[Feature]FormData } from '../Validation/[feature].schema';
import { I[Feature]DAO } from '../DAO/[feature].dao';

interface Props {
  control: Control<I[Feature]FormData>;
  errors: FieldErrors<I[Feature]FormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  detailData?: I[Feature]DAO;
}

export function [Feature]Component({ control, errors, onSubmit, isLoading, detailData }: Props) {
  return (
    <Card title="Form Data" className="max-w-xl mx-auto my-6">
      {isLoading ? (
        <Spin className="block my-8" />
      ) : (
        <Form layout="vertical" onFinish={onSubmit}>
          <Form.Item
            label="Nama"
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Masukkan nama" />}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Masukkan email" />}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Simpan
          </Button>
        </Form>
      )}
    </Card>
  );
}
```

---

## ⚛️ React Server Components (RSC) & Boundary Rules

### 1. Client Components CANNOT Be Async Functions
Client Components (`'use client'`) must NEVER be declared as `async` functions or return a `Promise`.

### 2. Props Passed Server → Client MUST Be JSON-Serializable
Props passed across RSC boundaries must be serializable. Convert `Date` to `.toISOString()`.

---

## 📋 Code Review Verification Checklist

- [ ] Repository architecture inspected (`src/modules/[FeatureName]/`)
- [ ] Feature module organized into `Component/`, `Container/`, `DAO/`, `DTO/`, `Validation/`
- [ ] API responses typed with `I[Feature]DAO` and requests typed with `I[Feature]DTO`
- [ ] API calls routed via `services/[feature].api.ts` using `instance` from `interceptor.ts`
- [ ] Forms implemented with React Hook Form + Zod (`zodResolver`) + Ant Design / MUI
- [ ] Server state handled via TanStack Query (`useQuery`, `useMutation`, `useInfiniteQuery`)
- [ ] Client state handled via Zustand global/feature store
- [ ] TypeScript type safety verified with `npx tsc --noEmit`

---

## 📚 References

- See `references/rsc-boundaries.md` for RSC boundaries & prop serialization.
- See `references/data-fetching-patterns.md` for decision tree & parallel data fetching.
- See `examples/feature.schema.ts` for the Zod form schema and inferred form type.
- See `examples/feature.dao.ts` and `examples/feature.dto.ts` for response and request contracts.
- See `examples/feature.api.ts` for a centralized Axios service function.
- See `examples/FeatureContainer.tsx` for the TanStack Query + React Hook Form smart container.
- See `examples/FeatureComponent.tsx` for the Ant Design presentational component.
