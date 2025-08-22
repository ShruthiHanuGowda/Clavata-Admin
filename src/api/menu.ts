import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// types
import { MenuProps } from 'types/menu';

const initialState: MenuProps = {
  isDashboardDrawerOpened: false,
  isComponentDrawerOpened: true
};

export const endpoints = {
  key: 'api/menu',
  master: 'master',
  dashboard: '/dashboard' // server URL
};

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.master, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      menuMaster: data as MenuProps,
      menuMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerDrawerOpen(isDashboardDrawerOpened: boolean) {
  // to update local state based on key

  mutate<MenuProps>(
    endpoints.key + endpoints.master,
    (currentMenuMaster) => {
      const safeMenu: MenuProps = {
        isDashboardDrawerOpened,
        isComponentDrawerOpened: currentMenuMaster?.isComponentDrawerOpened ?? initialState.isComponentDrawerOpened
      };
      return safeMenu;
    },
    false
  );
}
