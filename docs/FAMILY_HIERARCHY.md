# Sistema de Jerarquía de Familias para Artículos

## Descripción General

Los artículos en el sistema pueden pertenecer a familias y subfamilias, creando una jerarquía que se refleja en el código del artículo.

## Estructura de Datos

### Family
```typescript
{
  id: "family-1",
  name: "Eléctrico",
  codePrefix: "EL",
  codePattern: "XXX",
  parentFamilyId: undefined  // Es familia raíz
}
```

### Subfamilia
```typescript
{
  id: "family-2",
  name: "Resistencias",
  codePrefix: "X",
  codePattern: "XXXX",
  parentFamilyId: "family-1"  // Es hija de "Eléctrico"
}
```

### Article
```typescript
{
  id: "article-1",
  code: "ELX-0001",
  description: "Resistencia 10K",
  familyId: "family-2",           // ID de la subfamilia final
  familyName: "Resistencias",      // Nombre de la familia final
  familyCode: "X",                 // Código de la familia final
  familyPath: "family-1/family-2", // Jerarquía completa de IDs
  fullFamilyCode: "ELX"            // Código completo concatenado
}
```

## Ejemplos de Jerarquía

### Ejemplo 1: Familia Simple
```
Eléctrico (EL)
  └─ Article: EL-001
```

### Ejemplo 2: Con Subfamilia
```
Eléctrico (EL)
  └─ Resistencias (X)
      └─ Article: ELX-0001
```

### Ejemplo 3: Jerarquía Profunda
```
Eléctrico (EL)
  └─ Componentes Pasivos (C)
      └─ Resistencias (R)
          └─ Article: ELCR-0001
```

## Componentes UI

### HierarchicalFamilySelector
Selector visual de familias con estructura de árbol expandible/colapsable.

**Características:**
- Muestra familias y subfamilias en estructura jerárquica
- Permite expandir/colapsar nodos con hijos
- Indica la ruta completa seleccionada
- Muestra el código completo concatenado

**Uso:**
```tsx
<HierarchicalFamilySelector
  selectedFamilyId={selectedFamilyId}
  onSelect={setSelectedFamilyId}
/>
```

## Utilidades

### familyUtils.ts
Funciones helper para trabajar con jerarquías:

- `buildFamilyPath()` - Construye array de IDs desde raíz hasta familia seleccionada
- `buildFullFamilyCode()` - Concatena todos los codePrefix de la jerarquía
- `getFamilyHierarchyNames()` - Obtiene nombres de toda la jerarquía
- `getFamilyHierarchyDisplay()` - Formato legible: "Eléctrico → Resistencias (ELX)"

## Flujo de Creación de Artículo

1. Usuario selecciona familia/subfamilia en el árbol jerárquico
2. El sistema calcula automáticamente:
   - `familyPath`: "family-1/family-2/family-3"
   - `fullFamilyCode`: "ELX" (concatenación de "EL" + "X")
3. El backend genera el código completo del artículo:
   - Toma `fullFamilyCode` + patrón de la familia final
   - Resultado: "ELX-0001"

## Ventajas del Sistema

✅ **Organización clara** - Estructura jerárquica visual
✅ **Códigos descriptivos** - El código refleja la jerarquía
✅ **Búsqueda eficiente** - Filtrar por jerarquía completa
✅ **Escalabilidad** - Soporta múltiples niveles de profundidad
✅ **Flexibilidad** - Permite reorganizar familias sin afectar artículos
