---
description: TypeScript rules for Okron Web. Loaded in all sessions. Prevents type escape hatches and enforces interface conventions.
---

# Okron Web — TypeScript Rules

## No escape hatches

- **No `any`** — use `unknown` and narrow with type guards, or define a proper interface.
- **No `// @ts-ignore`** — fix the underlying type issue instead.
- **No `// @ts-expect-error`** — same rule.
- **No type assertions with `as`** on incoming API data — type the response, don't assert it.

## Interface conventions

All domain entities live in `src/app/interfaces/` as named `interface` (not `type`).

```typescript
// src/app/interfaces/SparePart.ts
import { BaseModel } from './BaseModel';

export interface SparePart extends BaseModel {
  id: string;
  name: string;
  reference: string;
  stock: number;
  minimumStock: number;
  // ...
}

// Request shapes in the same file
export interface CreateSparePartRequest {
  name: string;
  reference: string;
}

export default SparePart;
```

Rules:
- Domain entities extend `BaseModel` (`id`, `creationDate`, `active`).
- Request/response shapes are in the same file as the main entity.
- Always `export default` the main entity interface.
- Use `?` for genuinely optional fields — not to silence TypeScript errors.

## Component props

Always define a props interface for every component that receives props:

```typescript
interface SparePartCardProps {
  sparePart: SparePart;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

function SparePartCard({ sparePart, onSelect, isSelected = false }: SparePartCardProps) {
  ...
}
```

## Null handling

Use optional chaining and nullish coalescing — not manual null checks:

```typescript
// Good
const name = workOrder?.machine?.name ?? 'Unknown';

// Bad
const name = workOrder && workOrder.machine && workOrder.machine.name ? workOrder.machine.name : 'Unknown';
```

## Enums

Use TypeScript `enum` or string union for domain statuses. Do not use raw numbers or magic strings:

```typescript
// Good
export enum StateWorkOrder {
  Waiting = 'Waiting',
  OnGoing = 'OnGoing',
  Finished = 'Finished',
}

// Bad
if (workOrder.state === 1) { ... }
```

## Return types

Always specify return types on service methods:

```typescript
// Good
async getById(id: string): Promise<WorkOrder | undefined> { ... }
async getAll(): Promise<WorkOrder[]> { ... }
async create(request: CreateWorkOrderRequest): Promise<WorkOrder> { ... }

// Bad
async getById(id: string) { ... }
```

## Imports

Use path alias `app/` (configured in tsconfig) — not relative `../../`:

```typescript
// Good
import WorkOrder from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';

// Bad
import WorkOrder from '../../interfaces/workOrder';
```

### Import order — enforced by `simple-import-sort` (ESLint error)

Always place imports in this order, with a blank line between each group:

1. **Side-effect imports** — `import 'some-polyfill'`
2. **Packages** — `react`, `next/*`, third-party libraries (`dayjs`, `lucide-react`, `swr`, `@mui/material`…), and internal `app/` / `components/` / `lib/` / `designSystem/` paths
3. **Relative imports** — `./Foo`, `../utils`

Within group 2, `simple-import-sort` sorts alphabetically — do not fight it, just place new imports inside the group and let ESLint sort.

```typescript
// Good
import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { OrderStatus, OrderType } from 'app/interfaces/Order';
import { orderService } from 'app/services/orderService';
import { Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useOrderPreview } from './useOrderPreview';

// Bad — mixing groups without blank line separation, or adding after relative imports
import { orderService } from 'app/services/orderService'; // ← added at the top after react
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderPreview } from './useOrderPreview';
import { OrderStatus } from 'app/interfaces/Order'; // ← added at the bottom, wrong group
```

**When adding a new import to an existing file**, place it inside the correct group. Never append it at the top or bottom of the import block without checking which group it belongs to.
