import { RouterProvider } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { createContext, useState } from 'react';
import router from 'routes';
import ThemeCustomization from 'themes';
import { store, persistor } from 'store';
import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/thirdParty/Notistack';
import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
import { ApolloProvider } from '@apollo/client';
import apolloClient from 'utils/createApolloClient';
// ============================================================
// APP CONTEXT
// ============================================================
export interface ContextType {
  authenticationToken: string;
  setAuthenticationToken: (newValue: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const Context = createContext<ContextType | undefined>(undefined);

export default function App() {
  const [authenticationToken, setAuthenticationToken] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={apolloClient}>
          <Context.Provider
            value={{
              authenticationToken,
              setAuthenticationToken,
              searchTerm,
              setSearchTerm
            }}
          >
            <ThemeCustomization>
              <Locales>
                <ScrollTop>
                  <AuthProvider>
                    <Notistack>
                      <RouterProvider router={router} />
                      <Snackbar />
                    </Notistack>
                  </AuthProvider>
                </ScrollTop>
              </Locales>
            </ThemeCustomization>
          </Context.Provider>
        </ApolloProvider>
      </PersistGate>
    </ReduxProvider>
  );
}