import { LoginUser, OperatorLogged } from 'app/interfaces/User';
import { FilterSpareParts, FilterWorkOrders } from 'app/types/filters';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SessionStore {
  loginUser: LoginUser | undefined;
  operatorLogged: OperatorLogged | undefined;
  filterWorkOrders: FilterWorkOrders | undefined;
  filterSpareParts: FilterSpareParts | undefined;
  isMenuOpen: boolean;
}

interface SessionActions {
  setLoginUser: (loginUser: LoginUser | undefined) => void;
  setOperatorLogged: (operatorLogged: OperatorLogged | undefined) => void;
  setFilterWorkOrders: (filterWorkOrders: FilterWorkOrders | undefined) => void;
  setFilterSpareParts: (filterSpareParts: FilterSpareParts | undefined) => void;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
}

export const useSessionStore = create(
  persist<SessionStore & SessionActions>(
    set => ({
      loginUser: undefined,
      operatorLogged: undefined,
      filterWorkOrders: undefined,
      filterSpareParts: undefined,
      isMenuOpen: false,
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
      setIsMenuOpen: value => {
        set({ isMenuOpen: value });
      },
    }),
    {
      name: 'session-storage',
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
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

/*
interface FilterValue {
  [key: string]: string | boolean | Date;
}

interface FilterStore {
  lastVisitedRoute: string;
  setLastVisitedRoute: (route: string) => void;

  filtersByRoute: Record<string, FilterValue>;
  setFilterForRoute: (
    route: string,
    key: string,
    value: string | boolean | Date
  ) => void;
  getFiltersForRoute: (route: string) => FilterValue;
  clearFiltersForRoute: (route: string) => void;
}

const filterStore = create<FilterStore>((set, get) => ({
  lastVisitedRoute: '',
  setLastVisitedRoute: route => set({ lastVisitedRoute: route }),
  filtersByRoute: {},
  setFilterForRoute: (route, key, value) =>
    set(state => ({
      filtersByRoute: {
        ...state.filtersByRoute,
        [route]: {
          ...state.filtersByRoute[route],
          [key]: value,
        },
      },
    })),

  getFiltersForRoute: route => {
    return get().filtersByRoute[route] ?? {};
  },

  clearFiltersForRoute: route =>
    set(state => {
      const { [route]: _, ...rest } = state.filtersByRoute;
      return { filtersByRoute: rest };
    }),
}));

export const useFilterStore = filterStore;
*/
