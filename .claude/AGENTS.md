# Okron Web — Claude Code Instructions

## Product Context

Okron Web is the frontend for a CMMS SaaS (Computerized Maintenance Management System). It communicates with Okron.API (a .NET 8 + MongoDB backend) via REST.

**Core domain:** Asset tree, Work Orders (corrective, preventive, predictive), spare parts, purchase orders, invoicing, operators, time tracking, budgets, and e-invoicing (Verifactu/Spain).

---

## Tech Stack

- **Next.js 14.2.4** — App Router with `(pages)` route groups
- **React 18** + **TypeScript 4.8**
- **Tailwind CSS 3** — primary styling
- **MUI v7** (`@mui/material`) — used alongside Tailwind for complex components (DataGrid, DatePicker, etc.)
- **Zustand 4** — global and session state
- **SWR 2** — data fetching with caching
- **react-hook-form 7** — form handling
- **Native `fetch`** — no axios. All API calls use `fetch`
- **Netlify** — deployment target

---

## Project Structure

```
src/
├── app/
│   ├── (pages)/          ← Next.js App Router pages (route groups, one folder per feature)
│   │   └── {feature}/
│   │       ├── page.tsx             ← page entry, 'use client', minimal logic
│   │       └── components/
│   │           └── {Feature}*.tsx   ← feature-specific components
│   ├── hooks/            ← custom hooks (use*.ts), SWR-based or useState-based
│   ├── interfaces/       ← TypeScript interfaces/types (one file per domain entity)
│   ├── services/         ← API service classes (Singleton pattern, one file per entity)
│   ├── stores/           ← Zustand stores (globalStore.ts)
│   ├── types/            ← Type aliases for shared filter/sort types
│   └── utils/            ← Pure utility functions
├── components/           ← Shared UI components
│   └── layout/           ← MainLayout, Container, Header, SideNav
├── designSystem/         ← Primitive UI building blocks (Button, BarChart, Modals…)
└── lib/
    └── utils.ts          ← cn() helper (clsx + tailwind-merge)
```

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Page file | `page.tsx` in `(pages)/{feature}/` | `(pages)/corrective/page.tsx` |
| Feature component | PascalCase in `components/` subfolder | `GenerateCorrective.tsx` |
| Service class | `*Service` in `app/services/` | `WorkOrderService`, `workOrderService.ts` |
| Custom hook | `use*` in `app/hooks/` | `useOperatorHook.ts` |
| Interface | PascalCase in `app/interfaces/` | `WorkOrder.ts`, `SparePart.ts` |
| Zustand store | `use*Store` in `app/stores/` | `useSessionStore`, `useGlobalStore` |
| CSS utility | `cn()` from `lib/utils.ts` | `cn('flex', isActive && 'bg-blue-500')` |
| Private class fields | `this.baseUrl`, no underscore prefix | |
| Variables | camelCase, full words | `workOrder`, not `wo` |

---

## Architecture Patterns

### Service classes — Singleton
All API calls go through service classes in `app/services/`. Each class is a Singleton instantiated with `process.env.NEXT_PUBLIC_API_BASE_URL`.

```typescript
class WorkOrderService {
  private static instance: WorkOrderService;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public static getInstance(baseUrl?: string): WorkOrderService {
    if (!WorkOrderService.instance && baseUrl) {
      WorkOrderService.instance = new WorkOrderService(baseUrl);
    }
    return WorkOrderService.instance;
  }

  async getWorkOrderById(id: string): Promise<WorkOrder | undefined> {
    try {
      const response = await fetch(`${this.baseUrl}workorder/${id}`);
      if (!response.ok) throw new Error('Failed to fetch WorkOrder');
      return response.json();
    } catch (error) {
      console.error('Error fetching WorkOrder:', error);
      throw error;
    }
  }
}

export const workOrderService = WorkOrderService.getInstance(
  process.env.NEXT_PUBLIC_API_BASE_URL!
);
```

### Custom hooks — data fetching layer
Hooks wrap SWR or useState+useEffect. They live in `app/hooks/` and are the primary way components access data.

```typescript
// SWR pattern (preferred for list/read data)
export const useOperatorHook = () => {
  const { data: operators, error, mutate } = useSWR<Operator[]>(
    'operators',
    () => operatorService.getOperators(),
    { revalidateOnFocus: false, revalidateIfStale: false, revalidateOnReconnect: false }
  );
  return { operators, error, mutate };
};

// useState pattern (for mutable state + side effects)
export const useConfig = () => {
  const { config, setConfig } = useSessionStore(state => ({ ... }));
  useEffect(() => { if (!config) refreshConfig(); }, [config]);
  return { config, ... };
};
```

### Zustand stores — global state
Two stores in `app/stores/globalStore.ts`:
- `useSessionStore` — persisted in `sessionStorage` (user, filters, config). Clears on build version change.
- `useGlobalStore` — ephemeral UI state (modal open, scroll).

New state goes into one of these stores. Do not create additional store files without explicit approval.

### Interfaces — TypeScript types
All domain entities are `interface` (not `type`) in `app/interfaces/`. Domain entities extend `BaseModel` (`id`, `creationDate`, `active`).

```typescript
export interface MyEntity extends BaseModel {
  id: string;
  name: string;
  // ...
}
export default MyEntity;
```

Request/create/update shapes live in the same file as the entity interface.

### Pages — minimal, composition only
Pages are `'use client'`, import `MainLayout` + `Container`, and delegate to feature components. No business logic in `page.tsx`.

```typescript
'use client';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import MyFeatureComponent from './components/MyFeatureComponent';

function MyFeaturePage() {
  return (
    <MainLayout>
      <Container>
        <MyFeatureComponent />
      </Container>
    </MainLayout>
  );
}

export default MyFeaturePage;
```

---

## Styling Rules

- **Tailwind first.** Use Tailwind utility classes for all layout, spacing, color, and typography.
- Use `cn()` from `lib/utils.ts` to merge conditional classes.
- **MUI** is used where Tailwind alone is insufficient: DataGrid, complex DatePicker, Autocomplete. Avoid mixing MUI and Tailwind on the same element's root — use `sx` prop for MUI overrides.
- No inline `style={{}}` objects unless absolutely required (e.g., dynamic pixel values).
- No plain CSS files for new features — Tailwind only.

---

## i18n — Internacionalización (OBLIGATORIO)

**Todas las cadenas de texto visibles al usuario deben pasar por `useTranslations`.** No hay excepciones.

```typescript
// CORRECTO
const { t } = useTranslations();
<p>{t('update.customer')}</p>
<label>{t('date')}</label>

// INCORRECTO — nunca hardcodear strings en JSX
<p>Actualitzar Client</p>
<label>Data</label>
```

- Las claves siguen la convención `'dot.notation'` en minúsculas (ej. `'create.invoice'`, `'update.customer'`).
- Las traducciones se almacenan en MongoDB y se gestionan desde el panel de configuración. **No crear ficheros JSON de traducción.**
- Cuando se añade una clave nueva, indicarla explícitamente al usuario para que la registre en la base de datos con su valor en catalán.
- `t(key)` devuelve la propia clave si no existe la traducción — el app no rompe, pero la clave debe registrarse.

---

## Code Rules

- **No code comments** — naming must make intent clear.
- Methods: focused and short. Extract logic to private helpers or separate hooks when a component or hook grows beyond ~50 lines.
- Always handle loading and error states in hooks and components that fetch data.
- `console.error` is acceptable in service catch blocks. `console.log` is not.
- No `any` type. Use `unknown` and narrow, or define a proper interface.
- Always specify return types on service methods.
- Use `optional chaining` (`?.`) and nullish coalescing (`??`) over manual null checks.

---

## Agent Behavior Constraints

### Always ask before doing
- **New dependencies** (npm packages) — state the package name and reason, wait for approval.
- **Changes to `globalStore.ts`** — describe the state shape change before editing.
- **Changes to `MainLayout`, `SideNav`, or `Container`** — these affect the entire app.
- **Multi-file refactors** — describe the plan, wait for confirmation.

### Never do without being asked
- Do not add new Zustand stores.
- Do not create utility files or helpers not directly needed by the current task.
- Do not add ESLint disable comments.
- Do not add `// @ts-ignore` or `// @ts-expect-error`.

### Always do
- **Search before creating.** Check `app/hooks/` and `app/services/` for existing code before writing new ones.
- Match the code style of the file being edited.
- Use `cn()` for all className merging.

---

## Reference Files

| What | Where |
|---|---|
| Service pattern | `src/app/services/workOrderService.ts` |
| SWR hook pattern | `src/app/hooks/useOperatorsHook.ts` |
| useState hook pattern | `src/app/hooks/useConfig.ts` |
| Session store | `src/app/stores/globalStore.ts` |
| Page pattern | `src/app/(pages)/corrective/page.tsx` |
| Interface pattern | `src/app/interfaces/workOrder.ts` |
| Base entity interface | `src/app/interfaces/BaseModel.ts` |
| cn() utility | `src/lib/utils.ts` |
| Layout wrappers | `src/components/layout/MainLayout.tsx`, `Container.tsx` |

---

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` — base URL for all API calls (includes trailing slash)
- `NEXT_PUBLIC_BUILD_VERSION` — auto-generated at build time (used for store cache busting)

Never hardcode API URLs. Always use `process.env.NEXT_PUBLIC_API_BASE_URL`.
