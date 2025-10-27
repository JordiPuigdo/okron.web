'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import CustomerInstallationItem from './CustomerInstallationItem';

const normalize = (v: unknown) =>
  (typeof v === 'string' ? v : String(v ?? ''))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

function installationToSearchText(inst: any): string {
  if (!inst) return '';
  const parts: string[] = [];

  // básicos
  parts.push(inst.code);
  parts.push(inst.kms);

  // address
  const addr = inst.address ?? {};
  parts.push(
    addr.address,
    addr.city,
    addr.province,
    addr.postalCode,
    addr.country
  );

  // contactes
  (inst.contact ?? []).forEach((c: any) => {
    parts.push(c.name, c.email, c.phone, c.description);
  });

  // tarifes
  (inst.rates ?? []).forEach((r: any) => {
    parts.push(r.startTime, r.endTime, r.rateTypeId, r.price);
    // si tuvieras el nombre del tipo:
    if (r.type?.name) parts.push(r.type.name);
  });

  return normalize(parts.filter(Boolean).join(' '));
}

export default function CustomerInstallationList() {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'installations',
  });

  const [show, setShow] = useState(false);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const installations = useWatch({ control, name: 'installations' }) as
    | any[]
    | undefined;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Índices visibles según búsqueda
  const visibleIndexes = useMemo(() => {
    if (!installations || !Array.isArray(installations)) return [];
    const q = normalize(debounced);
    if (!q) return installations.map((_, i) => i);
    return installations.reduce<number[]>((acc, inst, i) => {
      const haystack = installationToSearchText(inst);
      if (haystack.includes(q)) acc.push(i);
      return acc;
    }, []);
  }, [installations, debounced]);

  const handleAddNew = () => {
    if (!show) setShow(true);
    append({
      code: '',
      address: {
        address: '',
        city: '',
        country: '',
        postalCode: '',
        province: '',
        isPrimary: false,
      },
      contact: [],
      rates: [],
      kms: '0',
    });

    // Espera a que React pinte el nuevo elemento y luego baja
    setTimeout(() => {
      endRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 100);
  };

  const handleUp = () => {
    setTimeout(() => {
      startRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 100);
  };

  const endRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="space-y-4 pt-4">
      <div className="flex w-full gap-4 items-center">
        <div className="relative w-full">
          <input
            type="search"
            placeholder="Cerca per codi, adreça, CP, població o contacte..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
            aria-label="Cercador d'instal·lacions"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-2 h-6 w-6 rounded-full text-gray-400 hover:text-gray-600"
              aria-label="Neteja la cerca"
              title="Neteja"
            >
              ×
            </button>
          )}
        </div>
        <div ref={startRef} />
        <div className="flex">
          <button
            type="button"
            onClick={() => handleAddNew()}
            className="text-blue-600 hover:underline text-sm"
          >
            + Afegir nova botiga
          </button>
        </div>
      </div>
      <div
        className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
        onClick={() => setShow(!show)}
      >
        <h3 className="text-md font-semibold text-gray-700">Botigues</h3>
      </div>

      {show && (
        <div id="installations-panel" className="space-y-2">
          {fields.length === 0 ? (
            <p className="text-sm text-gray-500">Encara no hi ha botigues.</p>
          ) : visibleIndexes.length === 0 ? (
            <div className="text-sm text-gray-600 border rounded-lg py-6 text-center">
              Cap coincidència amb “<span className="font-medium">{query}</span>
              ”.
            </div>
          ) : (
            visibleIndexes.map(i => {
              const f = fields[i];
              if (!f) return null; // seguridad
              return (
                <CustomerInstallationItem
                  key={f.id}
                  index={i} // ¡importante! índice real del form
                  remove={remove}
                />
              );
            })
          )}
          <div ref={endRef} />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => handleAddNew()}
              className="text-blue-600 hover:underline text-sm"
            >
              + Afegir nova botiga
            </button>
            <button
              onClick={() => handleUp()}
              className="text-sm"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
