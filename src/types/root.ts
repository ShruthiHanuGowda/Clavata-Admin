import { ComponentClass, FunctionComponent } from 'react';

// material-ui
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { OverridableComponent } from '@mui/material/OverridableComponent';

// ==============================|| ROOT TYPES ||============================== //

export type KeyedObject = {
  [key: string]: string | number | KeyedObject | unknown;
};

export type OverrideIcon =
  | (OverridableComponent<SvgIconTypeMap<Record<string, unknown>, 'svg'>> & {
      muiName: string;
    })
  | ComponentClass<unknown>
  | FunctionComponent<unknown>;

export interface GenericCardProps {
  title?: string;
  primary?: string | number | undefined;
  secondary?: string;
  content?: string;
  image?: string;
  dateTime?: string;
  iconPrimary?: OverrideIcon;
  color?: string;
  size?: string;
}
