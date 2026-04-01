---
description: UI and styling rules for Okron Web. Loaded in all sessions. Enforces Tailwind-first approach, cn() usage, and correct MUI integration.
---

# Okron Web — UI & Styling Rules

## Tailwind first

Use Tailwind utility classes for all layout, spacing, color, and typography. Do not create new CSS files for feature-specific styles.

```tsx
// Good
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm">

// Bad
<div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
```

## cn() for conditional classes

Always use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) to combine conditional classes:

```tsx
import { cn } from 'lib/utils';

// Good
<button className={cn(
  'px-4 py-2 rounded-md font-medium transition-colors',
  isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700',
  disabled && 'opacity-50 cursor-not-allowed'
)}>

// Bad — string concatenation
<button className={'px-4 py-2 ' + (isActive ? 'bg-blue-600' : 'bg-gray-100')}>

// Bad — template literals with conditional
<button className={`px-4 py-2 ${isActive ? 'bg-blue-600' : 'bg-gray-100'}`}>
```

## MUI integration

MUI components (`@mui/material`) are used for complex UI that Tailwind can't easily cover: DataGrid, DatePicker, Autocomplete, Select with search.

Rules:
- Use MUI's `sx` prop for style overrides on MUI components — not Tailwind classes on the MUI root.
- Do not add `className` with Tailwind classes to the outermost MUI component element (it conflicts with Emotion).
- Wrap MUI components in a `div` with Tailwind classes to handle layout positioning.

```tsx
// Good — Tailwind on wrapper, sx for MUI internals
<div className="w-full mt-4">
  <Autocomplete
    sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
    ...
  />
</div>

// Bad — Tailwind on MUI root
<Autocomplete className="w-full mt-4 rounded-lg" ... />
```

## No inline styles

Do not use `style={{}}` objects unless a value is truly dynamic and cannot be expressed with Tailwind:

```tsx
// Acceptable — pixel value computed at runtime
<div style={{ height: `${dynamicHeight}px` }}>

// Not acceptable — static values
<div style={{ display: 'flex', color: 'red' }}>
```

## Layout components

Always wrap page content with:
```tsx
<MainLayout>
  <Container>
    {/* feature content */}
  </Container>
</MainLayout>
```

Do not replicate the layout structure inside components. Do not add padding/margin to `Container` — it has its own spacing.

## Loading and error states

Every component that receives async data must handle loading and error states:

```tsx
function SparePartList() {
  const { spareParts, error } = useSparePartHook();

  if (!spareParts && !error) return <Loader />;
  if (error) return <div className="text-red-500">Error loading spare parts</div>;

  return (
    <div>
      {spareParts.map(sp => <SparePartCard key={sp.id} sparePart={sp} />)}
    </div>
  );
}
```

## Icons

Use `@remixicon/react` or `lucide-react` for icons. Do not add `react-icons` imports for new code (already a dependency but avoid growing its usage further). Do not use MUI icons in non-MUI contexts.

## Design system components

Prefer components from `src/designSystem/` (Button, BarChart, DonutChart, Modals, TimePicker) over raw HTML or third-party equivalents when they exist. Read the component before using it to understand its props.
