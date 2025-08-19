import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as ReduxProvider } from 'react-redux';
// project import
import App from './App';
import { store, persistor } from './store';
import reportWebVitals from './reportWebVitals';
import { ConfigProvider } from 'contexts/ConfigContext';
import './assets/styles/globalImports.ts';

//blog
import 'react-quill/dist/quill.snow.css';

const container = document.getElementById('root');
const root = createRoot(container!);

// ==============================|| MAIN - REACT DOM RENDER ||============================== //

root.render(
  <ReduxProvider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </PersistGate>
  </ReduxProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
