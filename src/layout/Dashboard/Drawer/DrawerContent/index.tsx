// project import
import NavUser from './NavUser';
import Navigation from './Navigation';
import SimpleBar from 'components/thirdParty/SimpleBar';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  return (
    <>
      <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
        <Navigation />
      </SimpleBar>
      <NavUser />
    </>
  );
}
