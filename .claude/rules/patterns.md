---
description: Core architectural patterns for Okron Web. Loaded in all sessions. Enforces the service/hook/store/page structure and prevents anti-patterns.
---

# Okron Web — Core Patterns

## Data flow

```
page.tsx (renders only)
    ↓ imports
Feature Component (UI + interaction)
    ↓ calls
Custom Hook (use*.ts) — data fetching, local state
    ↓ calls
Service class (*Service.ts) — fetch() calls to the API
```

**Never bypass this chain.** A `page.tsx` must not call a service directly. A component must not call `fetch()` directly.

## Service class — Singleton

```typescript
class SparePartService {
  private static instance: SparePartService;
  private baseUrl: string;

  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  public static getInstance(baseUrl?: string): SparePartService {
    if (!SparePartService.instance && baseUrl) {
      SparePartService.instance = new SparePartService(baseUrl);
    }
    return SparePartService.instance;
  }
}

export const sparePartService = SparePartService.getInstance(
  process.env.NEXT_PUBLIC_API_BASE_URL!
);
```

Key rules:
- One singleton per entity, exported at file bottom.
- Every method: `try/catch` → `console.error` → rethrow.
- Always check `response.ok` before `.json()`.
- Handle `204 No Content` before calling `.json()` (returns `[]` or `undefined`).
- Explicit return types on every method.

## Custom hook — SWR (list/read data)

```typescript
export const useSparePartHook = () => {
  const { data: spareParts, error, mutate } = useSWR<SparePart[]>(
    'spareParts',
    () => sparePartService.getAll(),
    { revalidateOnFocus: false, revalidateIfStale: false, revalidateOnReconnect: false }
  );
  return { spareParts, error, mutate };
};
```

Key rules:
- SWR key must be a unique string (`'spareParts'`, `'operators'`, etc.).
- Disable revalidation flags unless there is a specific reason to enable.
- Use the exported service singleton — never instantiate inside the hook.

## Custom hook — useState (mutable state / write operations)

```typescript
export const useConfig = () => {
  const { config, setConfig } = useSessionStore(state => ({
    config: state.config,
    setConfig: state.setConfig,
  }));

  useEffect(() => {
    if (!config) refreshConfig();
  }, [config]);

  return { config, ... };
};
```

## Zustand stores — never create new stores

Two stores exist in `app/stores/globalStore.ts`:
- `useSessionStore` — user session, filters, config. Persisted to `sessionStorage`. Cleared on new build version.
- `useGlobalStore` — ephemeral UI state (modal open, scroll lock).

If new global state is needed, add it to an existing store — do not create a new store file.

## Page — composition only

```typescript
'use client';

import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import FeatureComponent from './components/FeatureComponent';

function FeaturePage() {
  return (
    <MainLayout>
      <Container>
        <FeatureComponent />
      </Container>
    </MainLayout>
  );
}

export default FeaturePage;
```

Pages must not contain: data fetching, business logic, useState, useEffect, or service calls.

## Environment variables

- `process.env.NEXT_PUBLIC_API_BASE_URL` — includes trailing slash. Always use this.
- `process.env.NEXT_PUBLIC_BUILD_VERSION` — auto-generated. Do not read manually.
- Never hardcode API base URLs or host names.
