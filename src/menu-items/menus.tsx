// third-party
import { FormattedMessage } from 'react-intl';

// assets

// type
import { NavItemType } from 'types/menu';
import {
  DashboardOutlined,
  TeamOutlined,
  HomeOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  PictureOutlined,
  TagsOutlined,
  HistoryOutlined,
  SettingOutlined,
  GiftOutlined,
  MobileOutlined,
  UsbOutlined,
  UsergroupAddOutlined,
  ReadOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  TeamOutlined,
  HomeOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  PictureOutlined,
  TagsOutlined,
  HistoryOutlined,
  SettingOutlined,
  GiftOutlined,
  MobileOutlined,
  UsbOutlined,
  UsergroupAddOutlined,
  ReadOutlined
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
      icon: icons.DashboardOutlined
    },
    {
      id: 'user',
      title: <FormattedMessage id="Users" />,
      type: 'item',
      url: '/user',
      icon: icons.TeamOutlined
    },
    {
      id: 'Companies',
      title: <FormattedMessage id="Companies" />,
      type: 'item',
      url: '/companies',
      icon: icons.HomeOutlined
    },
    {
      id: 'registries',
      title: <FormattedMessage id="Registries" />,
      type: 'item',
      url: '/registries',
      icon: icons.FileTextOutlined
    },
    {
      id: 'evident-items',
      title: <FormattedMessage id="Evident Items" />,
      type: 'item',
      url: '/evident-items',
      icon: icons.AppstoreOutlined
    },
    {
      id: 'nft',
      title: <FormattedMessage id="Minted NFTs" />,
      type: 'item',
      url: '/nft',
      icon: icons.PictureOutlined
    },
    {
      id: 'collection',
      title: <FormattedMessage id="NFT Collections" />,
      type: 'item',
      url: '/nft-collection',
      icon: icons.TagsOutlined
    },
    {
      id: 'non-minted-nft',
      title: <FormattedMessage id="Non-Minted NFTs" />,
      type: 'item',
      url: '/non-minted-nft',
      icon: icons.FileTextOutlined
    },
    {
      id: 'transaction',
      title: <FormattedMessage id="Transaction" />,
      type: 'item',
      url: '/transaction',
      icon: icons.HistoryOutlined
    },
    {
      id: 'dterminal',
      title: <FormattedMessage id="DTerminal" />,
      type: 'item',
      url: '/dterminal',
      icon: icons.UsbOutlined
    },
    {
      id: 'transaction-history-mobile',
      title: <FormattedMessage id="Transaction History Mobile" />,
      type: 'item',
      url: '/transaction-history-mobile',
      icon: icons.MobileOutlined
    },
    {
      id: 'airdrop',
      title: <FormattedMessage id="Airdrop claims" />,
      type: 'item',
      url: '/airdrop-claims',
      icon: icons.GiftOutlined
    },
    {
      id: 'addressBook',
      title: <FormattedMessage id="Address Book" />,
      type: 'item',
      url: '/address-book',
      icon: icons.UsergroupAddOutlined
    },
    {
      id: 'blog',
      title: <FormattedMessage id="Blog" />,
      type: 'item',
      url: '/blog',
      icon: icons.ReadOutlined
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
