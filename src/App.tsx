import { RouterProvider } from 'react-router-dom';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { createHttpLink, ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { createContext, useState, useMemo } from 'react';

import router from 'routes';
import ThemeCustomization from 'themes';
import { store, persistor, RootState } from 'store';

import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/thirdParty/Notistack';

import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
import { CHAINS } from 'chains';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

// Define the shape of your context data (state)
interface ContextType {
  authenticationToken: string;
  setAuthenticationToken: (newValue: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const networks = CHAINS;

const metadata = {
  name: 'Denergy',
  description: 'Denergy',
  url: 'https://www.admin-panel-fe-new.denergychain.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

export const Context = createContext<ContextType | undefined>(undefined);

const projectId = import.meta.env.VITE_APP_PROJECT_ID;

export const reownModal = createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  allowUnsupportedChain: false,
  enableAuthLogger: false,
  chainImages: {
    4442: '/images/watt.png'
  },
  themeVariables: {
    '--w3m-border-radius-master': '1.5px'
  },
  features: {
    swaps: false,
    onramp: false,
    send: false,
    socials: false,
    email: false,
    analytics: false,
    history: false
  }
});

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_GRAPHQL_URL || ''
});

export default function App() {
  const { token } = useSelector((state: RootState) => state?.auth);

  const [authenticationToken, setAuthenticationToken] = useState(token ?? '');
  const [searchTerm, setSearchTerm] = useState('');

  const client = useMemo(() => {
    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    }));

    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
          console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, extensions: ${extensions}`);
          if (extensions?.code === 'UNAUTHENTICATED') {
            // TODO: Handle token expiration here (e.g., refresh token or logout)
            console.warn('Token expired or unauthenticated. Implement refresh or logout.');
          }
        });
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
      }
    });

    return new ApolloClient({
      link: errorLink.concat(authLink).concat(httpLink),
      cache: new InMemoryCache()
    });
  }, [token]);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={client}>
          <Context.Provider value={{ authenticationToken, setAuthenticationToken, searchTerm, setSearchTerm }}>
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
