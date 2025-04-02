// third-party
import { FormattedMessage } from 'react-intl';

// assets

// type
import { NavItemType } from 'types/menu';
import { BankOutlined, FormOutlined, SettingOutlined, UserOutlined, ProductOutlined } from '@ant-design/icons';
// icons
const icons = {
  BankOutlined,
  FormOutlined,
  SettingOutlined,
  UserOutlined,
  ProductOutlined
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const allMenu: NavItemType = {
  id: 'allMenu',
  title: <FormattedMessage id="All Menu" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="Dashboard" />,
      type: 'item',
      url: '/dashboard',
      breadcrumbs: false,
      icon: icons.ProductOutlined
    },
    {
      id: 'user',
      title: <FormattedMessage id="Users" />,
      type: 'item',
      url: '/user',
      icon: icons.UserOutlined
    },
    {
      id: 'Companies',
      title: <FormattedMessage id="Companies" />,
      type: 'item',
      url: '/companies',
      icon: icons.BankOutlined
    },
    {
      id: 'registries',
      title: <FormattedMessage id="Registries" />,
      type: 'item',
      url: '/registries',
      icon: icons.FormOutlined
    },
    {
      id: 'nft',
      title: <FormattedMessage id="Minted NFTs" />,
      type: 'item',
      url: '/nft',
      icon: icons.FormOutlined
    },
    {
      id: 'setting',
      title: <FormattedMessage id="Setting" />,
      type: 'item',
      url: '/profiles/account/settings',
      icon: icons.SettingOutlined
    }
  ]
};

export default allMenu;
