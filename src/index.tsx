import { createRoot } from 'react-dom/client';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// google-fonts
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/700.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';

// project import
import App from './App';
import { ConfigProvider } from 'contexts/ConfigContext';
import reportWebVitals from './reportWebVitals';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const container = document.getElementById('root');
const root = createRoot(container!);

const API_Key = "da2-wjepl4a6ezexfcqzry4xl4htji"

const client = new ApolloClient({
  uri: 'https://gh6hwmywzjfvlghrmqctqmo42u.appsync-api.me-central-1.amazonaws.com/graphql/', // Your AppSync endpoint
  cache: new InMemoryCache(),
  headers: {
    // If you're using AWS IAM or API Key for authentication, you need to add proper headers
    'x-api-key': API_Key,
  },
});

// ==============================|| MAIN - REACT DOM RENDER ||============================== //

root.render(
  <ApolloProvider client={client}>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
