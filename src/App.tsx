import { RouterProvider } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// project import
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { createHttpLink } from '@apollo/client';
import { createContext, useState } from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import router from 'routes';
import ThemeCustomization from 'themes';
import { store, persistor } from 'store';

import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

// auth-provider
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

// Create the Context
export const Context = createContext<ContextType | undefined>(undefined);

const projectId = import.meta.env.VITE_APP_PROJECT_ID || '95e67c8c9df44db006eec4af5da5d494';

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
    // '--w3m-color-mix': '#292929',
    // '--w3m-color-mix-strength': 40,
    // '--w3m-accent': '#81c8c3',
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
  uri: import.meta.env.VITE_APP_GRAPHQL_URL
});

export default function App() {
  const [authenticationToken, setAuthenticationToken] = useState(() => {
    return localStorage.getItem('serviceToken') || '';
  });
  const [searchTerm, setSearchTerm] = useState('');

  const authLink = setContext((_, { headers }) => {
    const token = authenticationToken || '';
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  });

  // Apollo Client with dynamic headers
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  });

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={client}>
          <Context.Provider value={{ authenticationToken, setAuthenticationToken, searchTerm, setSearchTerm }}>
            <ThemeCustomization>
              {/* <RTLLayout> */}
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
              {/* </RTLLayout> */}
            </ThemeCustomization>
          </Context.Provider>
        </ApolloProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
