'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type QueryParams = Record<
  string,
  string | string[] | number | boolean | null | undefined
>;

export const useQueryParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentParams = useMemo(() => {
    const params: QueryParams = {};
    searchParams.forEach((value, key) => {
      // Si la clave ya existe, convertir a array
      if (params[key] !== undefined) {
        const existingValue = params[key];
        params[key] = Array.isArray(existingValue)
          ? [...existingValue, value]
          : [existingValue as string, value];
      } else {
        params[key] = value;
      }
    });
    return params;
  }, [searchParams]);

  const updateQueryParams = useCallback(
    (newParams: QueryParams) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach(v => v && params.append(key, v.toString()));
        } else {
          params.set(key, value.toString());
        }
      });

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const setQueryParams = useCallback(
    (params: QueryParams) => {
      const newParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;

        if (Array.isArray(value)) {
          value.forEach(v => v && newParams.append(key, v.toString()));
        } else {
          newParams.set(key, value.toString());
        }
      });

      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router]
  );

  const removeQueryParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const getQueryParam = useCallback(
    (key: string): string | string[] | null => {
      const values = searchParams.getAll(key);
      return values.length === 0
        ? null
        : values.length === 1
        ? values[0]
        : values;
    },
    [searchParams]
  );

  return {
    queryParams: currentParams,
    updateQueryParams,
    setQueryParams,
    removeQueryParam,
    getQueryParam,
  };
};
