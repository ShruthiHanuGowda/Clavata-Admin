import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
// import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

//appkit
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { arbitrum, mainnet } from '@reown/appkit/networks';

// auth-provider
// import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
import { LIST_USER_WALLETS } from 'graphql/queries';
import { createHttpLink, useQuery } from '@apollo/client';
import { createContext, useContext, useState } from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { SettingsProvider } from 'contexts/SettingsContext';
import { CHAINS } from 'chains';
import { fetchAuthSession } from 'aws-amplify/auth';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

// API Keys
const API_Key = import.meta.env.VITE_APP_AWS_APP_SYNC_GRAPHQL_APP_KEY;

// GraphQL URIs
const uri1 = import.meta.env.VITE_APP_AWS_APP_SYNC_GRAPHQL_USER_KEY;

// Define the shape of your context data (state)
interface ContextType {
  authenticationToken: string;
  setAuthenticationToken: (newValue: string) => void;
  searchTerm: any;
  setSearchTerm: any;
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

// Dynamic Authorization Header using setContext
// const authLink = setContext((_, { headers }) => {
//   // Retrieve token from local state (or Context API, if needed)
//   const token = localStorage.getItem('serviceToken'); // Or get from state/context
//   // const token = session.getAccessToken().getJwtToken();
//   // console.log("test token", token)
//   return {
//     headers: {
//       ...headers,
//       'x-api-key': API_Key,
//       Authorization: token ? `Bearer ${token}` : ''
//     }
//   };
// });

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_GRAPHQL_URL
});

// Create Apollo Client instances for each GraphQL endpoint
// const client = new ApolloClient({
//   link: new HttpLink({
//     uri: uri1,
//     headers: {
//       'x-api-key': API_Key,
//     },
//   }),
//   cache: new InMemoryCache(),
// });

// const client2 = new ApolloClient({
//   link: new HttpLink({
//     uri: uri2,
//     headers: {
//       'x-api-key': API_Key2,
//     },
//   }),
//   cache: new InMemoryCache(),
// });

export default function App() {
  // const context = useContext(Context);
  // const { authenticationToken }: any = context;
  const [authenticationToken, setAuthenticationToken] = useState(() => {
    return localStorage.getItem('serviceToken') || '';
  });
  const [searchTerm, setSearchTerm] = useState('');

  const authLink = setContext(async (_, { headers }) => {
    // const token = localStorage.getItem('serviceToken');;
    return {
      headers: {
        ...headers,
        Authorization: authenticationToken ? `Bearer ${authenticationToken}` : ''
      }
    };
  });

  // Apollo Client with dynamic headers
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  });
  return (
    <ApolloProvider client={client}>
      <Context.Provider value={{ authenticationToken, setAuthenticationToken, searchTerm, setSearchTerm }}>
        <ThemeCustomization>
          {/* <RTLLayout> */}
          <Locales>
            <ScrollTop>
              <AuthProvider>
                <SettingsProvider>
                  <Notistack>
                    <RouterProvider router={router} />
                    <Snackbar />
                  </Notistack>
                </SettingsProvider>
              </AuthProvider>
            </ScrollTop>
          </Locales>
          {/* </RTLLayout> */}
        </ThemeCustomization>
      </Context.Provider>
    </ApolloProvider>
  );
}
