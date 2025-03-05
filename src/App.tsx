import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
// import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

// auth-provider
// import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
import { LIST_USER_WALLETS } from 'graphql/queries';
import { useQuery } from '@apollo/client';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      {/* <RTLLayout> */}
      <Locales>
        <ScrollTop>
          <AuthProvider>
            <>
              <Notistack>
                <RouterProvider router={router} />
                <Snackbar />
              </Notistack>
            </>
          </AuthProvider>
        </ScrollTop>
      </Locales>
      {/* </RTLLayout> */}
    </ThemeCustomization>
  );
}
