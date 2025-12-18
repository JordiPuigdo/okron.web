import { SystemConfiguration } from 'app/interfaces/Config';
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
  config: SystemConfiguration | undefined;
}

interface SessionActions {
  setLoginUser: (loginUser: LoginUser | undefined) => void;
  setOperatorLogged: (operatorLogged: OperatorLogged | undefined) => void;
  setFilterWorkOrders: (filterWorkOrders: FilterWorkOrders | undefined) => void;
  setFilterSpareParts: (filterSpareParts: FilterSpareParts | undefined) => void;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
  setConfig: (config: SystemConfiguration) => void;
}

export const useSessionStore = create(
  persist<SessionStore & SessionActions>(
    set => ({
      loginUser: undefined,
      operatorLogged: undefined,
      filterWorkOrders: undefined,
      filterSpareParts: undefined,
      isMenuOpen: false,
      config: undefined,
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
      setConfig: value => {
        set({ config: value });
      },
    }),
    {
      name: 'session-storage',
      version: parseInt(process.env.NEXT_PUBLIC_BUILD_VERSION || '1', 10),
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState, version) => {
        // Al cambiar de versión, devolver estado inicial vacío
        // Zustand combinará esto con las funciones del store
        return {
          ...(persistedState as SessionStore),
          loginUser: undefined,
          operatorLogged: undefined,
          filterWorkOrders: undefined,
          filterSpareParts: undefined,
          isMenuOpen: false,
          config: undefined,
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
