import React, { useEffect, useMemo, useState } from 'react';
import { SvgDelete } from 'app/icons/icons';
import { WarehousesSparePart } from 'app/interfaces/SparePart';

type Props = {
  warehouses: WarehousesSparePart[];
  value: string | null;
  onChange: (id: string | null) => void;
  excludeIds?: string[]; // 👉 oculta ids en la lista (p.ej. evitar elegir el mismo en origen/destino)
  placeholderSearch?: string;
};

export function WarehouseSelector({
  warehouses,
  value,
  onChange,
  excludeIds,
  placeholderSearch = 'Escriu nom magatzem…',
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const setExcl = new Set(excludeIds ?? []);
    const base = warehouses.filter(w => !setExcl.has(w.warehouseId));
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      w =>
        w.warehouseName.toLowerCase().includes(q) ||
        w.warehouseId.toLowerCase().includes(q)
    );
  }, [query, warehouses, excludeIds]);

  const selectedName = useMemo(
    () => warehouses.find(w => w.warehouseId === value)?.warehouseName ?? '',
    [value, warehouses]
  );

  useEffect(() => {
    if (value && !warehouses.some(w => w.warehouseId === value)) onChange(null);
  }, [warehouses, value, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-sm font-semibold">Cerca magatzem</label>
          <input
            type="text"
            className="text-lg rounded-lg w-full mt-2 border px-3 py-2"
            placeholder={placeholderSearch}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="h-[42px] px-3 rounded-lg bg-okron-requested/85 text-white hover:bg-okron-requested hover:cursor-pointer font-semibold mt-[30px]"
          onClick={() => onChange(null)}
          disabled={!value}
          title="Treure magatzem seleccionat"
        >
          <SvgDelete />
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold">
          Selecciona magatzem
        </label>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">Sense resultats</div>
          ) : (
            <ul className="divide-y">
              {filtered.map(w => {
                const active = value === w.warehouseId;
                return (
                  <li
                    key={w.warehouseId}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 ${
                      active ? 'bg-slate-100' : ''
                    }`}
                    onClick={() => onChange(w.warehouseId)}
                    role="button"
                    aria-pressed={active}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ')
                        onChange(w.warehouseId);
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {w.warehouseName}
                      </div>
                    </div>
                    {active && (
                      <span className="text-xs font-semibold text-emerald-700">
                        Seleccionat
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-semibold">
          Magatzem seleccionat
        </label>
        <input
          className="text-lg rounded-lg w-full mt-2 border px-3 py-2 bg-slate-50"
          value={selectedName || ''}
          readOnly
          placeholder="Cap magatzem seleccionat"
        />
      </div>

      {!selectedName && (
        <p className="text-xs text-red-600 mt-1">Selecciona Magatzem</p>
      )}
    </div>
  );
}
