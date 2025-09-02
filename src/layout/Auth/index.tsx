import { Outlet } from 'react-router-dom';

// project import
import GuestGuard from 'utils/routeGuard/GuestGuard';

// ==============================|| LAYOUT - AUTH ||============================== //

export default function AuthLayout() {
  return (
    <GuestGuard>
      <Outlet />
    </GuestGuard>
  );
}
