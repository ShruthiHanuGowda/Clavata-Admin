import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // persist only auth slice (add more slice names if needed)
};

const rootReducer = combineReducers({
  auth: authReducer
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export default persistedReducer;
