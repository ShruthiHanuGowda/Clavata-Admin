
// project import
import {
  mainMenu,
  managementMenu,
  financeMenu,
  verificationMenu,
  operationsMenu,
  systemMenu
} from './menus';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [
    mainMenu,
    managementMenu,
    financeMenu,
    verificationMenu,
    operationsMenu,
    systemMenu
  ]
};

export default menuItems;

