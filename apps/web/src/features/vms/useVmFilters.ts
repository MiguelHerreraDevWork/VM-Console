'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  emptyVmFilters,
  vmFiltersFromParams,
  vmFiltersToQuery,
  type VmFilters,
} from './lib/filter-vms';

/**
 * Filtros del inventario. El estado es local (escritura fluida) y se refleja en la URL con
 * `history.replaceState`: sobrevive a una recarga y se puede compartir, sin petición al
 * servidor ni entrada nueva en el historial por cada tecla.
 */
export function useVmFilters() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<VmFilters>(() => vmFiltersFromParams(searchParams));

  useEffect(() => {
    const query = vmFiltersToQuery(filters);
    if (query !== window.location.search) {
      window.history.replaceState(null, '', `${window.location.pathname}${query}`);
    }
  }, [filters]);

  const update = useCallback((patch: Partial<VmFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => setFilters(emptyVmFilters), []);

  return { filters, update, reset };
}
