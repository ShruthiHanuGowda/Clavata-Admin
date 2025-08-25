import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

// types
import { SnackbarProps } from 'types/snackbar';

export const endpoints = {
  key: 'snackbar'
};

const initialState: SnackbarProps = {
  action: false,
  open: false,
  message: 'Note archived',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'right'
  },
  variant: 'default',
  alert: {
    color: 'primary',
    variant: 'filled'
  },
  transition: 'Fade',
  close: false,
  actionButton: false,
  maxStack: 3,
  dense: false,
  iconVariant: 'usedefault'
};

export function useGetSnackbar() {
  const { data } = useSWR(endpoints.key, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(() => ({ snackbar: data! }), [data]);

  return memoizedValue;
}

export function openSnackbar(snackbar: SnackbarProps) {
  const { action, open, message, anchorOrigin, variant, alert, transition, close, actionButton } = snackbar;

  mutate(
    endpoints.key,
    (currentSnackbar: SnackbarProps | undefined) => {
      const prev = currentSnackbar || initialState;
      return {
        ...prev,
        action: action ?? prev.action,
        open: open ?? prev.open,
        message: message ?? prev.message,
        anchorOrigin: anchorOrigin ?? prev.anchorOrigin,
        variant: variant ?? prev.variant,
        alert: {
          color: alert?.color ?? prev.alert.color,
          variant: alert?.variant ?? prev.alert.variant
        },
        transition: transition ?? prev.transition,
        close: close ?? prev.close,
        actionButton: actionButton ?? prev.actionButton
      };
    },
    false
  );
}

export function closeSnackbar() {
  mutate(
    endpoints.key,
    (currentSnackbar: SnackbarProps | undefined) => {
      const prev = currentSnackbar || initialState;
      return { ...prev, open: false };
    },
    false
  );
}
