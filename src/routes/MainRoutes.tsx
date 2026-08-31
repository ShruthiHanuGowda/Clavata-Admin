
import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';
import { SimpleLayoutType } from 'config';

// ==============================|| MAINTENANCE ||============================== //

const MaintenanceError = Loadable(
  lazy(() => import('pages/maintenance/404'))
);

const MaintenanceError500 = Loadable(
  lazy(() => import('pages/maintenance/500'))
);

const MaintenanceUnderConstruction = Loadable(
  lazy(() => import('pages/maintenance/underConstruction'))
);

const MaintenanceComingSoon = Loadable(
  lazy(() => import('pages/maintenance/comingSoon'))
);

// ==============================|| PUBLIC ||============================== //

const AppContactUS = Loadable(
  lazy(() => import('pages/contactUs'))
);

// ==============================|| DASHBOARD ||============================== //

const Dashboard = Loadable(
  lazy(() => import('pages/dashboard'))
);

const Analytics = Loadable(
  lazy(() => import('pages/analytics'))
);

const Customers = Loadable(
  lazy(() => import('pages/customers'))
);

const Salons = Loadable(
  lazy(() => import('pages/salons'))
);

const Staff = Loadable(
  lazy(() => import('pages/staff'))
);

const Services = Loadable(
  lazy(() => import('pages/services'))
);

const Bookings = Loadable(
  lazy(() => import('pages/bookings'))
);

const Reviews = Loadable(
  lazy(() => import('pages/reviews'))
);

const Payments = Loadable(
  lazy(() => import('pages/payments'))
);

const Transactions = Loadable(
  lazy(() => import('pages/transactions'))
);

// NOTE:
// You currently have Refunds importing the transactions page.
// Keep this only if that is intentional.
const Refunds = Loadable(
  lazy(() => import('pages/transactions'))
);

const Revenue = Loadable(
  lazy(() => import('pages/revenue'))
);

const SalonApplications = Loadable(
  lazy(() => import('pages/salon-applications'))
);

const KycDocuments = Loadable(
  lazy(() => import('pages/kyc-documents'))
);

const Locations = Loadable(
  lazy(() => import('pages/locations'))
);

const PendingApprovals = Loadable(
  lazy(() => import('pages/pending-approvals'))
);

const Notifications = Loadable(
  lazy(() => import('pages/notifications'))
);

const Categories = Loadable(
  lazy(() => import('pages/categories'))
);

// ==============================|| ADMIN ||============================== //

const Support = Loadable(
  lazy(() => import('pages/support'))
);

const AdminUsers = Loadable(
  lazy(() => import('pages/admin-users'))
);

const RolePermission = Loadable(
  lazy(() => import('pages/roles-permissions'))
);

const AuditLogs = Loadable(
  lazy(() => import('pages/audit-logs'))
);

// ==============================|| SETTINGS ||============================== //

const Settings = Loadable(
  lazy(() => import('pages/settings'))
);

const Profile = Loadable(
  lazy(() => import('pages/profile'))
);

const MyAccount = Loadable(
  lazy(() => import('pages/my-account'))
);

const Feedback = Loadable(
  lazy(() => import('pages/feedback'))
);

// IMPORTANT:
// This is your Privacy Center.
// Your file should be:
//
// src/pages/settings/privacy/index.tsx
//
const Privacy = Loadable(
  lazy(() => import('pages/settings/privacy'))
);

// ==============================|| PROFILE ACCOUNT ||============================== //

const AccountProfile = Loadable(
  lazy(() => import('pages/profiles/account'))
);

const AccountTabRole = Loadable(
  lazy(() => import('pages/profiles/account/TabRole'))
);

const AccountTabSettings = Loadable(
  lazy(() => import('pages/settings/account'))
);

const PlatformSettings = Loadable(
  lazy(() => import('pages/settings/platform'))
);



// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  children: [

    // ============================================================
    // DASHBOARD APPLICATION
    // ============================================================

    {
      path: '/',
      element: <DashboardLayout />,

      children: [

        // ============================== //
        // DASHBOARD
        // ============================== //

        {
          path: 'dashboard',
          element: <Dashboard />
        },

        // ============================== //
        // BUSINESS
        // ============================== //

        {
          path: 'analytics',
          element: <Analytics />
        },

        {
          path: 'customers',
          element: <Customers />
        },

        {
          path: 'salons',
          element: <Salons />
        },

        {
          path: 'staff',
          element: <Staff />
        },

        {
          path: 'services',
          element: <Services />
        },

        {
          path: 'bookings',
          element: <Bookings />
        },

        {
          path: 'reviews',
          element: <Reviews />
        },

        // ============================== //
        // PAYMENTS
        // ============================== //

        {
          path: 'payments',
          element: <Payments />
        },

        {
          path: 'transactions',
          element: <Transactions />
        },

        {
          path: 'refunds',
          element: <Refunds />
        },

        {
          path: 'revenue',
          element: <Revenue />
        },

        // ============================== //
        // SALON MANAGEMENT
        // ============================== //

        {
          path: 'salon-applications',
          element: <SalonApplications />
        },

        {
          path: 'kyc-documents',
          element: <KycDocuments />
        },

        {
          path: 'pending-approvals',
          element: <PendingApprovals />
        },

        {
          path: 'locations',
          element: <Locations />
        },

        {
          path: 'categories',
          element: <Categories />
        },

        // ============================== //
        // NOTIFICATIONS
        // ============================== //

        {
          path: 'notifications',
          element: <Notifications />
        },

        // ============================== //
        // SUPPORT
        // ============================== //

        {
          path: 'support',
          element: <Support />
        },

        // ============================== //
        // ADMINISTRATION
        // ============================== //

        {
          path: 'admin-users',
          element: <AdminUsers />
        },

        {
          path: 'roles-permissions',
          element: <RolePermission />
        },

        {
          path: 'audit-logs',
          element: <AuditLogs />
        },

        // ============================== //
        // SETTINGS
        // ============================== //

        {
          path: 'settings',
          element: <Settings />
        },

        {
          path: 'settings/account',
          element: <MyAccount />
        },

        {
          path: 'settings/platform',
          element: <PlatformSettings />
        },

        {
          path: 'settings/privacy',
          element: <Privacy />
        },

        // ============================== //
        // PROFILE
        // ============================== //

        {
          path: 'profile',
          element: <Profile />
        },

        {
          path: 'my-account',
          element: <MyAccount />
        },

        // ============================== //
        // FEEDBACK
        // ============================== //

        {
          path: 'feedback',
          element: <Feedback />
        },

        // ============================================================
        // OLD PROFILE ACCOUNT SECTION
        // ============================================================

        {
          path: 'profiles',
          children: [

            {
              path: 'account',
              element: <AccountProfile />,

              children: [

                {
                  path: 'user-permissions',
                  element: <AccountTabRole />
                },

                {
                  path: 'settings',
                  element: <AccountTabSettings />
                },

                {
                  path: 'platform-settings',
                  element: <PlatformSettings />
                }

              ]
            }

          ]
        }

      ]
    },

    // ============================================================
    // SIMPLE LAYOUT
    // ============================================================

    {
      path: '/',
      element: (
        <SimpleLayout
          layout={SimpleLayoutType.SIMPLE}
        />
      ),

      children: [

        {
          path: 'contact-us',
          element: <AppContactUS />
        }

      ]
    },

    // ============================================================
    // MAINTENANCE
    // ============================================================

    {
      path: 'maintenance',
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

