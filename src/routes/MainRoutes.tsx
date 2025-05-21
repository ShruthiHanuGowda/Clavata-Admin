import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';
import { SimpleLayoutType } from 'config';
import NftCollections from '../pages/nft-collections';
import MobileTransactionHistory from 'pages/transaction-history-mobile';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon')));
const AppContactUS = Loadable(lazy(() => import('pages/contact-us')));
// render - sample page
const Dashboard = Loadable(lazy(() => import('pages/dashboard')));
const User = Loadable(lazy(() => import('pages/user/user')));
const Companies = Loadable(lazy(() => import('pages/companies/companies')));
const Registries = Loadable(lazy(() => import('pages/registries/registries')));
const NFT = Loadable(lazy(() => import('pages/nft/nft')));
const TransactionHistory = Loadable(lazy(() => import('pages/transaction-history/TransactionHistory')));
const DTerminalTransactionHistory = Loadable(lazy(() => import('pages/dterminal/TransactionHistory')));
const Airdrop = Loadable(lazy(() => import('pages/airdrop/Airdrop')));
const Setting = Loadable(lazy(() => import('pages/setting')));
const NonMintedNFT = Loadable(lazy(() => import('pages/non-minted-nfts/index')));
const AccountProfile = Loadable(lazy(() => import('pages/profiles/account')));
const AccountTabRole = Loadable(lazy(() => import('pages/profiles/account/TabRole')));
const AccountTabSettings = Loadable(lazy(() => import('pages/profiles/account/TabSettings')));
const EvidentItems = Loadable(lazy(() => import('pages/evident-items')));
const Beneficiary = Loadable(lazy(() => import('pages/beneficiary')));
const Blog = Loadable(lazy(() => import('pages/blog')));
const BlogDetails = Loadable(lazy(() => import('pages/blogDetails')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: '/user',
          element: <User />
        },
        {
          path: '/companies',
          element: <Companies />
        },
        {
          path: '/registries',
          element: <Registries />
        },
        {
          path: '/nft',
          element: <NFT />
        },
        {
          path: '/nft-collection',
          element: <NftCollections />
        },
        {
          path: '/non-minted-nft',
          element: <NonMintedNFT />
        },
        {
          path: '/transaction',
          element: <TransactionHistory />
        },
        {
          path: '/dterminal',
          element: <DTerminalTransactionHistory />
        },
        {
          path: '/transaction-history-mobile',
          element: <MobileTransactionHistory />
        },
        {
          path: '/airdrop-claims',
          element: <Airdrop />
        },
        {
          path: '/beneficiary',
          element: <Beneficiary />
        },
        {
          path: '/setting',
          element: <Setting />
        },
        {
          path: '/blog/:id',
          element: <BlogDetails />
        },
        {
          path: 'profiles',
          children: [
            {
              path: 'account',
              element: <AccountProfile />,
              children: [
                {
                  path: '/profiles/account/user-permissions',
                  element: <AccountTabRole />
                },
                {
                  path: '/profiles/account/settings',
                  element: <AccountTabSettings />
                }
              ]
            }
          ]
        },
        {
          path: '/evident-items',
          element: <EvidentItems />
        }
      ]
    },
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        {
          path: '/blog',
          element: <Blog />
        },
        {
          path: 'contact-us',
          element: <AppContactUS />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <PagesLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    }
  ]
};

export default MainRoutes;
