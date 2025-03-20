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
import { createContext, useContext, useState } from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

// API Keys
const API_Key = 'da2-wjepl4a6ezexfcqzry4xl4htji'; // API key for first URI
const API_Key2 = 'da2-n5rv7b7ipngvvff25xfs3xlufi'; // API key for second URI

// GraphQL URIs
const uri1 = 'https://gh6hwmywzjfvlghrmqctqmo42u.appsync-api.me-central-1.amazonaws.com/graphql/';
const uri2 = 'https://tvmbdqb7gvfnhfggz6liar6ylm.appsync-api.me-central-1.amazonaws.com/graphql';

// Define the shape of your context data (state)
interface ContextType {
  authenticationToken: string,
  setAuthenticationToken: (newValue: string) => void;
}

// Create the Context
export const Context = createContext<ContextType | undefined>(undefined);

// Dynamic Authorization Header using setContext
const authLink = setContext((_, { headers }) => {
  // Retrieve token from local state (or Context API, if needed)
  const token = localStorage.getItem('serviceToken'); // Or get from state/context
  // const token = session.getAccessToken().getJwtToken();
  // console.log("test token", token)
  return {
    headers: {
      ...headers,
      'x-api-key': API_Key,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
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

// Apollo Client with dynamic headers
const client = new ApolloClient({
  link: authLink.concat(
    new HttpLink({
      uri: uri1,
    })
  ),
  cache: new InMemoryCache(),
});


const client2 = new ApolloClient({
  link: new HttpLink({
    uri: uri2,
    headers: {
      'x-api-key': API_Key2,
    },
  }),
  cache: new InMemoryCache(),
});

export default function App() {
  // const context = useContext(Context);
  // const { authenticationToken }: any = context;
  const [authenticationToken, setAuthenticationToken] = useState("");
  console.log("authenticationToken", authenticationToken)
  return (
    <ApolloProvider client={client} >
    <Context.Provider value={{ authenticationToken, setAuthenticationToken }}>
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
    </Context.Provider>
    </ApolloProvider>
  );
}
