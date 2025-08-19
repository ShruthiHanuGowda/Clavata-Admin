// utils/createApolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const createApolloClient = (uri: string) => {
  const httpLink = new HttpLink({ uri });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('serviceToken');
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache()
  });
};

export default createApolloClient;
