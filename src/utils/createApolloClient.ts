
import {
    ApolloClient,
    InMemoryCache,
    HttpLink
} from '@apollo/client';

// ============================================================
// APPSYNC CONFIGURATION
// ============================================================

const GRAPHQL_URL = import.meta.env.VITE_APP_GRAPHQL_URL;
const GRAPHQL_API_KEY = import.meta.env.VITE_APP_GRAPHQL_API_KEY;

// ============================================================
// VALIDATION
// ============================================================

if (!GRAPHQL_URL) {
    throw new Error(
        'VITE_APP_GRAPHQL_URL is not configured in .env'
    );
}

if (!GRAPHQL_API_KEY) {
    throw new Error(
        'VITE_APP_GRAPHQL_API_KEY is not configured in .env'
    );
}

// ============================================================
// HTTP LINK
// ============================================================

const httpLink = new HttpLink({
    uri: GRAPHQL_URL,

    headers: {
        'x-api-key': GRAPHQL_API_KEY
    }
});

// ============================================================
// APOLLO CLIENT
// ============================================================

const apolloClient = new ApolloClient({
    link: httpLink,

    cache: new InMemoryCache()
});

// ============================================================
// EXPORT
// ============================================================

export default apolloClient;

