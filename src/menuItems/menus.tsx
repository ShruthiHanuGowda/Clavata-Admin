
// third-party
import { FormattedMessage } from 'react-intl';

// ant design icons
import {
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  ShopOutlined,
  UserOutlined,
  SolutionOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  StarOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  RollbackOutlined,
  DollarOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  SafetyOutlined,
  AuditOutlined
} from '@ant-design/icons';

// type
import { NavItemType } from 'types/menu';

// ==============================|| ICONS ||============================== //

const icons = {
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  ShopOutlined,
  UserOutlined,
  SolutionOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  StarOutlined,
  CreditCardOutlined,
  TransactionOutlined,
  RollbackOutlined,
  DollarOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  SafetyOutlined,
  AuditOutlined
};

// ==============================|| MAIN ||============================== //

const mainMenu: NavItemType = {
  id: 'main',
  title: <FormattedMessage id="MAIN" defaultMessage="MAIN" />,
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: (
        <FormattedMessage
          id="Dashboard"
          defaultMessage="Dashboard"
        />
      ),
      type: 'item',
      url: '/dashboard',
      breadcrumbs: false,
      icon: icons.DashboardOutlined
    },
    {
      id: 'analytics',
      title: (
        <FormattedMessage
          id="Analytics"
          defaultMessage="Analytics"
        />
      ),
      type: 'item',
      url: '/analytics',
      icon: icons.BarChartOutlined
    }
  ]
};

// ==============================|| MANAGEMENT ||============================== //

const managementMenu: NavItemType = {
  id: 'management',
  title: (
    <FormattedMessage
      id="MANAGEMENT"
      defaultMessage="MANAGEMENT"
    />
  ),
  type: 'group',
  children: [
    {
      id: 'customers',
      title: (
        <FormattedMessage
          id="Customers"
          defaultMessage="Customers"
        />
      ),
      type: 'item',
      url: '/customers',
      icon: icons.TeamOutlined
    },
    {
      id: 'salons',
      title: (
        <FormattedMessage
          id="Salons"
          defaultMessage="Salons"
        />
      ),
      type: 'item',
      url: '/salons',
      icon: icons.ShopOutlined
    },
    {
      id: 'staff',
      title: (
        <FormattedMessage
          id="Staff"
          defaultMessage="Staff"
        />
      ),
      type: 'item',
      url: '/staff',
      icon: icons.SolutionOutlined
    },
    {
      id: 'services',
      title: (
        <FormattedMessage
          id="Services"
          defaultMessage="Services"
        />
      ),
      type: 'item',
      url: '/services',
      icon: icons.AppstoreOutlined
    },
    {
      id: 'bookings',
      title: (
        <FormattedMessage
          id="Bookings"
          defaultMessage="Bookings"
        />
      ),
      type: 'item',
      url: '/bookings',
      icon: icons.CalendarOutlined
    },
    {
      id: 'reviews',
      title: (
        <FormattedMessage
          id="Reviews"
          defaultMessage="Reviews"
        />
      ),
      type: 'item',
      url: '/reviews',
      icon: icons.StarOutlined
    }
  ]
};

// ==============================|| FINANCE ||============================== //

const financeMenu: NavItemType = {
  id: 'finance',
  title: (
    <FormattedMessage
      id="FINANCE"
      defaultMessage="FINANCE"
    />
  ),
  type: 'group',
  children: [
    {
      id: 'payments',
      title: (
        <FormattedMessage
          id="Payments"
          defaultMessage="Payments"
        />
      ),
      type: 'item',
      url: '/payments',
      icon: icons.CreditCardOutlined
    },
    {
      id: 'transactions',
      title: (
        <FormattedMessage
          id="Transactions"
          defaultMessage="Transactions"
        />
      ),
      type: 'item',
      url: '/transactions',
      icon: icons.TransactionOutlined
    },
    {
      id: 'refunds',
      title: (
        <FormattedMessage
          id="Refunds"
          defaultMessage="Refunds"
        />
      ),
      type: 'item',
      url: '/refunds',
      icon: icons.RollbackOutlined
    },
    {
      id: 'revenue',
      title: (
        <FormattedMessage
          id="Revenue"
          defaultMessage="Revenue"
        />
      ),
      type: 'item',
      url: '/revenue',
      icon: icons.DollarOutlined
    }
  ]
};

// ==============================|| VERIFICATION ||============================== //

const verificationMenu: NavItemType = {
  id: 'verification',
  title: (
    <FormattedMessage
      id="VERIFICATION"
      defaultMessage="VERIFICATION"
    />
  ),
  type: 'group',
  children: [
    {
      id: 'salon-applications',
      title: (
        <FormattedMessage
          id="Salon Applications"
          defaultMessage="Salon Applications"
        />
      ),
      type: 'item',
      url: '/salon-applications',
      icon: icons.FileProtectOutlined
    },
    {
      id: 'kyc-documents',
      title: (
        <FormattedMessage
          id="KYC / Documents"
          defaultMessage="KYC / Documents"
        />
      ),
      type: 'item',
      url: '/kyc-documents',
      icon: icons.SafetyCertificateOutlined
    },
    {
      id: 'pending-approvals',
      title: (
        <FormattedMessage
          id="Pending Approvals"
          defaultMessage="Pending Approvals"
        />
      ),
      type: 'item',
      url: '/pending-approvals',
      icon: icons.CheckCircleOutlined
    }
  ]
};

// ==============================|| OPERATIONS ||============================== //

const operationsMenu: NavItemType = {
  id: 'operations',
  title: (
    <FormattedMessage
      id="OPERATIONS"
      defaultMessage="OPERATIONS"
    />
  ),
  type: 'group',
  children: [
    {
      id: 'locations',
      title: (
        <FormattedMessage
          id="Locations"
          defaultMessage="Locations"
        />
      ),
      type: 'item',
      url: '/locations',
      icon: icons.EnvironmentOutlined
    },
    {
      id: 'categories',
      title: (
        <FormattedMessage
          id="Categories"
          defaultMessage="Categories"
        />
      ),
      type: 'item',
      url: '/categories',
      icon: icons.TagsOutlined
    },
    {
      id: 'notifications',
      title: (
        <FormattedMessage
          id="Notifications"
          defaultMessage="Notifications"
        />
      ),
      type: 'item',
      url: '/notifications',
      icon: icons.BellOutlined
    },
    {
      id: 'support',
      title: (
        <FormattedMessage
          id="Support"
          defaultMessage="Support"
        />
      ),
      type: 'item',
      url: '/support',
      icon: icons.CustomerServiceOutlined
    }
  ]
};

// ==============================|| SYSTEM ||============================== //

const systemMenu: NavItemType = {
  id: 'system',
  title: (
    <FormattedMessage
      id="SYSTEM"
      defaultMessage="SYSTEM"
    />
  ),
  type: 'group',
  children: [
    {
      id: 'admin-users',
      title: (
        <FormattedMessage
          id="Admin Users"
          defaultMessage="Admin Users"
        />
      ),
      type: 'item',
      url: '/admin-users',
      icon: icons.UserOutlined
    },
    {
      id: 'roles-permissions',
      title: (
        <FormattedMessage
          id="Roles & Permissions"
          defaultMessage="Roles & Permissions"
        />
      ),
      type: 'item',
      url: '/roles-permissions',
      icon: icons.SafetyOutlined
    },
    {
      id: 'audit-logs',
      title: (
        <FormattedMessage
          id="Audit Logs"
          defaultMessage="Audit Logs"
        />
      ),
      type: 'item',
      url: '/audit-logs',
      icon: icons.AuditOutlined
    },
    {
      id: 'settings',
      title: (
        <FormattedMessage
          id="Settings"
          defaultMessage="Settings"
        />
      ),
      type: 'item',
      url: '/settings',
      icon: icons.SettingOutlined
    }
  ]
};

// ==============================|| EXPORT ALL GROUPS ||============================== //

export {
  mainMenu,
  managementMenu,
  financeMenu,
  verificationMenu,
  operationsMenu,
  systemMenu
};

export default mainMenu;

