import { lazy } from 'react';
// project import
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';
import { SimpleLayoutType } from 'config';
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/underConstruction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/comingSoon')));
const AppContactUS = Loadable(lazy(() => import('pages/contactUs')));
// render - sample page
const Dashboard = Loadable(lazy(() => import('pages/dashboard')));
const Analytics = Loadable(lazy(() => import('pages/analytics')));
const Customers = Loadable(lazy(() => import('pages/customers')));
const Salons = Loadable(lazy(() => import('pages/salons')));
const Staff = Loadable(lazy(() => import('pages/staff')));
const Services = Loadable(lazy(() => import('pages/services')));
const Bookings = Loadable(lazy(() => import('pages/bookings')));
const Reviews = Loadable(lazy(() => import('pages/reviews')));
const Payments = Loadable(lazy(() => import('pages/payments')));
const Transactions = Loadable(lazy(() => import('pages/transactions')));
const Refunds = Loadable(lazy(() => import('pages/transactions')));
const Revenue = Loadable(lazy(() => import('pages/revenue')));
const SalonApplications = Loadable(lazy(() => import('pages/salon-applications')));
const KycDocuments = Loadable(lazy(() => import('pages/kyc-documents')));
const Locations = Loadable(lazy(() => import('pages/locations')));
const PendingApprovals = Loadable(lazy(() => import('pages/pending-approvals')));
const Notifications = Loadable(lazy(() => import('pages/notifications')));
const Categories = Loadable(lazy(() => import('pages/categories')));
const Support = Loadable(lazy(() => import('pages/support')));
const AdminUsers = Loadable(lazy(() => import('pages/admin-users')));
const RolePermission = Loadable(lazy(() => import('pages/roles-permissions')));
const AuditLogs = Loadable(lazy(() => import('pages/audit-logs')));
const Settings = Loadable(lazy(() => import('pages/settings')));
const Profile = Loadable(lazy(() => import('pages/profile')));
const MyAccount = Loadable(lazy(() => import('pages/my-account')));

const AccountProfile = Loadable(lazy(() => import('pages/profiles/account')));
const AccountTabRole = Loadable(lazy(() => import('pages/profiles/account/TabRole')));
const AccountTabSettings = Loadable(lazy(() => import('pages/profiles/account/TabSettings')));
const PlatformSettings = Loadable(lazy(() => import('pages/profiles/account/PlatformSettings')));
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
          path: '/analytics',
          element: <Analytics />
        },
        {
          path: '/customers',
          element: <Customers />
        },
        {
          path: '/salons',
          element: <Salons />
        },
        {
          path: '/staff',
          element: <Staff />
        },
        {
          path: '/services',
          element: <Services />
        },
        {
          path: '/bookings',
          element: <Bookings />
        },
        {
          path: '/reviews',
          element: <Reviews />
        },
        {
          path: '/payments',
          element: <Payments />
        },
        {
          path: '/transactions',
          element: <Transactions />
        },
        {
          path: '/refunds',
          element: <Refunds />
        },
        {
          path: '/revenue',
          element: <Revenue />
        },
        {
          path: '/salon-applications',
          element: <SalonApplications />
        },
        {
          path: '/kyc-documents',
          element: <KycDocuments />
        },
        {
          path: '/pending-approvals',
          element: <PendingApprovals />
        },
        {
          path: '/locations',
          element: <Locations />
        },
        {
          path: '/categories',
          element: <Categories />
        },
        {
          path: '/notifications',
          element: <Notifications />
        },
        {
          path: '/support',
          element: <Support />
        },
        {
          path: '/admin-users',
          element: <AdminUsers />
        },
        {
          path: '/roles-permissions',
          element: <RolePermission />
        },
        {
          path: '/audit-logs',
          element: <AuditLogs />
        },
        {
          path: '/settings',
          element: <Settings />
        },
        {
          path: '/profile',
          element: <Profile />
        },
        {
          path: '/my-account',
          element: <MyAccount />
        },
        // {
        //   path: '/companies/:id',
        //   element: <CompanyKybDetail />
        // },
        // {
        //   path: '/user/:id',
        //   element: <UserKYCDetail />
        // },
        {
          path: '/blog',
          element: <Blog />
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
                },
                {
                  path: '/profiles/account/platform-settings',
                  element: <PlatformSettings />
                }
              ]
            }
          ]
        },
      ]
    },
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
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
