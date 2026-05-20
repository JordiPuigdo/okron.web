import { SystemConfiguration } from 'app/interfaces/Config';
import { LoginUser, OperatorLogged } from 'app/interfaces/User';
import { FilterSpareParts, FilterWorkOrders } from 'app/types/filters';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AssemblyBudgetDateFilters {
  startDate: string | null;
  endDate: string | null;
}

interface SessionStore {
  loginUser: LoginUser | undefined;
  operatorLogged: OperatorLogged | undefined;
  filterWorkOrders: FilterWorkOrders | undefined;
  filterSpareParts: FilterSpareParts | undefined;
  assemblyBudgetDateFilters: AssemblyBudgetDateFilters | undefined;
  isMenuOpen: boolean;
  config: SystemConfiguration | undefined;
  _hasHydrated: boolean;
}

interface SessionActions {
  setLoginUser: (loginUser: LoginUser | undefined) => void;
  setOperatorLogged: (operatorLogged: OperatorLogged | undefined) => void;
  setFilterWorkOrders: (filterWorkOrders: FilterWorkOrders | undefined) => void;
  setFilterSpareParts: (filterSpareParts: FilterSpareParts | undefined) => void;
  setAssemblyBudgetDateFilters: (filters: AssemblyBudgetDateFilters | undefined) => void;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
  setConfig: (config: SystemConfiguration) => void;
  setHasHydrated: (state: boolean) => void;
}

const STORE_VERSION = parseInt(process.env.NEXT_PUBLIC_BUILD_VERSION || '1', 10);

const getInitialSessionState = (): SessionStore => ({
  loginUser: undefined,
  operatorLogged: undefined,
  filterWorkOrders: undefined,
  filterSpareParts: undefined,
  assemblyBudgetDateFilters: undefined,
  isMenuOpen: false,
  config: undefined,
  _hasHydrated: false,
});

export const useSessionStore = create(
  persist<SessionStore & SessionActions>(
    set => ({
      ...getInitialSessionState(),
      setLoginUser: value => {
        set({ loginUser: value });
      },
      setOperatorLogged: value => {
        set({ operatorLogged: value });
      },
      setFilterWorkOrders: value => {
        set({ filterWorkOrders: value });
      },
      setFilterSpareParts: value => {
        set({ filterSpareParts: value });
      },
      setAssemblyBudgetDateFilters: value => {
        set({ assemblyBudgetDateFilters: value });
      },
      setIsMenuOpen: value => {
        set({ isMenuOpen: value });
      },
      setConfig: value => {
        set({ config: value });
      },
      setHasHydrated: value => {
        set({ _hasHydrated: value });
      },
    }),
    {
      name: 'session-storage',
      version: STORE_VERSION,
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      migrate: (persistedState, version) => {
        // Si la versión cambia, devolver estado inicial limpio
        // No extender el estado antiguo para evitar propiedades obsoletas
        if (version !== STORE_VERSION) {
          return getInitialSessionState() as SessionStore & SessionActions;
        }
        // Si es la misma versión pero el estado está corrupto, limpiar
        const state = persistedState as Partial<SessionStore>;
        if (!state || typeof state !== 'object') {
          return getInitialSessionState() as SessionStore & SessionActions;
        }
        // Mantener solo propiedades conocidas con valores válidos
        return {
          ...getInitialSessionState(),
          loginUser: state.loginUser,
          operatorLogged: state.operatorLogged,
          filterWorkOrders: state.filterWorkOrders,
          filterSpareParts: state.filterSpareParts,
          assemblyBudgetDateFilters: state.assemblyBudgetDateFilters,
          isMenuOpen: state.isMenuOpen ?? false,
          config: state.config,
        } as SessionStore & SessionActions;
      },
    }
  )
);

interface GlobalStore {
  isModalOpen: boolean;
  showModalBackground: boolean;
  isMainScrollEnabled: boolean;
}

interface GlobalActions {
  setIsModalOpen: (value: boolean) => void;
  setShowModalBackground: (value: boolean) => void;
  setIsMainScrollEnabled: (value: boolean) => void;
}

export const useGlobalStore = create<GlobalStore & GlobalActions>(set => ({
  isModalOpen: false,
  showModalBackground: false,
  isMainScrollEnabled: true,
  setIsModalOpen: (value: boolean) => {
    set({ isModalOpen: value });
  },
  setShowModalBackground: (value: boolean) => {
    set({ showModalBackground: value });
  },
  setIsMainScrollEnabled: (value: boolean) => {
    set({ isMainScrollEnabled: value });
  },
}));
