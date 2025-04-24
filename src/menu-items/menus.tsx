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
      id: 'evident-items',
      title: <FormattedMessage id="Evident Items" />,
      type: 'item',
      url: '/evident-items',
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
      id: 'collection',
      title: <FormattedMessage id="NFT Collections" />,
      type: 'item',
      url: '/nft-collection',
      icon: icons.FormOutlined
    },
    {
      id: 'transaction',
      title: <FormattedMessage id="Transaction" />,
      type: 'item',
      url: '/transaction',
      icon: icons.FormOutlined
    },
    {
      id: 'dterminal',
      title: <FormattedMessage id="DTerminal" />,
      type: 'item',
      url: '/dterminal',
      icon: icons.FormOutlined
    },
    {
      id: 'airdrop',
      title: <FormattedMessage id="Airdrop claims" />,
      type: 'item',
      url: '/airdrop-claims',
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
