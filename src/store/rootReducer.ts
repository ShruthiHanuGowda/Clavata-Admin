import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'], // persist auth and settings slices
};

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export default persistedReducer;
