// project import
import NavUser from './NavUser';
import Navigation from './Navigation';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        minHeight: 0,

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden'
      }}
    >
      {/* =========================================
          SCROLLABLE NAVIGATION
          ========================================= */}

      <div
        style={{
          flex: '1 1 0%',
          minHeight: 0,

          width: '100%',

          overflowY: 'auto',
          overflowX: 'hidden',

          /* Chrome / Edge / Safari */
          scrollbarWidth: 'thin',

          /* Firefox */
          msOverflowStyle: 'auto'
        }}
      >
        <Navigation />
      </div>

      {/* =========================================
          FIXED ADMIN USER
          ========================================= */}

      <div
        style={{
          flex: '0 0 auto',
          width: '100%',

          backgroundColor: '#fff',

          borderTop: '1px solid #e5e7eb'
        }}
      >
        <NavUser />
      </div>
    </div>
  );
}