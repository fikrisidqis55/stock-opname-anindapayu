# Next.js & Frontend Specialist

A comprehensive frontend engineering skill for building **enterprise-grade Next.js applications** using the Quadrant-SI internal web boilerplate stack — based on the reference frontend architecture (`zurich.agent.pro.web`).

## What it does

- Enforces modular feature architecture: `src/modules/[FeatureName]/` (`Component/`, `Container/`, `DAO/`, `DTO/`, `Validation/`)
- Integrates `src/services/interceptor.ts` (Axios instance with request/response interceptors & Bearer token injection)
- Enforces strict TypeScript interfaces: `I[Feature]DAO` (API response payloads) and `I[Feature]DTO` (API request payloads)
- Applies TanStack Query v5 (`useQuery`, `useMutation`, `useInfiniteQuery`) for server state management
- Integrates React Hook Form + Zod (`zodResolver`) for type-safe form validation with Ant Design 5 & MUI v5 UI components
- Configures Zustand for client-side global and feature state management

## When to use

Activate this skill when you want to:
- Build a new feature module in `src/modules/[FeatureName]/`
- Create smart container components (`Container/`) and presentational UI components (`Component/`)
- Define API contract interfaces: `DAO/` for responses and `DTO/` for request payloads
- Implement API caller functions in `src/services/[feature].api.ts` using the centralized `interceptor.ts`
- Build form validation with React Hook Form + Zod schema + Ant Design / MUI
- Manage server state with TanStack Query or client state with Zustand

## Example prompts

```
Build a feature module for [FeatureName] with Component, Container, DAO, DTO, and Validation
```
```
Create a smart container component with useQuery and React Hook Form
```
```
Setup an API service function in src/services/[feature].api.ts returning Promise<I[Feature]DAO>
```
```
Create Zod validation schema for I[Feature]DTO request payload
```

## Solution Architecture Reference

| Layer / Folder | Role | Key Technologies & Conventions |
|----------------|------|-------------------------------|
| `modules/[Feature]/Component/` | Presentational UI | Ant Design 5, MUI v5, Pure UI (dumb props) |
| `modules/[Feature]/Container/` | Smart Container | React Hook Form, TanStack Query (`useQuery`/`useMutation`) |
| `modules/[Feature]/DAO/` | API Response Interface | `I[Feature]DAO` (backend payload type) |
| `modules/[Feature]/DTO/` | API Request Interface | `I[Feature]DTO` (request payload type) |
| `modules/[Feature]/Validation/` | Schema Validation | Zod (`z.infer`, `zodResolver`) |
| `services/` | API Callers & Auth | Axios `instance` with Bearer token interceptor |
| `store/` | Client Global State | Zustand |

## Supported agents

Works with any AI agent platform that supports the universal `.agents/skills/` spec: Antigravity, Cursor, Claude Code, Cline, Windsurf, Copilot, Roo, Continue, AMP, Codex, and more.
